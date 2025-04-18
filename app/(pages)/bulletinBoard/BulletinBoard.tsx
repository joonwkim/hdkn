"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSession } from "next-auth/react";
import { Blog, ThumbsStatus, User } from "@prisma/client";
import { BlogWithRefTable } from "@/app/services/blogService";
import { deleteSelectedBlogAction, upsertBlogAction, voteOnBlogAction } from "@/app/actions/blog";
import './styles.css'
import '../../lib/date'
import BlogFooter from "./components/BlogFooter";
import BlogComment from "./components/BlogComment";

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
    const [selectedBlog, setSelectedBlog] = useState<BlogWithRefTable | null>(null);
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

    const onBlogSelected = (blog: BlogWithRefTable) => {
        setSelectedBlog(blog)
    }

    const handleNewBlogClick = () => {
        if (!session?.user) {
            alert('로그인 사용자만 게시판 글을 작성할 수 있습니다.')
        } else {
            setIsWriting(true);
        }
    };
    const handleEditBlogClick = async () => {
        if (!session?.user) {
            alert('로그인 사용자만 게시판 글을 편집 수 있습니다.')
        }
        else {
            if (selectedBlog) {
                if (selectedBlog.authorId !== session.user.id) {
                    alert('작성자만 수정할 수 있습니다.')
                } else {
                    setIsWriting(true);
                    setIsUpdating(true);
                    setTitle(selectedBlog.title);
                    setContent(selectedBlog.content);
                    handleFocus();
                }

            } else {
                alert('수정하고자 하는 게시글을 선택하세요.')
            }
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
        alert('handleLike')
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

    const handleMouseEnter = (blog: BlogWithRefTable) => {
        setSelectedBlog(blog);
    }
    const handleMouseLeave = (blog: BlogWithRefTable) => {
        setSelectedBlog(null)
    }
    const checkLoginStatus = (blog: BlogWithRefTable) => {
        if (!session) {
            alert('로그인을 하셔야 선택할 수 있습니다.');
            return false;
        }
        else if (session?.user?.id === blog.author?.id) {
            alert('작성자는 자기에게 좋아요를 선택할 수 없습니다.');
            return false;
        }
        return true;
    };

    const handleVote = async (blog: BlogWithRefTable, status: ThumbsStatus) => {
        if (checkLoginStatus(blog)) {
            await voteOnBlogAction({ userId: session?.user.id, blogId: blog.id, thumbsStatus: status })
        }
    }
    const handleforked = async (blog: BlogWithRefTable, status: ThumbsStatus) => {
        if (checkLoginStatus(blog)) {
            // await voteOnBlogAction({ userId: session?.user.id, blogId: blog.id, thumbsStatus: status })
        }
    }

    return (
        <div>
            {/* toolbar controls */}
            <div className="d-flex justify-content-between align-items-center border-bottom p-2 sticky-child z-3">
                <div className="flex-grow-1 text-center">
                    <h2>자유게시판</h2>
                </div>
                <div className="me-3">
                    <button className="btn btn-outline-secondary btn-sm me-2" title="글쓰기" onClick={handleNewBlogClick} disabled={isWriting}>
                        <i className="bi bi-file-plus"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="변경하기" onClick={handleEditBlogClick} >
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
                    <button className="btn btn-outline-secondary btn-sm" title="페이지 세팅" onClick={() => setShowSettings(!showSettings)}>
                        <i className="bi bi-gear"></i>
                    </button>
                </div>
            </div>
            <div className="blog-content">
                {/* 글 작성하기 */}
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
                {/* 보기형태 */}
                <div>
                    {/* 요약보기 */}
                    {viewMode === "summary" && (
                        <div>
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className="border-bottom p-2" onClick={() => onBlogSelected(blog)}>
                                    <h5>{blog.title}</h5>
                                    <strong>{blog.author.name}</strong> - <small>{blog.updatedAt.toKrDateString()}</small>
                                    <p>{blog.content}</p>
                                    {/* Like & Dislike Buttons */}
                                    <BlogFooter blog={blog} handleVote={handleVote} handleforked={handleforked} />
                                    {/* <button className="btn btn-outline-primary btn-sm" onClick={() => addComment(blog.id)}>
                                        💬 Comment ({blog.comments.length})
                                    </button> */}

                                    {/* Comments List */}
                                    {/* {blog.comments.length > 0 && (
                                        <ul className="list-group list-group-flush mt-2">
                                            {blog.comments.map((comment, index) => (
                                                <li key={index} className="list-group-item small themed-icon">
                                                    💬
                                                </li>
                                            ))}
                                        </ul>
                                    )} */}
                                    <BlogComment blog={blog} handleVote={handleVote} handleforked={handleforked} />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* 카드보기 */}
                    {viewMode === "card" && (
                        <div className="row">
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className="col-md-4 mb-3" onClick={() => onBlogSelected(blog)}>
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
                    {/* 테이블보기 */}
                    {viewMode === "table" && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                    <th>조회</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBlogs.map((blog) => (
                                    <tr key={blog.id} onClick={() => onBlogSelected(blog)}>
                                        <td>{blog.title}</td>
                                        <td>{blog.content}</td>
                                        <td>{blog.author.name}</td>
                                        <td>{blog.updatedAt.toKrDateString()}</td>
                                        <td>{blog.viewCount}</td>
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
                {/* Pagination settings */}
                {showSettings && (
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">페이지 세팅</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowSettings(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="me-2"><strong>페이지당 게시글 수:</strong></label>
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
            </div>
        </div>
    );
}
export default BulletinBoard;

