import { v2 as cloudinary } from 'cloudinary';

export const consoleLogFormData = (name: string, formData: FormData | undefined) => {
    if (formData) {
        const formDataObj = Object.fromEntries(formData.entries());
        console.log(name, JSON.stringify(formDataObj, null, 2));
    }

};
export const consoleLogFormDatas = (name: string, formDatas: FormData[]) => {
    formDatas.forEach(s => {
        if (s) {
            consoleLogFormData(name, s);
        }
    });

};

export const getSecureUrl = (imageFormData: FormData) => {
    const file = imageFormData.get('file');
    if (file instanceof File) {
        // Handle the file
    } else if (typeof file === 'string') {
        // Handle the string
    } else {
        // Handle the null case
    }

    console.log('file: ', file)

}

const cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export async function getSignature(foldername: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: foldername },
        cloudinaryConfig.api_secret as string
    );

    return { timestamp, signature };
}


export const setFormdata = async (file: File, foldername: string) => {

    const { timestamp, signature } = await getSignature(foldername);
    const imageFormData = new FormData();
    // imageFormData.append('file', file);
    // imageFormData.append('path', file?.path ? file?.path : 'notfound');
    // imageFormData.append('cdId', file.id);
    imageFormData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
    imageFormData.append('signature', signature);
    imageFormData.append('timestamp', timestamp.toString());
    imageFormData.append('folder', foldername);
    imageFormData.append('upload-preset', 'open-place');
    return imageFormData;
};
