"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

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
    const [posts, setPosts] = useState<Post[]>([]);
    const [author, setAuthor] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [postsPerPage, setPostsPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState<number | null>(null);
    const [customInput, setCustomInput] = useState("");

    const totalPages = Math.ceil(posts.length / postsPerPage) || 1; // Avoid division by zero


    const addPost = () => {
        if (!author || !title || !content) return;
        const newPost: Post = {
            id: Date.now(),
            author,
            title,
            content,
            date: new Date().toLocaleString(),
            likes: 0,
            dislikes: 0,
            comments: [],
        };
        setPosts([newPost, ...posts]);
        setAuthor("");
        setTitle("");
        setContent("");
    };

    const handleLike = (postId: number) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
    };

    const handleDislike = (postId: number) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
        ));
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

    const options = [50, 75, ...(customValue ? [customValue] : [])].sort(
        (a, b) => a - b
    );

    // Ensure the current page is within valid range
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (validCurrentPage - 1) * postsPerPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

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


    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center border-bottom p-2 ">
               
                <div className="flex-grow-1 text-center">
                    <h2>자유게시판</h2>
                    </div>
                <div className="me-3">
                    <button className="btn btn-outline-secondary btn-sm me-2" title="글쓰기"><i className="bi bi-file-plus"></i></button>
                    <button className="btn btn-outline-secondary btn-sm ms-2 me-2" title="요약형태보기"><i className="bi bi-view-stacked"></i></button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="카드형태보기"><i className="bi bi-grid"></i></button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="테이블태보기"><i className="bi bi-table"></i></button>
                    <button className="btn btn-outline-secondary btn-sm ms-2" title="postSetting"><i className="bi bi-gear"></i></button>
                    
                </div>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Your Name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
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
                <button className="btn btn-primary" onClick={addPost}>
                    Post Message
                </button>
            </div>

            {/* Posts per Page Selection */}
            <div className="mb-3">
                <label className="me-2"><strong>Posts per Page:</strong></label>
                {!isCustom ? (
                    <select
                        title="posts"
                        className="form-select w-auto d-inline-block"
                        value={postsPerPage}
                        onChange={handleSelectChange}
                    >
                        {options.map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                        <option value="custom">Custom</option>
                    </select>
                ) : (
                    <input
                        type="number"
                        className="form-control w-auto d-inline-block"
                        placeholder="Enter number"
                        value={customInput}
                        onChange={handleCustomInputChange}
                        onBlur={handleCustomBlur}
                        onKeyDown={handleCustomKeyPress}
                        autoFocus
                    />
                )}
            </div>

            {/* Posts List */}
            <ul className="list-group">
                {paginatedPosts.map((post) => (
                    <li key={post.id} className="list-group-item">
                        <h5>{post.title}</h5>
                        <strong>{post.author}</strong> - <small>{post.date}</small>
                        <p>{post.content}</p>
                        {/* Like & Dislike Buttons */}
                        <div className="d-flex align-items-center gap-2">
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
                    </li>
                ))}
            </ul>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav className="mt-3">
                    {renderPagination()}
                </nav>
            )}
        </div>
    );
}
