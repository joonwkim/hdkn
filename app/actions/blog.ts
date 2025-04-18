'use server'

import { revalidatePath } from "next/cache";
import { setNodeSelected, updateExpandStatus } from "../services/menu";
import { TreeNode } from "../types/treeMenu";
import { deleteSelectedBlog, forkBlog, recordBlogView, upsertBlog, upsertBlogComment, voteOnBlog, voteOnComment } from "../services/blogService";
import { Blog, ThumbsStatus } from "@prisma/client";

export async function upsertBlogAction(userId: string, title: string, content: string) {
    try {
        await upsertBlog({ userId, title, content });
        revalidatePath('/bulletinBoard');
        return true;
    } catch (error) {
        console.log(error)
    }
}

export type UpsertCommentInput = {
    id?: string;
    commenterId: string;
    blogId: string;
    comment: string;
};

export async function upsertBlogCommentAction({ id, commenterId, blogId, comment, }: UpsertCommentInput) {
    try {
        await upsertBlogComment({ id, commenterId, blogId, comment, });
        revalidatePath('/bulletinBoard');
        return true;
    } catch (error) {
        console.log(error)
    }
}

export async function deleteSelectedBlogAction(blog: Blog) {
    try {
        const result = await deleteSelectedBlog(blog);
        revalidatePath('/bulletinBoard');
        return true;
    } catch (error) {
        console.log(error)
    }
}

export async function voteOnBlogAction({ userId, blogId, thumbsStatus, }: { userId: string; blogId: string; thumbsStatus: ThumbsStatus; }) {
    const result = await voteOnBlog({ userId, blogId, thumbsStatus, });
    revalidatePath('/bulletinBoard');
    return true;
}

export async function forkBlogAction({ userId, blogId, }: { userId: string; blogId: string; }) {
    const result = await forkBlog({ userId, blogId, });
    revalidatePath('/bulletinBoard');
    return true;
}

export async function recordBlogViewAction({ userId, blogId, }: { userId: string; blogId: string; }) {
    const result = await recordBlogView({ userId, blogId, });
    revalidatePath('/bulletinBoard');
    return true;
}

export async function voteOnCommentAction({ userId, commentId, blogId, thumbsStatus, }: { userId: string; commentId: string; blogId: string; thumbsStatus: ThumbsStatus; }) {
    const result = await voteOnComment({ userId, commentId, blogId, thumbsStatus, });
    revalidatePath('/bulletinBoard');
    return true;
}




