import Post from '../db/models/Post.js';
import HttpError from '../utils/HttpError.js';
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from './file.service.js';

export const createPost = async ({ authorId, description, fileBuffer }) => {
  if (!fileBuffer) throw HttpError(400, 'Image file is required');

  const { url, publicId } = await uploadBufferToCloudinary(fileBuffer, {
    folder: 'posts',
  });

  const post = await Post.create({
    author: authorId,
    description: description?.trim() || '',
    imageUrl: url,
    imagePublicId: publicId,
  });

  return post;
};

export const getPostById = async (id) => {
  const post = await Post.findById(id).populate(
    'author',
    'username fullName avatarUrl'
  );
  if (!post) throw HttpError(404, 'Post not found');
  return post;
};

export const deletePost = async ({ id, requesterId }) => {
  const post = await Post.findById(id);
  if (!post) throw HttpError(404, 'Post not found');
  if (String(post.author) !== String(requesterId))
    throw HttpError(403, 'Forbidden');

  await deleteFromCloudinary(post.imagePublicId);
  await post.deleteOne();
  return { ok: true };
};

export const updatePost = async ({
  id,
  requesterId,
  description,
  fileBuffer,
}) => {
  const post = await Post.findById(id);
  if (!post) throw HttpError(404, 'Post not found');
  if (String(post.author) !== String(requesterId))
    throw HttpError(403, 'Forbidden');

  if (typeof description === 'string') post.description = description.trim();

  if (fileBuffer) {
    await deleteFromCloudinary(post.imagePublicId);
    const { url, publicId } = await uploadBufferToCloudinary(fileBuffer, {
      folder: 'posts',
    });
    post.imageUrl = url;
    post.imagePublicId = publicId;
  }

  await post.save();
  return post;
};

export const listPosts = async ({ author, page = 1, limit = 12 }) => {
  const query = author ? { author } : {};
  const [items, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl'),
    Post.countDocuments(query),
  ]);

  return { items, page, limit, total, pages: Math.ceil(total / limit) || 1 };
};
