'use server'
import prisma from "@/prisma/prisma";
import { LexicalDocument } from "@prisma/client";
import { ImageNodeBlobData } from "../lib/types";

export async function getLexicalDocumentByPath(path: string): Promise<{ props: LexicalDocument, revalidate: number } | null> {
    try {
        const doc = await prisma.lexicalDocument.findFirst({
            where: {
                url: path,
            },
            include: {
                author: true,
            }
        });
        if (doc) {
            return { props: doc, revalidate: 10 }
        }
        return null;
        // return {
        //     props: {
        //         doc,
        //     },
        //     // Revalidate every 10 seconds
        //     revalidate: 10,
        // };
    } catch (error) {
        console.log('getLexicalDocumentByPath error: ', error)
        return null;
    }
}

export async function getLexicalDocumentByUserIdAndPath(userId: string, path: string) {
    try {
        const doc = await prisma.lexicalDocument.findFirst({
            where: {
                url: path,
                userId: userId,
            },
            include: {
                author: true,
            }
        });
        console.log('getLexicalDocumentByUserIdAndPath: ', doc)
        return {
            props: {
                doc,
            },
            // Revalidate every 10 seconds
            revalidate: 10,
        };
    } catch (error) {
        return ({ error });
    }
}
export async function getLexicalDocuments() {
    try {
        const docs = await prisma.lexicalDocument.findMany({});
        return {
            props: {
                docs,
            },
            // Revalidate every 10 seconds
            revalidate: 10,
        };
    } catch (error) {
        return ({ error });
    }
}

export async function upsertLexicalDocument(content: string, images: ImageNodeBlobData[], title: string, pathName: string, userId: string): Promise<LexicalDocument | null> {
    try {
        console.log('content: ', content)
        console.log('images: ', images)
        const result = await prisma.lexicalDocument.upsert({
            where: {
                userId_title: {
                    userId,
                    title,
                },
            },
            update: {
                content: content,
            },
            create: {
                title: title,
                url: pathName,
                content: content,
                userId: userId,
                // images: {
                //     createMany: {
                //         data: {
                //             images.map((image) => ({
                //                 id: image.id,
                //                 data: image.data,
                //             }))
                //         }
                //     }
                // }
            }
        })

        // const imageData = images.map((image) => ({
        //     lexicalDocId: result.id,
        //     data: Buffer.from(image.data),
        //     contentType: image.contentType,
        // }));

        // await prisma.image.createMany
        // console.log('result: ', result)
        return result;   

        // return null;
    } catch (error) {
        console.log('createLexicalDocument error:', error)
        return null;
    }
}
