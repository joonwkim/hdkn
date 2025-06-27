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
    // forks: true,
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
        // forks: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    // blogs.forEach((b) => {
    //   console.log('blog: ', b.createdAt.toDateString(), b.title)
    // })
    // console.log("Fetched blogs:", blogs);
    return {
      props: blogs,
      revalidate: 0,
    };

  } catch (error) {
    console.error("Error fetching blogs:", error);
    return "Error fetching blogs";
  }
}

export async function createNewBlog({ userId, title, content }: { userId: string, title: string, content: string }) {
  try {
    // console.log("upsert blog title: ", title);
    const result = await prisma.blog.create({
      data: {
        authorId: userId,
        title: title,
        content: content,
      }
    })
    // console.log("create new blog result:", result);
    return result;
  } catch (error) {
    console.log('upsertBlog error:', error)
    return null;
  }
}
export async function updateBlog({ blogId, content }: { blogId: string, content: string }) {
  try {
    // console.log("upsert blog title: ", title);
    const result = await prisma.blog.update({
      where: {
        id: blogId,
      },
      data: {
        content: content,
      }
    })
    // console.log("upsert blog result:", result);
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
    // console.log("delte blog...");
    const result = await prisma.blog.delete({
      where: {
        id: blog.id
      },
    })
    // console.log("deleted blog:", result);
    return result;
  } catch (error) {
    console.log('delete blog error:', error)
    return false;
  }
}
export async function upsertVoteOnBlog({ userId, blogId, thumbsStatus, forked }: { userId: string; blogId: string; thumbsStatus: ThumbsStatus | undefined | null; forked: boolean | undefined }) {
  try {
    // console.log('upsertVoteOnBlog:', userId, blogId, thumbsStatus, forked)
    const result = await prisma.vote.upsert({
      where: {
        voterId_blogId: { voterId: userId, blogId },
      },
      update: {
        thumbsStatus,
        forked: forked,
      },
      create: {
        voterId: userId,
        blogId,
        thumbsStatus,
        forked,
      },
    });

    return result;
  } catch (err) {
    console.error("voteOnBlog error:", err);
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