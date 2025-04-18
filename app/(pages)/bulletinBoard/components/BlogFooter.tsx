'use client'
import { BlogWithRefTable } from '@/app/services/blogService';
import { getDaysFromToday, getHoursFromToday, getMinsFromToday } from '@/app/utils/dateTimeLib';
import { getDislikesCount, getIsForked, getLikesCount, getViewCount } from '../utils/votes';
import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react";
import EyeFill from '../../icons/eyeFill';
import Thumbup from '../../icons/thumbUp';
import ThumbDown from '../../icons/thumbDown';
import Fork from '../../icons/fork';
import './styles.css'
import { ThumbsStatus } from '@prisma/client';
import { voteOnBlogAction } from '@/app/actions/blog';

export interface BlogFooterProps {
    blog: BlogWithRefTable,
    handleVote: (blog: BlogWithRefTable, thumbsStatus: ThumbsStatus) => void,
    handleforked: (blog: BlogWithRefTable, thumbsStatus: ThumbsStatus) => void,
}

const BlogFooter = ({ blog, handleVote }: BlogFooterProps) => {
    const { data: session } = useSession();
    const [thumbsStatus, setThumbsStatus] = useState<ThumbsStatus>(ThumbsStatus.None);
    const [likes, setLikes] = useState<number>(getLikesCount(blog.votes))
    const [dislikes, setDislikes] = useState<number>(getDislikesCount(blog.votes))
    const [viewCount, setViewCount] = useState<number>(getViewCount(blog.views))

    const getDaysOrHoursFromNow = () => {
        const days = getDaysFromToday(blog?.createdAt);
        const hours = getHoursFromToday(blog?.createdAt);
        const mins = getMinsFromToday(blog?.createdAt);
        if (days > 0) {
            return (<>{days} <span>일전</span></>);
        } else if (hours > 0) {
            return (<>{hours} <span>시간전</span></>);
        }
        return (<>{mins} <span>분전</span></>);
    };
    // login status
    const checkLoginStatus = () => {
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
    // const handleThumbUp = async () => {

    //     if (checkLoginStatus()) {

    //         // if (thumbsStatus === ThumbsStatus.None) {
    //         //     setThumbsStatus();
    //         //     // blog.thumbsUpCount++;
    //         // } else if (thumbsStatus === ThumbsStatus.ThumbsDown) {
    //         //     setThumbsStatus(ThumbsStatus.ThumbsUp);
    //         //     // blog.thumbsUpCount++;
    //         //     // blog.thumbsDownCount--;
    //         // } else if (thumbsStatus === ThumbsStatus.ThumbsUp) {
    //         //     setThumbsStatus(ThumbsStatus.None);
    //         //     // blog.thumbsUpCount--;
    //         // }
    //         await voteOnBlogAction({ userId: session?.user.id, blogId: blog.id, thumbsStatus: ThumbsStatus.ThumbsUp })
    //     }
    // };
    // const handleThumbDown = async () => {
    //     if (checkLoginStatus()) {
    //         // alert('handleThumbDown clicked')
    //         // if (thumbsStatus === ThumbsStatus.None) {
    //         //     setThumbsStatus(ThumbsStatus.ThumbsDown);

    //         // } else if (thumbsStatus === ThumbsStatus.ThumbsDown) {
    //         //     setThumbsStatus(ThumbsStatus.None);
    //         //     // blog.thumbsDownCount--;

    //         // } else if (thumbsStatus === ThumbsStatus.ThumbsUp) {
    //         //     setThumbsStatus(ThumbsStatus.ThumbsDown);
    //         // }
    //         await voteOnBlogAction({ userId: session?.user.id, blogId: blog.id, thumbsStatus: ThumbsStatus.ThumbsDown })
    //     }
    // };
    const handleforked = () => {
        // if (checkLoginStatus()) {
        //     if (forked === true) {
        //         setforked(false);
        //     }
        //     else {
        //         setforked(true);
        //     }
        // }
    };
    return (
        <div>
            <small className="text-muted">
                {getDaysOrHoursFromNow()}
                <span className="ms-2 me-2">
                    <EyeFill className='ms-3 me-2' />
                    <span>{viewCount}</span>
                </span>
                <span className="ms-2 me-2">
                    <Thumbup className="ms-1 cursorHand" onClick={() => handleVote(blog, ThumbsStatus.ThumbsUp)} fill={thumbsStatus === ThumbsStatus.ThumbsUp ? "red" : ''} title="좋아요" />
                    <span className="ms-2 me-2">{likes}</span>
                    <ThumbDown className="ms-1 cursorHand" onClick={() => handleVote(blog, ThumbsStatus.ThumbsDown)} fill={thumbsStatus === ThumbsStatus.ThumbsDown ? "red" : ''} title="싫어요" />
                    <span className="ms-2 me-3">{dislikes}</span>

                </span>
            </small>
            <span className="mt-3">
                <Fork
                    className="ms-1 mt-1 cursorHand"
                    onClick={handleforked}
                    title="찜했어요"
                    isForked={getIsForked(blog.forks, session?.user.id)}
                />
            </span>
        </div>
    );
}

export default BlogFooter