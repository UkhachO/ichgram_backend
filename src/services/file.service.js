import fs from 'node:fs/promises';
import cloudinary from '../utils/cloudinary.js';

const FOLDER = process.env.CLOUDINARY_FOLDER || 'ichgram';

export const uploadToCloudinary = async (localPath, options = {}) => {
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: options.folder || FOLDER,
      resource_type: 'image',
      overwrite: true,
    });
    return { url: res.secure_url, publicId: res.public_id };
  } finally {
    try {
      await fs.unlink(localPath);
    } catch {}
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch {}
};
