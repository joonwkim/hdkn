'use server'

import { revalidatePath } from "next/cache";
import { setNodeSelected, updateExpandStatus } from "../services/menu";
import { TreeNode } from "../types/treeMenu";
import { deleteSelectedBlog, upsertBlog } from "../services/blogService";
import { Blog } from "@prisma/client";

export async function upsertBlogAction( userId:string, title:string, content:string ) {
    try {
        await upsertBlog({ userId, title, content });
        revalidatePath('/');
        return true;
    } catch (error) {
        console.log(error)
    }
}
export async function deleteSelectedBlogAction( blog:Blog) {
    try {
        const result = await deleteSelectedBlog(blog);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.log(error)
    }
}


