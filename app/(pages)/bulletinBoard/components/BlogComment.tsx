'use client'
import React, { useRef, useState } from 'react'
import { BlogFooterProps } from './BlogFooter'
import { useSession } from 'next-auth/react';
import Image from "next/image";
import GoogleLogin from '../../icons/GoogleLogin';
import ExpandingTextarea from '@/app/components/controls/StyledTextarea ';
import PersonIcon from '../../icons/PersonIcon';
import './styles.css'
import UserAvartar from '../../icons/UserAvartar';
import { upsertBlogCommentAction } from '@/app/actions/blog';
import SortCommentIcon from '../../icons/SortCommentIcon';
import { BlogWithRefTable } from '@/app/services/blogService';

export interface BlogCommentProps {
    blog: BlogWithRefTable,
}

const BlogComment = ({ blog }: BlogCommentProps) => {
    const { data: session } = useSession();
    const [comment, setComment] = useState("");
    const [sort, setSort] = useState<'popular' | 'latest' | 'oldest'>('latest');
    const [comments, setComments] = useState(blog.comments)
    const [isAddingComment, setIsAddingComment] = useState(false)
    const [isAsce, setIsAsce] = useState(true);
    const [showPopover, setShowPopover] = useState(true);

    const addComment = async () => {
        if (session?.user) {
            const result = await upsertBlogCommentAction({ id: undefined, commenterId: session?.user.id, blogId: blog.id, comment: comment })
            setIsAddingComment(false)
            setComment("")
            setComments(blog.comments)
            sortComment(sort)
        }
    };

    const sortComment = (selection: 'popular' | 'latest' | 'oldest') => {
        setSort(selection);

        if (selection === 'latest') {
            const sortedComments = [...comments].sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            setComments(sortedComments);
        } else if (selection === 'oldest') {
            const sortedComments = [...comments].sort((a, b) =>
                new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
            setComments(sortedComments);
        } else {
            const sortedComments = [...comments].sort((a, b) =>
                a.votes.length - b.votes.length // Sort by votes length for popularity
            );
            setComments(sortedComments);
        }
    }

    const handleEditCommand = (comment: any) => {
        alert(JSON.stringify(comment, null, 2));
    }
    const handleDeleteCommand = (comment: any) => {
        alert(JSON.stringify(comment, null, 2));
    }
    return (
        <small className="text-muted mt-2">
            <div className="d-flex align-items-center">
                <div className="text-sm">{blog.comments.length} Comments</div>
                <div className="d-flex align-items-center">
                    <div className="dropdown">
                        <button className="btn ms-2 border-0 bg-transparent" type="button" title="sort" data-bs-toggle="dropdown" aria-expanded="false">
                            <SortCommentIcon />
                        </button>
                        <ul className="dropdown-menu border-0 ms-3">
                            <li>
                                <button className="dropdown-item d-flex align-items-center" onClick={() => sortComment('popular')}>
                                    <span className="me-2 d-inline-block text-center custom-checkbox-width">
                                        {sort === 'popular' ? '✅' : '☐'}
                                    </span>
                                    인기순
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center" onClick={() => sortComment('latest')}>
                                    <span className="me-2 d-inline-block text-center custom-checkbox-width">
                                        {sort === 'latest' ? '✅' : '☐'}
                                    </span>
                                    최신순
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center" onClick={() => sortComment('oldest')}>
                                    <span className="me-2 d-inline-block text-center custom-checkbox-width">
                                        {sort === 'oldest' ? '✅' : '☐'}
                                    </span>
                                    시간순
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='d-flex'>
                <div className='w-100'>
                    {session ? (
                        <div className='d-flex w-100'>
                            {session?.user?.image ? (
                                <UserAvartar url={session.user?.image} name={session.user.name} />
                            ) : 'adding comment here!'}
                            {!isAddingComment ? (<div className='ms-2' onClick={() => setIsAddingComment(true)}>
                                Add a comment
                            </div>) : (
                                <div className='ms-2 w-100'>
                                    <div className="position-relative">
                                        <ExpandingTextarea text={comment} handleSaveBtnClick={(value) => setComment(value)} />
                                    </div>
                                    <div className='d-flex mt-1 justify-content-end me-4' >
                                        <button className='btn btn-sm btn-outline-secondary' onClick={() => setIsAddingComment(false)}>취소</button>
                                        <button className='btn btn-sm btn-outline-primary ms-2' onClick={addComment} disabled={comment === ""}>등록</button>
                                    </div>
                                </div>

                            )}
                        </div>
                    ) : (
                        <div className='mt-2 ms-2 d-flex '>
                            <PersonIcon />
                            <div className="dropdown">
                                <small className="ms-3 clickable-text" data-bs-toggle="dropdown">
                                    댓글추가...
                                </small>
                                <div className="dropdown-menu p-0 border-0 dropdown-card">
                                    <div className="card">
                                        <div className="card-body">
                                            <p className="card-text">댓글을 추가하시기 위하여 로그인 하세요</p>
                                            <div className='d-flex'>
                                                <GoogleLogin />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {comments.length > 0 && (
                <ul className="ps-0 ms-0 list-group list-group-flush list-unstyled mt-2">
                    {comments.map((comment, index) => (
                        <li key={index} className="ps-0 ms-0 list-group-item small d-flex">
                            <UserAvartar url={comment.commenter?.image} name={comment.commenter?.name} />
                            <div className='ms-2 w-100'>
                                <div className='d-flex justify-content-between'>
                                    <div className='fs-7'>{comment.commenter.name}</div>
                                    <div>
                                        {!showPopover && (
                                            <i className="bi bi-three-dots"></i>
                                        )}
                                        {showPopover && (
                                            <div className='fs-7 d-flex gap-3'>
                                                <div onClick={() => handleEditCommand(comment)}>수정</div>
                                                <div onClick={() => handleDeleteCommand(comment)}>삭제</div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {comment.comment}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </small>
    )
}

export default BlogComment