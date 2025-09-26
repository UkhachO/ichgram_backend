import fs from 'node:fs/promises';
import cloudinary from '../utils/cloudinary.js';

const FOLDER = process.env.CLOUDINARY_FOLDER || 'ichgram';

export const uploadToCloudinary = async (localPath, options = {}) => {
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: FOLDER,
      resource_type: 'image',
      ...options,
    });
    return { url: res.secure_url, publicId: res.public_id };
  } finally {
    try {
      await fs.unlink(localPath);
    } catch {}
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return { ok: true };
  await cloudinary.uploader.destroy(publicId);
  return { ok: true };
};

export const uploadBufferToCloudinary = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || 'uploads',
        resource_type: 'image',
        overwrite: true,
      },
      (err, res) =>
        err
          ? reject(err)
          : resolve({ url: res.secure_url, publicId: res.public_id })
    );
    stream.end(buffer);
  });



