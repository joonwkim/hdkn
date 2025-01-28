// import { CloudinaryData } from "@prisma/client";
import { getAssetResources, } from "../actions/cloudinary";
import prisma from '@/prisma/prisma';
// import { addCdIdToKnowHowDetailInfo } from "./knowhowDetailInfoService";
import { CloudiaryInfo } from "../lib/types";
// import { cookies } from "next/headers";

export const deleteCloudinaryData = async (fileType: string) => {
    const pdfs = await prisma.cloudinaryData.deleteMany({
        where: {
            format: fileType,
        }
    });
    console.log('pdfs: ', pdfs);
    return pdfs;
};
export const getCloudinaryDataByPath = async (path: string, foldername: string) => {
    try {
        const res = await prisma?.cloudinaryData.findFirst({
            where: {
                folder: foldername,
                path: path,
            }
        });
        return res;
    } catch (error) {
        console.log('getCloudinaryDataByPath', error);
        throw error;
    }
};
export const getCloudinaryData = async (foldername: string, filename: string, format: string) => {
    try {
        const res = await prisma?.cloudinaryData.findFirst({
            where: {
                folder: foldername,
                filename: `${foldername}/${filename}`,
                format: format,
            }
        });
        return res;
    } catch (error) {
        console.log('getCloudinaryData error:', error);
    }
};

export const createCloudinaryData = async (ci: CloudiaryInfo) => {
    try {
        console.log('CloudiaryInfo: ', ci);
        const ciData = await prisma?.cloudinaryData.create({
            data: {
                asset_id: ci.asset_id,
                public_id: ci.public_id,
                filename: ci.filename,
                path: ci.path,
                format: ci.format,
                bytes: ci.bytes,
                folder: ci.folder,
                secure_url: ci.secure_url,
                thumbnail_url: ci.thumbnail_url,
            }
        });
        console.log('createCloudinaryData: ', ciData);
        return ciData;
    } catch (error) {
        console.log('createCloudinaryData error: ', error);
        throw error;
    }
};

export const getCloudinaryAndSave = async () => {
    const cis = await getAssetResources();
    // console.log('getAssetResources', cis);
    if (cis) {
        const cisArray = cis as CloudiaryInfo[];
        cisArray.forEach(async ci => {
            const res = await createCloudinaryData(ci);
            console.log('ci data', res);
        });
    }
};

export const deltePathNullOrUndefinedCD = async () => {
    const result = await prisma.cloudinaryData.deleteMany({
        where: {
            path: undefined,
        }
    });
    return result;
};

export const getPathNullOrUndefinedCD = async () => {
    const cds = await prisma.cloudinaryData.findMany({
        where: {
            path: undefined,
        }
    });
    return cds;
};

export const getImgSecureUrl = async (id: string) => {
    const cd = await prisma.cloudinaryData.findFirst({
        where: {
            id: id,
        }
    });
    if (cd) {
        console.log('getImgSecureUrl', cd.secure_url);
        return cd.secure_url;
    }
};

export const getCloudinaryImageIds = async (imageFormdata: FormData[]): Promise<string[]> => {
    try {
        const ids: string[] = []
        try {

            imageFormdata.forEach(async (fd) => {

                const filename = fd.get('filename') as string;

                if (filename) {
                    const cdData = await prisma.cloudinaryData.findFirst({
                        where: {
                            filename: filename,
                            folder: 'hdkn',
                        }
                    });
                    console.log('cdData: ', cdData)
                    // console.log('cdData: ', cdData)
                    // if (cdData) {
                    //     console.log('cdData: ', cdData)
                    //     ids.push(cdData.id)
                    // }
                    // else {
                    //     console.log('cdData getCloudinaryDataIds not found: ');
                    //     const ci = await getCloudinaryInfo(fd);
                    //     console.log('getCloudinaryInfo:  ', ci)
                    //     if (ci) {
                    //         const cdData = await prisma.cloudinaryData.create({
                    //             data: {
                    //                 asset_id: ci.asset_id,
                    //                 public_id: ci.public_id,
                    //                 filename: ci.filename,
                    //                 format: ci.format,
                    //                 path: ci.filename,
                    //                 bytes: ci.bytes,
                    //                 folder: ci.folder,
                    //                 secure_url: ci.secure_url,
                    //                 thumbnail_url: ci.thumbnail_url,
                    //             }
                    //         });
                    //         if (cdData) {
                    //             return cdData.id;
                    //         }
                    //     }
                    // }
                }
            })


        } catch (error) {
            console.log('uploadImages  error:', error);
            throw error;
        }

        return ids;

    } catch (error) {
        console.log('uploadImages ToCloudinaryAndCreateCloudinaryData error:', error);
        throw error;
    }
};

