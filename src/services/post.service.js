import Post from '../db/models/Post.js';
import HttpError from '../utils/HttpError.js';
import { uploadToCloudinary, deleteFromCloudinary } from './file.service.js';
import { isPostLikedByUser } from './like.service.js';

export const createPost = async ({ authorId, description, filePath }) => {
  if (!filePath) throw HttpError(400, 'Image file is required');

  const { url, publicId } = await uploadToCloudinary(filePath, {
    folder: 'posts',
  });

  const postDoc = await Post.create({
    author: authorId,
    description: (description || '').trim(),
    imageUrl: url,
    imagePublicId: publicId,
  });

  const populated = await postDoc.populate(
    'author',
    'username fullName avatarUrl'
  );
  const post = populated.toObject();
  post.likedByMe = false;
  return post;
};

export const updatePost = async ({ id, requesterId, description }) => {
  const post = await Post.findById(id);
  if (!post) throw HttpError(404, 'Post not found');

  const isOwner = String(post.author) === String(requesterId);
  if (!isOwner) throw HttpError(403, 'Forbidden');

  post.description = (description ?? post.description ?? '').trim();
  await post.save();

  const populated = await post.populate(
    'author',
    'username fullName avatarUrl'
  );
  const result = populated.toObject();
  result.likedByMe = await isPostLikedByUser({
    postId: id,
    userId: requesterId,
  });
  return result;
};

export const removePost = async ({ id, requesterId }) => {
  const post = await Post.findById(id);
  if (!post) throw HttpError(404, 'Post not found');

  const isOwner = String(post.author) === String(requesterId);
  if (!isOwner) throw HttpError(403, 'Forbidden');

  await deleteFromCloudinary(post.imagePublicId);
  await post.deleteOne();
};

export const listPosts = async ({
  author,
  page = 1,
  limit = 12,
  requesterId,
}) => {
  const q = {};
  if (author) q.author = author;

  const [items, total] = await Promise.all([
    Post.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl')
      .lean(),
    Post.countDocuments(q),
  ]);

  const enriched = await Promise.all(
    items.map(async (p) => ({
      ...p,
      likedByMe: await isPostLikedByUser({
        postId: p._id,
        userId: requesterId,
      }),
    }))
  );

  return {
    items: enriched,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};
