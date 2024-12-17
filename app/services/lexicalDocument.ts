'use server'
import prisma from "@/prisma/prisma";
import { LexicalDocument } from "@prisma/client";

export async function getLexicalDocumentByPath(path: string) {
    try {
        const doc = await prisma.lexicalDocument.findFirst({
            where: {
                url: path,
            },
            include: {
                author: true,
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
        // console.log('content: ', content)
        // console.log('pathName: ', title)
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
            }
        })
        console.log('result: ', result)
        return result;       
    } catch (error) {
        console.log('createLexicalDocument error:', error)
        return null;
    }
}
