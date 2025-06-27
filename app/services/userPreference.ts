import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/prisma/prisma";
import { User } from "@prisma/client";

export async function getUserPreferences() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { preference: true },
    });

    return user?.preference;
}
export async function updateUserThemePreference(theme: "light" | "dark") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return null;

    return await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: { theme },
        create: { theme, userId: user.id },
    });
}
export async function updateUserPreferenceForSelectedBlog(userId: string, selectedBlogId: string | null, blogsViewType: string) {
    if (userId) {
        const preference = await prisma.userPreference.upsert({
            where: { userId: userId },
            update: { selectedBlogId, blogsViewType },
            create: { selectedBlogId, userId: userId },
        });
        // console.log('updateUserPreferenceForSelectedBlog: ', preference)
        return preference;
    }

}