'use server'
import prisma from "@/prisma/prisma";
import { LexicalDocument } from "@prisma/client";
import { consoleLogFormDatas } from "../lib/formData";

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

export async function upsertLexicalDocument(content: string, imageFormData: FormData[], title: string, pathName: string, userId: string): Promise<LexicalDocument | null> {
    try {

        // check and get imagenary urls if not create and get url
        // replace image node src of content into imagenary url
        // save content
        // return true;

        // await getCloudinaryImageIds(imageFormData);

        // console.log('ids: ', ids)

        consoleLogFormDatas('upsertLexicalDocument: ', imageFormData)
        console.log('content: ', content)
        console.log('title: ', title)
        console.log('pathName: ', pathName)
        console.log('userId: ', userId)
        console.log('images: ', imageFormData.length)
        // imageFormData.forEach(fd => {
        //     if (fd) {
        //         const formDataObj = Object.fromEntries(fd.entries());
        //         const filea = formDataObj['file'] as File;
        //         console.log('File name:', filea.name);
        //     }
        // })
        return null;
    } catch (error) {
        console.log('createLexicalDocument error:', error)
        return null;
    }
}
