'use client'
import { BlogWithRefTable } from '@/app/services/blogService';
import { getDaysFromToday, getHoursFromToday, getMinsFromToday } from '@/app/utils/dateTimeLib';
import { getDislikesCount, getLikesCount, getUserVote, getViewCount } from '../utils/votes';
import React, { useEffect, useState } from 'react'
import EyeFill from '../../icons/eyeFill';
import Thumbup from '../../icons/thumbUp';
import ThumbDown from '../../icons/thumbDown';
import Fork from '../../icons/fork';
import './styles.css'
import { ThumbsStatus, Vote } from '@prisma/client';
import { upsertVoteOnBlogAction, } from '@/app/actions/blog';

export interface BlogFooterProps {
    blog: BlogWithRefTable,
    userId?: string,
}
const BlogFooter = ({ blog, userId }: BlogFooterProps) => {
    const [thumbsStatus, setThumbsStatus] = useState<ThumbsStatus | undefined | null>(ThumbsStatus.None);
    const [likes, setLikes] = useState<number>(0)
    const [dislikes, setDislikes] = useState<number>(0)
    const [vote, setVote] = useState<Vote | null>(null);
    const [viewCount, setViewCount] = useState<number>(getViewCount(blog.views))
    const [forked, setForked] = useState<boolean | undefined>(false)

    useEffect(() => {
        setLikes(getLikesCount(blog.votes));
        setDislikes(getDislikesCount(blog.votes));
        if (userId) {
            const vt = getUserVote(blog.votes, userId)
            if (vt) {
                setThumbsStatus(vt.thumbsStatus);
                setForked(vt.forked);
            }
            setVote(vt);
        }
    }, [userId, blog.votes])

    const getDaysOrHoursFromNow = () => {
        const days = getDaysFromToday(blog?.createdAt);
        const hours = getHoursFromToday(blog?.createdAt);
        const mins = getMinsFromToday(blog?.createdAt);
        if (days > 0) {
            return (<>{days} <span className='fs-7'>일전</span></>);
        } else if (hours > 0) {
            return (<>{hours} <span className='fs-7'>시간전</span></>);
        }
        return (<>{mins} <span className='fs-7'>분전</span></>);
    };
    const checkLoginStatus = () => {
        if (!userId) {
            alert('로그인을 하셔야 선택할 수 있습니다.');
            return false;
        }
        else if (userId === blog.author?.id) {
            alert('작성자는 자기에게 좋아요를 선택할 수 없습니다.');
            return false;
        }
        return true;
    };
    const handleVote = async (status: ThumbsStatus) => {
        if (checkLoginStatus() && userId) {
            const alreadyVoted = vote?.thumbsStatus === status;
            const changingVote = vote && vote.thumbsStatus !== status;
            if (alreadyVoted) {
                alert('1회만 참여 할 수 있습니다.');
                return;
            }
            if (status === ThumbsStatus.ThumbsUp) {
                setLikes((prev) => prev + 1);
                if (changingVote && dislikes > 0) setDislikes((prev) => prev - 1);
            } else if (status === ThumbsStatus.ThumbsDown) {
                setDislikes((prev) => prev + 1);
                if (changingVote && likes > 0) setLikes((prev) => prev - 1);
            }
            const result = await upsertVoteOnBlogAction({ userId: userId, blogId: blog.id, thumbsStatus: status, forked: vote?.forked }) as Vote;
        }
    }
    const handleforked = async () => {
        if (checkLoginStatus() && userId) {
            const result = await upsertVoteOnBlogAction({ userId: userId, blogId: blog.id, thumbsStatus: vote?.thumbsStatus, forked: !forked }) as Vote;
            setForked((prev) => !prev)
        }
    };
    return (
        <div>
            {/* <div className='d-flex'>
                <div>dislikes: </div>
                <div className='ms-2'>
                    {dislikes}
                </div>
            </div> */}
            <small className="text-muted">
                {getDaysOrHoursFromNow()}
                <span className="ms-2 me-2">
                    <EyeFill className='ms-3 me-2' />
                    <span>{viewCount}</span>
                </span>
                <span className="ms-2 me-2">
                    <Thumbup className="ms-1 cursorHand" onClick={() => handleVote(ThumbsStatus.ThumbsUp)} title="좋아요" isThumbUp={thumbsStatus === ThumbsStatus.ThumbsUp ? true : false} />
                    <span className="ms-2 me-2">{likes}</span>
                    <ThumbDown className="ms-1 cursorHand" onClick={() => handleVote(ThumbsStatus.ThumbsDown)} title="싫어요" isThumbDown={thumbsStatus === ThumbsStatus.ThumbsDown ? true : false} />
                    <span className="ms-2 me-3">{dislikes}</span>

                </span>
            </small>
            <span className="mt-3">
                <Fork className="ms-1 mt-1 cursorHand" onClick={handleforked} title="찜했어요" isForked={forked} />
            </span>
        </div>
    );
}
export default BlogFooter