'use server'

import { revalidatePath } from "next/cache"
import { createLexicalDocument, upsertLexicalDocument } from "../services/lexicalDocument"

export async function createLexicalDocumentAction(content:string, pathName:string) {
    try {
        await createLexicalDocument(content, pathName)
        revalidatePath('/')
    } catch (error) {
        console.log(error)
    }
}
export async function upsertLexicalDocumentAction(content:string, pathName:string) {
    try {
        await upsertLexicalDocument(content, pathName)
        revalidatePath('/')
    } catch (error) {
        console.log(error)
    }
}