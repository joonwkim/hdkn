"use server";

import { revalidatePath } from "next/cache";
import { saveUserPreference, updateUserPreferenceForSelectedBlog, updateUserThemePreference } from "../services/userPreference";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/prisma/prisma";
import { upsertVoteOnBlog } from "../services/blogService";
import { ThumbsStatus } from "@prisma/client";

export async function toggleTheme(current: "light" | "dark") {
    const nextTheme = current === "light" ? "dark" : "light";
    await updateUserThemePreference(nextTheme);
    console.log('toggleTheme: ', nextTheme)
    return nextTheme;

}
export async function updateUserPreferenceForSelectedBlogAction(userId: string, blogId: string | null | undefined, viewType: string, currentPage: number) {
    const result = await updateUserPreferenceForSelectedBlog(userId, blogId, viewType, currentPage);
    revalidatePath('/bulletinBoard');
    return result;
}
export async function saveUserPreferenceAction(userId: any, blogsViewType: string, currentPage: number, blogsPerPage: number, selectedBlogId?: string | null) {
    await saveUserPreference(userId, blogsViewType, currentPage, blogsPerPage, selectedBlogId);
    // revalidatePath('/bulletinBoard');
}