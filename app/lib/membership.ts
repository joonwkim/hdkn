import { MembershipRequest, MembershipRequestStatus } from "@prisma/client";

const getMembershipStatus = (membershipRequestStatus: any) => {
    if (membershipRequestStatus === MembershipRequestStatus.REQUESTED) {
        return ('멤버 수락 대기중');
    } else if (membershipRequestStatus === MembershipRequestStatus.APPROVED) {
        return ('그룹승인');
    } else if (membershipRequestStatus === MembershipRequestStatus.REJECTED) {
        return ('멤버거절');
    } else if (membershipRequestStatus === MembershipRequestStatus.PENDING) {
        return ('멤버보류');
    } else if (membershipRequestStatus === MembershipRequestStatus.NONE) {
        return ('참여신청');
    }
    else {
        return ('참여신청');
    }
};

export const getMembershipApprovalStatus = (user: any, knowhowId: string) => {
    if (user !== undefined && user.membershipRequestedBys?.length > 0) {
        const currentRequest = user.membershipRequestedBys.find((s: any) => s.knowhowId === knowhowId) as MembershipRequest;
        if (currentRequest) {
            return getMembershipStatus(currentRequest.membershipRequestStatus);
        }
    }

};

