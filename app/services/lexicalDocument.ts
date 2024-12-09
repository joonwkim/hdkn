'use server'
import prisma from "@/prisma/prisma";

export async function getLexicalDocumentByPath(path:string) {
    try {
        const doc = await prisma.lexicalDocument.findFirst({
            where: {
                title:path,
            }
        });
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

export async function createLexicalDocument(content: string, pathName:string) {
    try {
        console.log('content: ', content)
        const result = await prisma.lexicalDocument.create({
            data: {
                title: pathName,
                content: content,
           }
        })
        console.log('result: ', result)
        return result;
    } catch (error) {
        console.log('createLexicalDocument error:', error)
    }
}
export async function upsertLexicalDocument(content: string, pathName:string) {
    try {
        console.log('content: ', content)
        console.log('pathName: ', pathName)
        const result = await prisma.lexicalDocument.upsert({
            where: {
                title: pathName,
            },
            update: {

                content: content,
            },
            create: {
                title: pathName,
                content: content
            }
        })
        console.log('result: ', result)
        return result;             
    } catch (error) {
        console.log('createLexicalDocument error:', error)
    }
}
