'use server'
import prisma from "@/prisma/prisma";
import { Blog, Prisma, ThumbsStatus, User } from "@prisma/client";
import { includes } from "lodash-es";
import { UpsertCommentInput } from "../actions/blog";

export type BlogWithRefTable = Prisma.BlogGetPayload<{
  include: {
    author: true,
    categories: true,
    parent: true,
    children: true,
    comments: {
      include: {
        commenter: true,
        votes: {
          include: {
            voter: true,
          }
        }
      }
    },
    votes: {
      include: {
        voter: true,
      }
    },
    views: true,
    forks: true,
    tags: true,
  }
}>;

export async function getBlogs(): Promise<{ props: BlogWithRefTable[]; revalidate: number } | string> {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: true,
        categories: true,
        parent: true,
        children: true,
        comments: {
          include: {
            commenter: true,
            votes: {
              include: {
                voter: true,
              }
            },
          }
        },
        votes: {
          include: {
            voter: true,
          }
        },
        views: true,
        forks: true,
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
    // console.log("upsert blogs:", result);
    return result;
  } catch (error) {
    console.log('upsertBlog error:', error)
    return null;
  }
}

export async function upsertBlogComment({ id, commenterId, blogId, comment, }: UpsertCommentInput) {
  try {
    if (id) {
      const existing = await prisma.comment.findUnique({ where: { id } });
      if (existing) {
        const updated = await prisma.comment.update({
          where: { id },
          data: {
            comment,
            updatedAt: new Date(),
          },
        });
        return updated;
      }
    }
    const created = await prisma.comment.create({
      data: {
        commenterId,
        blogId,
        comment,
      },
    });

    return created;
  } catch (error) {
    console.error("upsertBlogComment error:", error);
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

export async function voteOnBlog({ userId, blogId, thumbsStatus, }: { userId: string; blogId: string; thumbsStatus: ThumbsStatus; }) {
  try {
    console.log('voteOnBlog:', userId, blogId, thumbsStatus,)
    const result = await prisma.vote.upsert({
      where: {
        voterId_blogId: { voterId: userId, blogId },
      },
      update: {
        thumbsStatus,
      },
      create: {
        voterId: userId,
        blogId,
        thumbsStatus,
      },
    });
    console.log('voteOnBlog:', result)
    return result;
  } catch (err) {
    console.error("voteOnBlog error:", err);
    return null;
  }
}

export async function forkBlog({ userId, blogId, }: { userId: string; blogId: string; }) {
  try {
    const result = await prisma.blogFork.upsert({
      where: {
        unique_blog_fork: { blogId, userId },
      },
      update: {
        forkedAt: new Date(),
      },
      create: {
        blogId,
        userId,
      },
    });
    return result;
  } catch (err) {
    console.error("forkBlog error:", err);
    return null;
  }
}

export async function recordBlogView({ userId, blogId, }: { userId: string; blogId: string; }) {
  try {
    const result = await prisma.blogView.upsert({
      where: {
        unique_blog_view: { blogId, userId },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        blogId,
        userId,
      },
    });
    return result;
  } catch (err) {
    console.error("recordBlogView error:", err);
    return null;
  }
}

export async function voteOnComment({ userId, commentId, blogId, thumbsStatus, }: { userId: string; commentId: string; blogId: string; thumbsStatus: ThumbsStatus; }) {
  try {
    const result = await prisma.vote.upsert({
      where: {
        voterId_blogId: { voterId: userId, blogId }, // same unique constraint
      },
      update: {
        thumbsStatus,
        commentId,
      },
      create: {
        voterId: userId,
        blogId,
        commentId,
        thumbsStatus,
      },
    });
    return result;
  } catch (err) {
    console.error("voteOnComment error:", err);
    return null;
  }
}


