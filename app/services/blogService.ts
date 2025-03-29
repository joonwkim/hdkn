'use server'
import prisma from "@/prisma/prisma";
import { Blog, Prisma, User } from "@prisma/client";

export type BlogWithRefTable = Prisma.BlogGetPayload<{
    include: {
        author: true,
        categories: true,
        votes: true,
        parent: true,
        children: true,
        comments: true,
        tags: true,
    }
}>;


export async function getBlogs(): Promise<{ props: BlogWithRefTable[]; revalidate: number } | string> {
    try {
        // console.log("Fetching blogs...");

        const blogs = await prisma.blog.findMany({
            include: {
                author: true,
                categories: true,
                votes: true,
                parent: true,
                children: true,
                comments: true,
                tags: true,
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // console.log("Fetched blogs:", blogs);

        return {
            props: blogs, 
            revalidate: 10,
        };

    } catch (error) {
        console.error("Error fetching blogs:", error);
        return "Error fetching blogs"; 
    }
}

export async function upsertBlog({ userId, title, content }: { userId: string, title: string, content: string }) {
    try {
        console.log("upsert blogs...");
        const result = await prisma.blog.upsert({
            where: {
                title_authorId: {
                    authorId: userId,
                    title: title,
                },
            },
            create: {
                title: title,
                content: content,
                authorId: userId,
            },
            update: {
                content: content,
                updatedAt: new Date(),
            },
        })
        console.log("upsert blogs:", result);
        return result;
    } catch (error) {
        console.log('upsertBlog error:', error)
        return null;
    }
}
export async function deleteSelectedBlog(blog: Blog) {
    try {
        console.log("delte blog...");
        const result = await prisma.blog.delete({
            where: {
                id: blog.id
            },
        })
        console.log("delted blog:", result);
        return result;
    } catch (error) {
        console.log('delete blog error:', error)
        return false;
    }
}


