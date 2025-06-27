'use server'
import { revalidatePath } from "next/cache";
import { createNewBlog, deleteSelectedBlog, getBlogs, recordBlogView, updateBlog, upsertBlogComment, upsertVoteOnBlog, voteOnComment } from "../services/blogService";
import { Blog, ThumbsStatus } from "@prisma/client";

export async function createNewBlogAction(userId: string, title: string, content: string) {
    // console.log('upsertBlogAction title:', title)
    await createNewBlog({ userId, title, content });
    revalidatePath('/bulletinBoard');
    return true;
}
export async function updateBlogAction(blogId: string, content: string) {
    // console.log('upsertBlogAction title:', title)
    await updateBlog({ blogId, content });
    revalidatePath('/bulletinBoard');
    return true;
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

