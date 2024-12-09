import { Knowhow, Tag } from "@prisma/client";
import { getYoutubeDataAction } from "../actions/youtubeAction";
import { YoutubeInfo } from "./convert";


export const getCloudinaryImgData = (knowhow: any) => {
    let imgCloudinaryData = knowhow?.knowhowDetailInfo?.cloudinaryDatas?.filter((s: any) => s.format !== 'pdf');
    // console.log('imgCloudinaryData getCloudinaryImgData: ', imgCloudinaryData);
    if (imgCloudinaryData === null || imgCloudinaryData === undefined) {
        imgCloudinaryData = [];
    }
    return imgCloudinaryData;
};
export const getCloudinaryPdfData = (knowhow: any) => {
    let pdfCloudinaryData = knowhow?.knowhowDetailInfo?.cloudinaryDatas?.filter((s: any) => s.format === 'pdf');
    // console.log('pdfCloudinaryData getCloudinaryPdfData: ', getCloudinaryPdfData);
    if (pdfCloudinaryData === null || pdfCloudinaryData === undefined) {
        pdfCloudinaryData = [];
    }
    return pdfCloudinaryData;
};
export const getImgUrls = (knowhow: any) => {
    const imgUrls = knowhow?.knowhowDetailInfo?.knowhowDetailOnCloudinaries?.map((s: any) => {
        if (s.thumbnailCloudinaryData.format !== 'pdf') {
            return s.thumbnailCloudinaryData.secure_url;
        };
    }).flatMap((f: any) => f ? [f] : []);
    return imgUrls;
};

export const getPdfUrls = (knowhow: any) => {
    const pdfUrls = knowhow?.knowhowDetailInfo?.knowhowDetailOnCloudinaries?.map((s: any) => {
        if (s.thumbnailCloudinaryData?.format === 'pdf') {
            return s.thumbnailCloudinaryData.secure_url;
        };
    }).flatMap((f: any) => f ? [f] : []);
    return pdfUrls;
};

export const getYtInfos = (videoIds: any[] | undefined) => {
    let ytInfos: YoutubeInfo[] = [];
    if (videoIds && videoIds.length > 0) {
        videoIds.forEach(async id => {
            const yd = await getYoutubeDataAction(id) as YoutubeInfo;
            if (yd) {
                ytInfos.push(yd);
            }
        });
    }
    return ytInfos;
};

export const getTagsFromKnowhows = (knowhows: Knowhow[]) => {
    let tags: Tag[] = [];
    knowhows.forEach((knowhow: any) => {
        if (knowhow.tags && knowhow.tags.length > 0) {
            knowhow?.tags.forEach((tag: Tag) => {
                tags.push(tag)
            })
        }
    })
    return tags;
}

export const compareByName = (a: any, b: any) => {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

export const removeDuplicate = (array: string[]) => {
    return [... new Set(array)];
}

export const removeDuplicatedObject = (objects: any[]) => {
    const objs = objects.filter((value, index, array) => index == array.findIndex(item => item.id == value.id));
    return objs;
}
