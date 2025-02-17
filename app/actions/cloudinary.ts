'use server';
import { v2 as cloudinary } from 'cloudinary';
import { CloudiaryInfo, CustomFile } from '../lib/types';
import { consoleLogFormData } from '../lib/formData';

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

export const getFormdata = async (file: CustomFile, foldername: string) => {
  const { timestamp, signature } = await getSignature(foldername);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', foldername);
  formData.append('upload-preset', 'open-place');
  return formData;
};

export async function uploadToCloudinary(formData: FormData) {
  try {
    consoleLogFormData('uploadToCloudinary', formData)
    const { timestamp, signature } = await getSignature('hdkn');
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', 'hdkn');
    formData.append('upload-preset', 'open-place');
    try {
      const endpoint = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL as string;
      const data = await fetch(endpoint, {
        method: 'POST',
        body: formData
      }).then(res => res.json());

      console.log('upload result to cloudinary(return  value):', data);
      const ci: CloudiaryInfo = {
        asset_id: data.asset_id,
        public_id: data.public_id,
        filename: data.original_filename,
        path: data.path,
        format: data.format,
        bytes: data.bytes,
        folder: data.folder,
        width: data.width,
        height: data.height,
        url: data.url,
        secure_url: data.secure_url,
        thumbnail_url: data.thumbnail_url,
      };
      return ci;
    } catch (error) {
      console.log('uploadToCloudinary error:', error);
      throw error;
    }

  } catch (error) {
    console.log('uploadToCloudinary error:', error);
    throw error;
  }
}

export async function getAssetResources() {
  try {
    const result = await cloudinary.api.resources();
    const { resources }: { resources: CloudiaryInfo[]; } = result;
    const cloudinaryInfoArray: CloudiaryInfo[] = [];

    resources?.forEach(s => {
      const tn = s.secure_url.split('upload');
      const thtag = 'c_thumb,w_200,g_face';
      const thumbnail_url = `${tn[0]}upload/${thtag}${tn[1]}`;
      const ci: CloudiaryInfo = {
        asset_id: s.asset_id,
        public_id: s.public_id,
        filename: s.public_id.split('_')[0],
        path: s.path,
        format: s.format,
        bytes: s.bytes,
        folder: s.folder,
        width: s.width,
        height: s.height,
        url: s.url,
        secure_url: s.secure_url,
        thumbnail_url: thumbnail_url,
      };
      ci.filename = s.public_id.split('_')[0];
      cloudinaryInfoArray.push(ci);
    });
    return cloudinaryInfoArray;
  } catch (error) {
    console.log('getAssetResources in cloudinary error:', error);
    throw error;
  }
}


