'use server'

import { revalidatePath } from "next/cache"
import { upsertLexicalDocument } from "../services/lexicalDocument"

export async function upsertLexicalDocumentAction(content: string, title: string, pathName: string, userId: string) {
    try {
        await upsertLexicalDocument(content, title, pathName, userId);
        revalidatePath('/')
    } catch (error) {
        console.log(error)
    }
}