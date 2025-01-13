'use server';

import { v2 as cloudinary } from 'cloudinary';
import { CloudiaryInfo } from '../lib/types';

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

const imgExists = async (filename: string) => {
  const cloudinaryInfoArray = await getAssetResources();
  const result = [cloudinaryInfoArray?.some(s => s.filename === filename), cloudinaryInfoArray];
  // return cloudinaryInfoArray?.some(s => s.filename === filename);
  return result;
};

export async function uploadToCloudinary(formData: FormData) {
  try {

    const endpoint = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL as string;
    const data = await fetch(endpoint, {
      method: 'POST',
      body: formData
    }).then(res => res.json());

    // console.log('upload result to cloudinary:', data);

    const ci: CloudiaryInfo = {
      asset_id: data.asset_id,
      public_id: data.public_id,
      filename: data.path,
      // filename: data.public_id.split('_')[0],
      path: data.path,
      format: data.format,
      bytes: data.bytes,
      folder: data.folder,
      secure_url: data.secure_url,
      thumbnail_url: data.thumbnail_url,
    };
    // console.log('uploadToCloudinary result: ', ci);
    return ci;
  } catch (error) {
    console.log('uploadToCloudinary error:', error);
    throw error;
  }
}

export async function uploadFile(formData: FormData) {
  try {

    console.log('uploadFile: ')
    const folder: FormDataEntryValue | null = formData.get('folder');
    const file: FormDataEntryValue | null = formData.get('file');
    console.log('uploadFile file: ', file)
    const name = '';
    // const name = file?.name.split('.')[0];
    const filename = `${folder}/${name}`;
    const result = await imgExists(filename);
    if (!result[0]) {
      // console.log('uploading...');
      const endpoint = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL as string;
      const data = await fetch(endpoint, {
        method: 'POST',
        body: formData
      }).then(res => res.json());
      const ci: CloudiaryInfo = {
        asset_id: data.asset_id,
        public_id: data.public_id,
        filename: data.public_id.split('_')[0],
        path: data.path,
        format: data.format,
        bytes: data.bytes,
        folder: data.folder,
        secure_url: data.secure_url,
        thumbnail_url: data.thumbnail_url,
      };
      // console.log('uploadToCloudinary result: ', ci);
      return ci;
    } else {
      console.log('resources:', result[1]);
      console.log('file already exists...');
    }

  } catch (error) {
    console.log('uploadFile error:', error);
    throw error;
  }
}

const getThumbnailImgUrlByFilename = async (filename: string) => {
  // console.log('search for thumbnail ')
  const resources = await getAssetResources();
  const res = resources?.find(s => s.filename === filename);
  // console.log('secure_url:',res?.secure_url)

  return res?.thumbnail_url;
};

export const getImgUrlByFilename = async (foldername: string, filename: string) => {
  const folderFilename = await convertToPublic_id(foldername, filename);
  const searchExp = `resource_type:image AND public_id:${folderFilename}*`;
  try {
    const result = await cloudinary.search.expression(searchExp).max_results(2).execute();
    if (result && result.total_count === 1) {
      return result.resources[0].secure_url;
    }
  } catch (error) {
    console.log('getImgUrlByFilename error: ', error);
    throw error;
  }

};

export async function convertToPublic_id(foldername: string, fileName: string) {
  const name = fileName.split('.')[0];
  const pid = `${foldername}/${name}`;
  return pid;
}

export async function getThumbnailImgUrlFromCloudinary(foldername: string, filename: string) {
  const folderFilename = await convertToPublic_id(foldername, filename);
  // console.log('folderFilename', folderFilename);
  const exists = await imgExists(folderFilename);
  // console.log('exists', exists);
  if (exists) {
    return await getThumbnailImgUrlByFilename(folderFilename);
  }

}

export async function saveToDatabase({ public_id, version, signature }: { public_id: string, version: string, signature: string; }) {
  // verify the data
  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id, version },
    cloudinaryConfig.api_secret as string
  );

  if (expectedSignature === signature) {
    // safe to write to database
    console.log('saveToDatabase in cloudinary: ', { public_id });
    // throw error;

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

export async function getAssetDetail(publicId: string) {

  try {
    const result = cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.log('getAssetDetail error: ', error);
    throw error;
  }

}

export async function deleteCloudinary() {

  //delete many
  cloudinary.api.delete_resources(['docs/strawberries', 'docs/owl']).then(result => console.log(result));
  // delete by tag keep original:true
  cloudinary.api.delete_resources_by_tag('test').then(result => console.log(result));

  //delete with prefix
  cloudinary.api.delete_resources_by_prefix('docs/').then(result => console.log(result));

  //to delete various transformation use invalidate: true
  cloudinary.uploader.destroy('publicId', { resource_type: 'video', invalidate: true, type: 'authenticated' }).then(result => console.log(result));

}

export async function getCloudinaryFolersUrl(publicId: string) {
  // return `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/folders`;
  const ci: CloudiaryInfo = await getAssetDetail(publicId) as CloudiaryInfo;
  return ci.folder;
}

