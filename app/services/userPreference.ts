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
export async function updateUserPreferenceForSelectedBlog(userId: string, selectedBlogId: string | null | undefined, blogsViewType: string, currentPage: number) {
    if (userId) {
        const preference = await prisma.userPreference.upsert({
            where: { userId: userId },
            update: { selectedBlogId, blogsViewType, currentPage },
            create: { selectedBlogId, userId: userId, currentPage },
        });
        // console.log('updateUserPreferenceForSelectedBlog: ', preference)
        return preference;
    }

}
export async function saveUserPreference(userId: any, blogsViewType: string, currentPage: number, blogsPerPage: number, selectedBlogId?: string | null) {
    if (userId) {
        const preference = await prisma.userPreference.upsert({
            where: { userId: userId },
            update: { blogsViewType, currentPage, blogsPerPage: blogsPerPage, selectedBlogId },
            create: { userId: userId, blogsViewType, currentPage, blogsPerPage: blogsPerPage, selectedBlogId },
        });
        console.log('saveUserPreference: ', preference)
        return preference;
    }
}

// export async function saveUserPreference({ userId, viewType, blogsPerPage }: { userId: string, viewType: string, blogsPerPage: number }) {
//     try {
//         // console.log('saveUserPreference viewType: ', userId, viewType, blogsPerPage)
//         let result;
//         const up = await prisma.userPreference.findFirst({ where: { userId: userId } })
//         if (!up) {
//             result = await prisma.userPreference.create({
//                 data: {
//                     userId: userId,
//                     blogsViewType: viewType,
//                     blogsPerPage: blogsPerPage,
//                 }
//             })
//             // console.log('saveUserPreference userPreference created: ', result)
//         } else {
//             result = await prisma.userPreference.update({
//                 where: {
//                     userId: userId,
//                 },
//                 data: {
//                     viewType: viewType,
//                     blogsViewType: viewType,
//                     blogsPerPage: blogsPerPage,

//                 }
//             })
//             // console.log('saveUserPreference userPreference updated: ', result)
//         }
//         // console.log('saveUserPreference result:', result)
//         const session = await getServerSession(authOptions);
//         if (!session?.user?.email) {
//             throw new Error('Unauthorized');
//         }
//         return result;
//     } catch (error) {
//         console.log('saveUserPreference error: ', error)
//     }

// }
// export async function saveCurrentPageToPreference(userId: string, currentPage: number) {
//     if (userId) {
//         const preference = await prisma.userPreference.upsert({
//             where: { userId: userId },
//             update: { currentPage, },
//             create: { currentPage, userId: userId },
//         });
//         // console.log('saveCurrentPage: ', preference)
//         return preference;
//     }

// }