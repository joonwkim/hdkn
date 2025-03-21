"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSession } from "next-auth/react";

type Post = {
    id: number;
    author: string;
    title: string;
    content: string;
    date: string;
    likes: number;
    dislikes: number;
    comments: string[];
};

export default function BulletinBoard() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [author, setAuthor] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [postsPerPage, setPostsPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("summary");
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState<number | null>(null);
    const [customInput, setCustomInput] = useState("");
    const [isWriting, setIsWriting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    // const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const totalPages = Math.ceil(posts.length / postsPerPage) || 1;
    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

    const handleNewPostClick = () => {
        if (!session?.user) {
            // setShowLoginPrompt(true);
            alert('등록된 사용자만 작성할 수 있습니다.')
        } else {
            setIsWriting(true);
        }
    };

    const addPost = (author: string) => {
        if (!title || !content) return;
        const newPost: Post = {
            id: Date.now(),
            author: session?.user.name,
            title,
            content,
            date: new Date().toLocaleString(),
            likes: 0,
            dislikes: 0,
            comments: [],
        };
        setPosts([newPost, ...posts]);
        setTitle("");
        setContent("");
        setIsWriting(false);
    };

    const handleLike = (postId: number) => {
        if (!session?.user) {
            alert('로그인 하셔서 의견주세요.')
        }
        if (selectedPost != null && selectedPost.author === session?.user.name) {
            alert('자신의 글에는 의견표시할 수 없습니다.')
        } else {
            setPosts(posts.map(post =>
                post.id === postId ? { ...post, likes: post.likes + 1 } : post
            ));
        }
    };

    const handleDislike = (postId: number) => {
        if (!session?.user) {
            alert('로그인 하셔서 의견주세요.')
        }
        if (selectedPost != null && selectedPost.author === session?.user.name) {
            alert('자신의 글에는 의견표시할 수 없습니다.')
        }
        else {
            setPosts(posts.map(post =>
                post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
            ));
        }
    };

    const handleCommentChange = (postId: number, value: string) => {
        setCommentInputs({ ...commentInputs, [postId]: value });
    };

    const addComment = (postId: number) => {
        if (!commentInputs[postId]) return;
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, comments: [...post.comments, commentInputs[postId]] } : post
        ));
        setCommentInputs({ ...commentInputs, [postId]: "" });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        if (value === "custom") {
            setIsCustom(true);
            setCustomInput("");
        } else {
            setPostsPerPage(Number(value));
            setIsCustom(false);
        }
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d+$/.test(value) && Number(value) > 0) {
            setCustomInput(value);
        }
    };

    const confirmCustomValue = () => {
        if (customInput) {
            const customNumber = Number(customInput);
            setCustomValue(customNumber);
            setPostsPerPage(customNumber);
            setIsCustom(false);
        } else {
            setIsCustom(false);
        }
    };

    const handleCustomBlur = confirmCustomValue;

    const handleCustomKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            confirmCustomValue();
        }
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

    const handleMouseEnter = (post: Post) => {
        setSelectedPost(post);
    }
    const handleMouseLeave = (post: Post) => {
        setSelectedPost(null)
    }

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center border-bottom p-2 ">

                <div className="flex-grow-1 text-center">
                    <h2>자유게시판</h2>
                </div>
                <div className="me-3">

                    <button className="btn btn-outline-secondary btn-sm me-2" title="글쓰기" onClick={handleNewPostClick}>
                        <i className="bi bi-file-plus"></i>
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
                    <button className="btn btn-outline-secondary btn-sm" title="postSetting" onClick={() => setShowSettings(!showSettings)}>
                        <i className="bi bi-gear"></i>
                    </button>
                </div>
            </div>
            {isWriting && (
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="form-control mb-2"
                        placeholder="Write your message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button className="btn btn-secondary me-2" onClick={() => setIsWriting(false)}>취소</button>
                    <button className="btn btn-primary me-2" onClick={() => addPost("SessionUser")}>저장</button>
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
                                <label><strong>Posts per Page:</strong></label>
                                <input
                                    type="number"
                                    title="postsetting"
                                    className="form-control w-auto d-inline-block"
                                    value={postsPerPage}
                                    onChange={(e) => setPostsPerPage(Number(e.target.value))}
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
                        {paginatedPosts.map((post) => (
                            <div key={post.id} className="border-bottom p-2">
                                <h5>{post.title}</h5>
                                <strong>{post.author}</strong> - <small>{post.date}</small>
                                <p>{post.content}</p>
                                {/* Like & Dislike Buttons */}
                                <div className="d-flex align-items-center gap-2" onMouseEnter={() => handleMouseEnter(post)} onMouseLeave={() => handleMouseLeave(post)}>
                                    <button className="btn btn-outline-success btn-sm" onClick={() => handleLike(post.id)}>
                                        👍 {post.likes}
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDislike(post.id)}>
                                        👎 {post.dislikes}
                                    </button>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => addComment(post.id)}>
                                        💬 Comment
                                    </button>
                                </div>

                                {/* Comment Input */}
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Write a comment..."
                                        value={commentInputs[post.id] || ""}
                                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    />
                                </div>

                                {/* Comments List */}
                                {post.comments.length > 0 && (
                                    <ul className="list-group list-group-flush mt-2">
                                        {post.comments.map((comment, index) => (
                                            <li key={index} className="list-group-item small">
                                                💬 {comment}
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
                        {paginatedPosts.map((post) => (
                            <div key={post.id} className="col-md-4 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">{post.title}</h5>
                                        <p className="card-text">{post.content}</p>
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
                            {paginatedPosts.map((post) => (
                                <tr key={post.id}>
                                    <td>{post.title}</td>
                                    <td>{post.content}</td>
                                    <td>{post.date}</td>
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
    );
}
