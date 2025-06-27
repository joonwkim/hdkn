"use server";

import { revalidatePath } from "next/cache";
import { updateUserPreferenceForSelectedBlog, updateUserThemePreference } from "../services/userPreference";
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
export async function updateUserPreferenceForSelectedBlogAction(userId: string, blogId: string | null, viewType: string) {
    const result = await updateUserPreferenceForSelectedBlog(userId, blogId, viewType);
    revalidatePath('/bulletinBoard');
    return result;
}
export async function saveUserPreference({ userId, viewType, pageSize }: { userId: string, viewType: string, pageSize: number }) {
    try {
        // console.log('saveUserPreference viewType: ', userId, viewType, pageSize)
        let result;
        const up = await prisma.userPreference.findFirst({ where: { userId: userId } })
        if (!up) {
            result = await prisma.userPreference.create({
                data: {
                    userId: userId,
                    blogsViewType: viewType,
                    pageSize: pageSize,
                }
            })
            // console.log('saveUserPreference userPreference created: ', result)
        } else {
            result = await prisma.userPreference.update({
                where: {
                    userId: userId,
                },
                data: {
                    viewType: viewType,
                    pageSize: pageSize,
                    blogsViewType: viewType,
                }
            })
            // console.log('saveUserPreference userPreference updated: ', result)
        }
        // console.log('saveUserPreference result:', result)
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            throw new Error('Unauthorized');
        }
        return result;
    } catch (error) {
        console.log('saveUserPreference error: ', error)
    }


    // const result = await prisma.userPreference.update({
    //     where: {
    //         userId: userId,
    //     },
    //     data: {
    //         viewType: viewType,
    //         pageSize: pageSize,
    //     }
    // })

    // console.log('saveUserPreference:', result)

    // console.log('session user: ', session.user.preference)

    // await prisma.user.update({
    //     where: { email: session.user.email },
    //     data: { preference: { ...result } },
    // });


}
export async function saveUserPreferenceAction({ userId, viewType, pageSize }: { userId: string, viewType: string, pageSize: number }) {
    // console.log('saveUserPreferenceAction userId: ', userId)
    await saveUserPreference({ userId, viewType, pageSize })
    revalidatePath('/');
}
