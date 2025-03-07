export interface CustomFile extends File {
    secure_url: string;
}
export interface CloudiaryInfo {
    asset_id: string,
    public_id: string,
    filename: string,
    path: string,
    format: string,
    bytes: number,
    width: number,
    height: number,
    folder: string,
    url: string,
    secure_url: string,
    thumbnail_url: string;
}

export type CanHandleSubmit = {
    handleSubmit: () => void;
};

export type SessionUser = {
    id?: string,
    name: string,
    email: string,
    image: string | null,
    // isUserAdmin: boolean,
    roles?: Role[],
}

export type Stage = {
    id?: string,
    stageTitle: string,
    stage: number,
    stageContents: StageContents[],
}

export type StageContents = {
    id?: string,
    title: string,
    description?: string,
    thumbnailUrl?: string,
    authorId: string,
    thumbnailFormdata?: FormData,
    childDetail?: ChildDetail,
    isDeleted: boolean,
}



// export type ChildData = {
//     header?: ChildHeader,
//     detail?: ChildDetail,

// }
// export type ChildHeader = {
//     title: string,
//     description: string,
   
//     thumbnailUrl?: string,
//     // stage: number,
   
//     // levelInStage: number,
// }

export type ChildDetail = {
    ytData?: YouTubeData[],
    imgData?: FormData[],
    pdfData?: Formdata[],
    text?: string,
}

export type MessageDelivered = {
    title: string | null,
    message: string,
    deliveryType: string,
    createdAt: Date,
    isRead: boolean,
}

export type MessagingPartner = {
    id: string,
    name: string,
    email: string,
    image: string | null,
    lastMsgCreatedAt: Date,
    profile: object | null,
    googleLogin: boolean,
    isActive: boolean,
    isSelected: boolean,
}

type KVPairs<T, K extends keyof T = keyof T> = K extends keyof T ? { key: K, val: T[K] } : never;



