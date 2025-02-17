'use server'
import prisma from "@/prisma/prisma";
import { LexicalDocument } from "@prisma/client";

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

export async function upsertLexicalDocument(content: string, title: string, pathName: string, userId: string): Promise<LexicalDocument | null> {
    try {
        const result = await prisma.lexicalDocument.upsert({
            where: {
                userId_title: {
                    userId: userId,
                    title: title,
                },
            },
            create: {
                title: title,
                content: content,
                userId: userId,
                url: pathName,
            },
            update: {
                content: content,
                updatedAt: new Date(),
            }
        })

        // console.log('upsertLexicalDocument :', result)
        return result;
    } catch (error) {
        console.log('createLexicalDocument error:', error)
        return null;
    }
}
