'use server'

import { revalidatePath } from "next/cache"
import { upsertLexicalDocument } from "../services/lexicalDocument"
import { ImageNodeBlobData } from "../lib/types";

export async function upsertLexicalDocumentAction(content: string, images: ImageNodeBlobData[], title: string, pathName: string, userId: string) {
    try {
        await upsertLexicalDocument(content, images, title, pathName, userId);
        revalidatePath('/')
    } catch (error) {
        console.log(error)
    }
}