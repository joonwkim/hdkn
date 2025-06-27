import { BlogView, ThumbsStatus, Vote } from "@prisma/client";

export function getLikesCount(votes: Vote[]): number {
    return votes.filter((vote) => vote.thumbsStatus === ThumbsStatus.ThumbsUp).length;
}
export function getDislikesCount(votes: Vote[]): number {
    return votes.filter((vote) => vote.thumbsStatus === ThumbsStatus.ThumbsDown).length;
}
export function getUserVoted(votes: Vote[], userId: string): boolean {
    return votes.find((vote) => vote.voterId === userId) !== undefined;
}
export function getUserVote(votes: Vote[], userId: string): Vote | undefined {
    return votes.find((vote) => vote.voterId === userId);
}
export function getUserVoteStatus(votes: Vote[], userId: string): ThumbsStatus {
    const status = votes.find((vote) => vote.voterId === userId)?.thumbsStatus as ThumbsStatus;
    return status;
}
export function getViewCount(views: BlogView[]): number {
    return views.length;
}
// export function getIsForked(forks: BlogFork[], logInUserId: string | undefined): boolean {
//     if (logInUserId) {
//         const result = forks.filter((fork) => fork.userId === logInUserId);
//         return result.length > 0;
//     }
//     return false;
// }