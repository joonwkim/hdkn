'use server'
import prisma from "@/prisma/prisma";
import { Blog, LexicalDocument, User } from "@prisma/client";

export async function getBlogs() {
    try {
        const blogs = await prisma.blog.findMany({});
        return {
            props: {
                blogs,
            },
            revalidate: 10,
        };
    } catch (error) {
        return ({ error });
    }
}

export async function upsertBlog(content: string, title: string, userId: string): Promise<Blog | null> {
    try {
        const result = await prisma.blog.upsert({
            where: {
                title_blogerId: {
                    blogerId: userId,
                    title: title,
                },
            },
            create: {
                title: title,
                content: content,
                blogerId: userId,
            },
            update: {
                content: content,
                updatedAt: new Date(),
            }
        })
        return result;
    } catch (error) {
        console.log('upsertBlog error:', error)
        return null;
    }
}
