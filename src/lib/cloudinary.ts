import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(file: Buffer, folder: string = 'trends'): Promise<string> {
  try {
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            format: 'jpg',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto:good' },
            ],
          },
          (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('No result from Cloudinary'));
          }
        )
        .end(file);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
} 