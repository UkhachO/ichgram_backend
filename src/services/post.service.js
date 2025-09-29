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

export const getPostById = async ({ id, requesterId }) => {
  const postDoc = await Post.findById(id).populate(
    'author',
    'username fullName avatarUrl'
  );
  if (!postDoc) throw HttpError(404, 'Post not found');

  const isOwner =
    requesterId && String(postDoc.author._id) === String(requesterId);
  const likedByMe = requesterId
    ? await isPostLikedByUser({ postId: id, userId: requesterId })
    : false;

  const post = postDoc.toObject();
  post.likedByMe = likedByMe;

  return { post, isOwner };
};

export const updatePost = async ({
  id,
  requesterId,
  description,
  filePath,
}) => {
  const postDoc = await Post.findById(id);
  if (!postDoc) throw HttpError(404, 'Post not found');

  if (String(postDoc.author) !== String(requesterId)) {
    throw HttpError(403, 'Forbidden');
  }

  if (typeof description === 'string') {
    postDoc.description = description.trim();
  }

  if (filePath) {
    
    if (postDoc.imagePublicId) {
      await deleteFromCloudinary(postDoc.imagePublicId);
    }
    const { url, publicId } = await uploadToCloudinary(filePath, {
      folder: 'posts',
    });
    postDoc.imageUrl = url;
    postDoc.imagePublicId = publicId;
  }

  await postDoc.save();

  const populated = await postDoc.populate(
    'author',
    'username fullName avatarUrl'
  );
  const post = populated.toObject();
  return post;
};

export const removePost = async ({ id, requesterId }) => {
  const postDoc = await Post.findById(id);
  if (!postDoc) throw HttpError(404, 'Post not found');

  if (String(postDoc.author) !== String(requesterId)) {
    throw HttpError(403, 'Forbidden');
  }

  if (postDoc.imagePublicId) {
    await deleteFromCloudinary(postDoc.imagePublicId);
  }

  await postDoc.deleteOne();
  return { ok: true };
};

export const listPosts = async ({
  author,
  page = 1,
  limit = 12,
  requesterId,
}) => {
  const query = author ? { author } : {};

  const [docs, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl'),
    Post.countDocuments(query),
  ]);

  const items = await Promise.all(
    docs.map(async (doc) => {
      const likedByMe = requesterId
        ? await isPostLikedByUser({ postId: doc._id, userId: requesterId })
        : false;
      const post = doc.toObject();
      post.likedByMe = likedByMe;
      return post;
    })
  );

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};
