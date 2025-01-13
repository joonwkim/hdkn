import { CloudinaryData } from "@prisma/client";
import { getAssetResources, uploadToCloudinary } from "../actions/cloudinary";
import prisma from '@/prisma/prisma';
// import { addCdIdToKnowHowDetailInfo } from "./knowhowDetailInfoService";
import { CloudiaryInfo } from "../lib/types";

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
            path: null || undefined,
        }
    });
    return result;
};

export const getPathNullOrUndefinedCD = async () => {
    const cds = await prisma.cloudinaryData.findMany({
        where: {
            path: null || undefined,
        }
    });
    return cds;
};

export const getAndAddCloudinaryDataIds = async (formdatas: FormData[], knowhowid: string) => {
    // consoleLogFormDatas('formdatas:', formdatas);
    formdatas?.forEach(async formData => {
        const path = formData.get('path') as string;
        // console.log('path', path);
        if (path) {
            const cdData = await prisma.cloudinaryData.findFirst({
                where: {
                    path: path,
                    folder: 'openplace',
                }
            });
            if (cdData) {
                console.log('cdData getCloudinaryDataIds found and added: ', cdData);
                // await addCdIdToKnowHowDetailInfo(knowhowid, cdData.id);
            }
            else {

                const uploadedToCloudinary = await uploadToCloudinary(formData);
                if (uploadedToCloudinary) {
                    const cdData = await prisma.cloudinaryData.create({
                        data: {
                            asset_id: uploadedToCloudinary.asset_id,
                            public_id: uploadedToCloudinary.public_id,
                            filename: uploadedToCloudinary.filename,
                            path: path,
                            format: uploadedToCloudinary.format,
                            bytes: uploadedToCloudinary.bytes,
                            folder: uploadedToCloudinary.folder,
                            secure_url: uploadedToCloudinary.secure_url,
                            thumbnail_url: uploadedToCloudinary.thumbnail_url,
                        }
                    });
                    if (cdData) {
                        console.log('cdData getCloudinaryDataIds uploaded: ', cdData.id);
                        // await addCdIdToKnowHowDetailInfo(knowhowid, cdData.id);
                    }
                }
            }
        }
    });

};
export const getAndUpdateCloudinaryDataIds = async (formdatas: FormData[], knowhowid: string) => {

    // consoleLogFormDatas('formdatas:', formdatas);
    let cdIds: string[] = [];
    formdatas?.forEach(async formData => {
        const path = formData.get('path') as string;
        // console.log('path', path);
        if (path) {
            const cdData = await prisma.cloudinaryData.findFirst({
                where: {
                    path: path,
                    folder: 'openplace',
                }
            });
            if (cdData) {
                console.log('cdData getCloudinaryDataIds found: ', cdData);
                cdIds.push(cdData.id);
            }
            else {

                const uploadedToCloudinary = await uploadToCloudinary(formData);
                if (uploadedToCloudinary) {
                    const cdData = await prisma.cloudinaryData.create({
                        data: {
                            asset_id: uploadedToCloudinary.asset_id,
                            public_id: uploadedToCloudinary.public_id,
                            filename: uploadedToCloudinary.filename,
                            path: path,
                            format: uploadedToCloudinary.format,
                            bytes: uploadedToCloudinary.bytes,
                            folder: uploadedToCloudinary.folder,
                            secure_url: uploadedToCloudinary.secure_url,
                            thumbnail_url: uploadedToCloudinary.thumbnail_url,
                        }
                    });
                    if (cdData) {
                        console.log('cdData getCloudinaryDataIds uploaded: ', cdData.id);
                        // await addCdIdToKnowHowDetailInfo(knowhowid, cdData.id);
                    }
                }
            }
        }
    });
    return cdIds;
};

export const upsertCloudinaryData = async (formdatas: FormData[]) => {
    // consoleLogFormDatas('formdatas', formdatas);
    let ids: string[] = [];
    formdatas?.forEach(async s => {
        const result = await uploadImagesToCloudinaryAndCreateCloudinaryData(s) as CloudinaryData;
        ids.push(result.id);
    });
    return ids;
};

export const getThumbnailCloudinaryDataId = async (formData: FormData) => {
    try {

        try {
            const path = formData?.get('path') as string;
            console.log('path', path);
            if (path) {
                const cdData = await prisma.cloudinaryData.findFirst({
                    where: {
                        path: path,
                        folder: 'openplace',
                    }
                });
                if (cdData) {
                    return cdData.id;
                }
                else {
                    console.log('cdData getCloudinaryDataIds not found: ', path);
                    const uploadedToCloudinary = await uploadToCloudinary(formData);
                    if (uploadedToCloudinary) {
                        const cdData = await prisma.cloudinaryData.create({
                            data: {
                                asset_id: uploadedToCloudinary.asset_id,
                                public_id: uploadedToCloudinary.public_id,
                                filename: uploadedToCloudinary.filename,
                                path: path,
                                format: uploadedToCloudinary.format,
                                bytes: uploadedToCloudinary.bytes,
                                folder: uploadedToCloudinary.folder,
                                secure_url: uploadedToCloudinary.secure_url,
                                thumbnail_url: uploadedToCloudinary.thumbnail_url,
                            }
                        });
                        if (cdData) {
                            return cdData.id;
                        }
                    }
                }
            }

        } catch (error) {
            console.log('uploadImages  error:', error);
            throw error;
        }

    } catch (error) {
        console.log('uploadImages ToCloudinaryAndCreateCloudinaryData error:', error);
        throw error;
    }
};

export const uploadImagesToCloudinaryAndCreateCloudinaryData = async (formData: any) => {
    try {
        // consoleLogFormData('formdata:', formData);
        const file = formData.get('file');
        const path = formData.get('path');
        // console.log(' path: ', path);
        try {
            if (path) {
                const res = await getCloudinaryDataByPath(path, "openplace");
                if (!res) {
                    const ci = await uploadToCloudinary(formData);
                    if (ci) {
                        ci.path = path;
                        const uploaded = await createCloudinaryData(ci);
                        return uploaded;
                    }
                    else {
                        console.log('uploadToCloudinary not completed');
                    }
                }
                else {
                    return res;
                }
            }
            else if (file) {
                const filename = file.name.split('.');

                const res = await getCloudinaryData('openplace', filename[0], filename[1]);
                if (!res) {
                    const ci = await uploadToCloudinary(formData);
                    if (ci) {
                        const uploaded = await createCloudinaryData(ci);
                        return uploaded;
                    }
                }
                else {
                    return res;
                }
            }

        } catch (error) {
            console.log('uploadImages  error:', error);
            throw error;
        }

    } catch (error) {
        console.log('uploadImages ToCloudinaryAndCreateCloudinaryData error:', error);
        throw error;
    }
};

// export const getThumbnailSecureUrl = (knowhow: any) => {
//     if (!knowhow) return;
//     const secure_url = knowhow.thumbnailCloudinaryData?.secure_url;
//     return secure_url;;
// };

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

