"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSession } from "next-auth/react";
import { Blog } from "@prisma/client";
import { BlogWithRefTable } from "@/app/services/blogService";
import { deleteSelectedBlogAction, upsertBlogAction } from "@/app/actions/blog";
import './styles.css'

type BlogsProps = {
    blogs: BlogWithRefTable[]
}

const BulletinBoard = ({ blogs }: BlogsProps) => {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [blogsPerPage, setBlogPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("summary");
    const [isWriting, setIsWriting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false)
    const [showSettings, setShowSettings] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const totalPages = Math.ceil(blogs.length / blogsPerPage) || 1;
    const startIndex = (currentPage - 1) * blogsPerPage;
    const paginatedBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

    const handleFocus = () => {
        const inputElement = document.getElementById("contentTextarea") as HTMLInputElement;
        if (inputElement) {
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }
    };

    const onBlogSelected = (blog: Blog) => {
        if (blog.authorId === session?.user.id) {
            setSelectedBlog(blog)


        }
    }

    const handleNewBlogClick = () => {
        if (!session?.user) {
            alert('등록된 사용자만 작성할 수 있습니다.')
        } else {
            setIsWriting(true);
        }
    };
    const handleEditBlogClick = async () => {
        if (selectedBlog) {
            setIsWriting(true);
            setIsUpdating(true);
            setTitle(selectedBlog.title);
            setContent(selectedBlog.content);
            handleFocus();
        }
    };
    const handleDeleteBlogClick = async () => {
        if (selectedBlog) {
            await deleteSelectedBlogAction(selectedBlog);
        }
    };

    const addBlog = () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해주세요!");
            return;
        }
        const result = upsertBlogAction(session?.user.id, title, content)
        setTitle("");
        setContent("");
        setIsWriting(false);
        setIsUpdating(false);
        setSelectedBlog(null);
    };

    const handleLike = (blogId: string) => {
        if (!session?.user) {
            alert('로그인 하셔서 의견주세요.')
        }
        // if (selectedBlog != null && selectedBlog.author === session?.user.name) {
        //     alert('자신의 글에는 의견표시할 수 없습니다.')
        // } else {
        //     setBlogs(blogs.map(blog =>
        //         blog.id === blogId ? { ...blog, likes: blog.likes + 1 } : blog
        //     ));
        // }
    };

    const handleDislike = (blogId: string) => {
        if (!session?.user) {
            alert('로그인 하셔서 의견주세요.')
        }
        // if (selectedBlog != null && selectedBlog.author === session?.user.name) {
        //     alert('자신의 글에는 의견표시할 수 없습니다.')
        // }
        // else {
        //     setBlogs(blogs.map(blog =>
        //         blog.id === blogId ? { ...blog, dislikes: blog.dislikes + 1 } : blog
        //     ));
        // }
    };

    const handleCommentChange = (blogId: number, value: string) => {
        setCommentInputs({ ...commentInputs, [blogId]: value });
    };

    const addComment = (blogId: string) => {
        // if (!commentInputs[blogId]) return;
        // setBlogs(blogs.map(blog =>
        //     blog.id === blogId ? { ...blog, comments: [...blog.comments, commentInputs[blogId]] } : blog
        // ));
        // setCommentInputs({ ...commentInputs, [blogId]: "" });
    };

    const renderPagination = () => {
        const maxVisiblePages = 5; // Adjust this to show more/less pages around the current one
        const pages = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages if totalPages is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1); // Always show first page

            let start = Math.max(2, currentPage - 2);
            let end = Math.min(totalPages - 1, currentPage + 2);

            if (start > 2) {
                pages.push("..."); // Add ellipsis if skipping pages
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push("...");
            }

            pages.push(totalPages); // Always show last page
        }

        return (
            <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} title="이전으로 가기"><i className="bi bi-chevron-double-left"></i></button>
                </li>
                {pages.map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? "active" : ""}`}>
                        {typeof page === "number" ? (
                            <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                        ) : (
                            <span className="page-link">...</span> // Ellipsis
                        )}
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} title="다음으로"><i className="bi bi-chevron-double-right"></i></button>
                </li>
            </ul>
        );
    };

    const handleMouseEnter = (blog: Blog) => {
        setSelectedBlog(blog);
    }
    const handleMouseLeave = (blog: Blog) => {
        setSelectedBlog(null)
    }

    return (
        <div className="container parent">
            <div className="d-flex justify-content-between align-items-center border-bottom p-2 sticky-child z-3">
                <div className="flex-grow-1 text-center">
                    <h2>자유게시판</h2>
                </div>
                <div className="me-3">
                    <button className="btn btn-outline-secondary btn-sm me-2" title="글쓰기" onClick={handleNewBlogClick} disabled={isWriting}>
                        <i className="bi bi-file-plus"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="변경하기" onClick={handleEditBlogClick} disabled={!selectedBlog}>
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="삭제하기" onClick={handleDeleteBlogClick} disabled={!selectedBlog}>
                        <i className="bi bi-trash"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="요약형태보기" onClick={() => setViewMode("summary")}>
                        <i className="bi bi-view-stacked"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="카드형태보기" onClick={() => setViewMode("card")}>
                        <i className="bi bi-grid"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="카드형태보기" onClick={() => setViewMode("table")}>
                        <i className="bi bi-table"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" title="blogSetting" onClick={() => setShowSettings(!showSettings)}>
                        <i className="bi bi-gear"></i>
                    </button>
                </div>
            </div>
            <div>
                {isWriting && (
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isUpdating}
                        />
                        <textarea
                            id="contentTextarea"
                            className="form-control mb-2"
                            placeholder="Write your message..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button className="btn btn-secondary me-2" onClick={() => setIsWriting(false)}>취소</button>
                        <button className="btn btn-primary me-2" onClick={() => addBlog()}>저장</button>
                    </div>
                )}

                {showSettings && (
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Settings</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowSettings(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label><strong>Blogs per Page:</strong></label>
                                    <input
                                        type="number"
                                        title="blogsetting"
                                        className="form-control w-auto d-inline-block"
                                        value={blogsPerPage}
                                        onChange={(e) => setBlogPerPage(Number(e.target.value))}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={() => setShowSettings(false)}>닫기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {viewMode === "summary" && (
                        <div>
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className="border-bottom p-2" onClick={() => onBlogSelected(blog)}>
                                    <h5>{blog.title}</h5>
                                    <strong>{blog.author.name}</strong> - <small>{blog.updatedAt.toDateString()}</small>
                                    <p>{blog.content}</p>
                                    {/* Like & Dislike Buttons */}
                                    <div className="d-flex align-items-center gap-2" onMouseEnter={() => handleMouseEnter(blog)} onMouseLeave={() => handleMouseLeave(blog)}>
                                        <button className="btn btn-outline-success btn-sm" onClick={() => handleLike(blog.id)} disabled={selectedBlog?.id === blog.id}>
                                            👍 {blog.likes}
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDislike(blog.id)} disabled={selectedBlog?.id === blog.id}>
                                            👎 {blog.dislikes}
                                        </button>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => addComment(blog.id)}>
                                            💬 Comment ({blog.comments.length})
                                        </button>
                                    </div>

                                    {/* Comment Input */}
                                    {/* <div className="mt-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Write a comment..."
                                        value={commentInputs[blog.id] || ""}
                                        onChange={(e) => handleCommentChange(blog, e.target.value)}
                                    />
                                </div> */}

                                    {/* Comments List */}
                                    {blog.comments.length > 0 && (
                                        <ul className="list-group list-group-flush mt-2">
                                            {blog.comments.map((comment, index) => (
                                                <li key={index} className="list-group-item small">
                                                    💬
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {viewMode === "card" && (
                        <div className="row">
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className="col-md-4 mb-3">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{blog.title}</h5>
                                            <p className="card-text">{blog.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {viewMode === "table" && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBlogs.map((blog) => (
                                    <tr key={blog.id}>
                                        <td>{blog.title}</td>
                                        <td>{blog.content}</td>
                                        <td>{blog.updatedAt.toDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <nav className="mt-3">
                        {renderPagination()}
                    </nav>
                )}
            </div>
        </div>
    );
}
export default BulletinBoard;

