import { CloudinaryData } from "@prisma/client";

export function getCloudinaryFile(thumbnailCloudinaryData: CloudinaryData[]) {
    let fs: CloudinaryFile[] = [];
    thumbnailCloudinaryData?.forEach((s: any) => {
        let f = new CloudinaryFile([], '');
        f.preview = s.thumbnailCloudinaryData?.secure_url;
        f.filename = s.thumbnailCloudinaryData?.filename;
        f.path = s.thumbnailCloudinaryData?.path;
        f.cloudinaryDataId = s.thumbnailCloudinaryData?.id;
        fs.push(f);
    });
    return fs;
};

export class CloudinaryFile extends File {
    filename: string | undefined | null;
    preview: string | undefined | null;
    cloudinaryDataId: string | undefined;
    path: string | undefined | null;

};
