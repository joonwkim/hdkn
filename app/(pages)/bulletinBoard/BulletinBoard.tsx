"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSession } from "next-auth/react";
import { BlogWithRefTable } from "@/app/services/blogService";
import { createNewBlogAction, deleteSelectedBlogAction, updateBlogAction, upsertVoteOnBlogViewCountAction, } from "@/app/actions/blog";
import BlogFooter from "./components/BlogFooter";
import BlogComment from "./components/BlogComment";
import Editor from "@/app/components/lexicalEditor/Editor";
import { getDislikesCount, getLikesCount, getUserVote } from './utils/votes';
import UserAvartar from '../icons/UserAvartar';
import './styles.css'
import '../../lib/date'
import { ThumbsStatus, Vote } from '@prisma/client';
import ThemeToggle from './components/ThemeToggle';
import { updateUserPreferenceForSelectedBlogAction } from '@/app/actions/userPreference';

type BlogsProps = {
    blogs: BlogWithRefTable[]
}

const BulletinBoard = ({ blogs }: BlogsProps) => {
    //#region session and state
    const { data: session, status, update } = useSession();
    const [title, setTitle] = useState("");
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [blogsPerPage, setBlogPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [blogsViewType, setViewType] = useState<'summary' | 'card' | 'table'>('summary');
    const [viewMode, setViewMode] = useState<'view' | 'edit' | 'new'>('view')
    const [selectedBlog, setSelectedBlog] = useState<BlogWithRefTable | null | undefined>(null);
    const totalPages = Math.ceil(blogs.length / blogsPerPage) || 1;
    const startIndex = (currentPage - 1) * blogsPerPage;
    const paginatedBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);
    const router = useRouter();
    const [isAuthor, setIsAuthor] = useState(false);
    //#endregion

    useEffect(() => {
        console.log('session?.user.preference', JSON.stringify(session?.user.preference, null, 2))
        const blog = blogs.find((blog) => blog.id === session?.user.preference.selectedBlogId);
        setSelectedBlog(blog);
        if (blog?.authorId === session?.user.id) {
            setViewMode('edit')
        }

    }, [session?.user.preference.selectedBlogId])

    useEffect(() => {
        if (session?.user.preference) {
            setViewType(session?.user.preference.blogsViewType);
            setBlogPerPage(session?.user.preference.pageSize)
        } else {
            setViewType('card');
            setBlogPerPage(3)
        }
    }, [session?.user.preference, status])

    const resetAll = () => {
        setTitle("");
        setViewMode('view');
        setSelectedBlog(null);
    }
    const handleFocus = () => {
        const inputElement = document.getElementById("contentTextarea") as HTMLInputElement;
        if (inputElement) {
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }
    };
    const handleBlogSelectionChanged = async (blog: BlogWithRefTable) => {
        if (selectedBlog?.id !== blog.id) {
            setSelectedBlog(blog);
            const author = blog.authorId === session?.user.id;
            setIsAuthor(author);
            setViewMode(author ? 'edit' : 'view');

            const element = document.querySelector('.blog-content');
            if (element) {
                element.scrollTop = 0;
            }

        } else {
            console.log('handleBlogSelectionChanged else')
        }
        await updateUserPreferenceForSelectedBlogAction(session?.user.id, blog.id, blogsViewType);
        const result = await upsertVoteOnBlogViewCountAction({ userId: session?.user.id, blogId: blog.id, }) as Vote;
        await update();
    }
    const saveSelectedBlogId = async (blogId: string | null, blogsViewType: string) => {
        if (session?.user && selectedBlog?.id !== blogId) {
            const user = await updateUserPreferenceForSelectedBlogAction(session.user.id, blogId, blogsViewType);
            await update();
        }
    }
    const handleAddNewBlogClick = () => {
        if (!session?.user) {
            alert('로그인 사용자만 게시판 글을 작성할 수 있습니다.')
        } else {
            setViewMode('new')
            setSelectedBlog(null)
            setTitle('')
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
                    setTitle(selectedBlog.title);
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
    const handleSaveNewBlog = async (content: string) => {
        const result = await createNewBlogAction(session?.user.id, title, content)
        if (result) {
            console.log(`title: ${title} added`);
            router.refresh();
            resetAll();
        }
    };
    const handleSaveEditedBlog = async (content: string) => {
        if (selectedBlog) {
            const result = await updateBlogAction(selectedBlog.id, content)
            if (result) {
                console.log(`title: ${title} added`);
                router.refresh();
                resetAll();
            }
            setSelectedBlog(null);
        }
    };
    const handleCancel = () => {
        resetAll();
    };
    const handleCommentChange = (blogId: number, value: string) => {
        setCommentInputs({ ...commentInputs, [blogId]: value });
    };
    const getSummaryClassName = (id: string) => {
        return `${id === selectedBlog?.id ? 'border border-primary border-2 m-3 p-3' : 'mb-3 p-2 border border-bottom'}`;
    }
    const getCardClassName = (id: string) => {
        return `card ${id === selectedBlog?.id ? 'border-primary border-2' : ''}`;
    }
    const getTableClassName = (id: string) => {
        return `${id === selectedBlog?.id ? 'border-primary border-2' : ''}`;
    }
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
                    <button className="page-link" onClick={() => { setCurrentPage(currentPage - 1) }} title="이전으로 가기"><i className="bi bi-chevron-double-left"></i></button>
                </li>
                {pages.map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? "active" : ""}`}>
                        {typeof page === "number" ? (
                            <button className="page-link" onClick={() => { setCurrentPage(page) }}>{page}</button>
                        ) : (
                            <span className="page-link">...</span> // Ellipsis
                        )}
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => { setCurrentPage(currentPage + 1) }} title="다음으로"><i className="bi bi-chevron-double-right"></i></button>
                </li>
            </ul>
        );
    };
    return (
        <div>
            <div>
                {blogsViewType}
            </div>
            <div>
                UserPreference blogsViewType: {JSON.stringify(session?.user.preference.blogsViewType, null, 2)}
            </div>

            <div className="d-flex justify-content-between align-items-center border-bottom p-2 sticky-child z-3">
                {/* title */}
                <div className="flex-grow-1 text-center">
                    <h2>자유게시판</h2>
                </div>
                {/* toolbuttons */}
                <div className="me-3 d-flex ">
                    <div title={session?.user ? "글쓰기" : "로그인 후 사용하세요."}>
                        <button
                            className="btn btn-outline-secondary btn-sm me-2"
                            title={viewMode === 'new' ? "작성 중입니다..." : "글쓰기"}
                            onClick={handleAddNewBlogClick}
                            disabled={!session?.user}>
                            <i className="bi bi-file-plus"></i>
                        </button>
                    </div>
                    <div title={isAuthor ? "글 수정" : "작성자 만 수정할 수 있습니다."}>
                        <button className="btn btn-outline-secondary btn-sm me-2" title="글 수정" onClick={handleEditBlogClick} disabled={!isAuthor}>
                            <i className="bi bi-pencil"></i>
                        </button>
                    </div>
                    <div title={isAuthor ? "글 삭제" : "작성자 만 삭제할 수 있습니다."}>
                        <button className="btn btn-outline-secondary btn-sm me-2" title="글 삭제" onClick={handleDeleteBlogClick} disabled={!isAuthor}>
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="요약형태보기" onClick={() => { setViewType("summary"); setSelectedBlog(null); saveSelectedBlogId(null, 'summary') }}>
                        <i className="bi bi-view-stacked"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="카드형태보기" onClick={() => { setViewType("card"); setSelectedBlog(null); saveSelectedBlogId(null, 'card') }}>
                        <i className="bi bi-grid"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm me-2" title="카드형태보기" onClick={() => { setViewType("table"); setSelectedBlog(null); saveSelectedBlogId(null, 'table') }}>
                        <i className="bi bi-table"></i>
                    </button>
                </div>
            </div>
            {/* contents */}
            <div className="blog-content">
                {/* 새글 작성하기 */}
                {viewMode === 'new' && (
                    <div className="mb-3">
                        <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <div className="mt-3">
                            <Editor cancel={() => setViewMode('view')} saveDocument={handleSaveNewBlog} isReadOnly={false} />
                        </div>
                    </div>
                )}
                {selectedBlog && (
                    <>
                        {/* 글 편집하기 */}
                        {viewMode === 'edit' && (
                            <div className="border-bottom p-2">
                                <div> <strong>{`제목: ${selectedBlog.title}`}</strong></div>
                                <div className='d-flex my-2'>
                                    <UserAvartar url={selectedBlog.author.image} name={selectedBlog.author.name} />
                                    <div className='ms-1'>
                                        <div className='fs-7'>{`작성자: ${selectedBlog.author.name}`}</div>
                                        <div className='fs-7'>{`작성일: ${selectedBlog.createdAt.toKrDateString()}`}</div>
                                    </div>
                                </div>

                                <div className='mb-3'>
                                    <Editor isReadOnly={false} initialData={selectedBlog.content} saveDocument={handleSaveEditedBlog} cancel={handleCancel} />
                                </div>
                                <div className='border-top'>
                                    <BlogFooter blog={selectedBlog} userId={session?.user.id} />
                                </div>
                                <BlogComment blog={selectedBlog} />
                            </div>
                        )}
                        {/* 세부 글 보기 */}
                        {viewMode === 'view' && (
                            <div className="border-bottom p-2">
                                <div> <strong>{`제목: ${selectedBlog.title}`}</strong></div>
                                <div className='d-flex my-2'>
                                    <UserAvartar url={selectedBlog.author.image} name={selectedBlog.author.name} />
                                    <div className='ms-1'>
                                        <div className='fs-7'>{`작성자: ${selectedBlog.author.name}`}</div>
                                        <div className='fs-7'>{`작성일: ${selectedBlog.createdAt.toKrDateString()}`}</div>
                                    </div>
                                </div>
                                <div className='mb-3'>
                                    <Editor isReadOnly={true} initialData={selectedBlog.content} />
                                </div>
                                <div className='border-top'>
                                    <BlogFooter blog={selectedBlog} userId={session?.user.id} />
                                </div>
                                <BlogComment blog={selectedBlog} />
                            </div>
                        )}
                    </>
                )}

                {/* Blogs 목록 보기 */}
                <div className="mt-3">
                    {/* 요약보기 */}
                    {blogsViewType === "summary" && (
                        <div>
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className={getSummaryClassName(blog.id)} onClick={() => handleBlogSelectionChanged(blog)}>
                                    <h5>{blog.title}</h5>
                                    <strong>{blog.author.name}</strong> - <small>{blog.updatedAt.toKrDateString()}</small>
                                    <div className="lexical-editor-summaryview mb-3">
                                        <Editor isReadOnly={true} initialData={blog.content} />
                                    </div>
                                    <BlogFooter blog={blog} userId={session?.user.id} />
                                    <BlogComment blog={blog} />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* 카드보기 */}
                    {blogsViewType === "card" && (
                        <div className="row">
                            {paginatedBlogs.map((blog) => (
                                <div key={blog.id} className="col-md-4 mb-3" onClick={() => handleBlogSelectionChanged(blog)}>
                                    <div className={getCardClassName(blog.id) + ' w-100'}>
                                        <div className="card-header">
                                            <div className="fs-5 text-truncate">{`제목: ${blog.title}`}</div>
                                            <div className="fs-7 text-truncate">{`작성자: ${blog.author.name}`}</div>
                                        </div>

                                        <div className="card-body">
                                            <div className="lexical-editor-cardview">
                                                <Editor isReadOnly={true} initialData={blog.content} />
                                            </div>
                                        </div>

                                        <div className="card-footer">
                                            <BlogFooter blog={blog} userId={session?.user.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 테이블보기 */}
                    {blogsViewType === "table" && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>작성자</th>
                                    <th>Title</th>
                                    <th>작성일</th>
                                    <th>조회</th>
                                    <th>좋아요</th>
                                    <th>실어요</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBlogs.map((blog) => (
                                    <tr key={blog.id} className={getTableClassName(blog.id)} onClick={() => handleBlogSelectionChanged(blog)}>
                                        <td>{blog.author.name}</td>
                                        <td>{blog.title}</td>
                                        <td>{blog.createdAt.toKrDateString()}</td>
                                        <td>{blog.viewCount}</td>
                                        <td>{getLikesCount(blog.votes)}</td>
                                        <td>{getDislikesCount(blog.votes)}</td>
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
        </div >
    );
}
export default BulletinBoard;