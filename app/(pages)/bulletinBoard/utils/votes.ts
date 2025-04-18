import { BlogFork, BlogView, ThumbsStatus, Vote } from "@prisma/client";

export function getLikesCount(votes: Vote[]): number {
    return votes.filter((vote) => vote.thumbsStatus === ThumbsStatus.ThumbsUp).length;
}
export function getDislikesCount(votes: Vote[]): number {
    return votes.filter((vote) => vote.thumbsStatus === ThumbsStatus.ThumbsDown).length;
}
export function getViewCount(views: BlogView[]): number {
    return views.length;
}
export function getIsForked(forks: BlogFork[], logInUserId: string): boolean {
    const result = forks.filter((fork) => fork.userId === logInUserId);
    return result.length > 0;
}