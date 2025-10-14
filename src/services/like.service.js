import Like from '../db/models/Like.js';
import Post from '../db/models/Post.js';
import HttpError from '../utils/HttpError.js';
import * as notificationService from './notification.service.js';

export const toggleLike = async ({ postId, userId }) => {
  const post = await Post.findById(postId);
  if (!post) throw HttpError(404, 'Post not found');

  const existing = await Like.findOne({ post: postId, user: userId });
  if (existing) {
    await existing.deleteOne();
    await Post.updateOne({ _id: postId }, { $inc: { likes: -1 } });
    return { liked: false };
  }

  await Like.create({ post: postId, user: userId });
  await Post.updateOne({ _id: postId }, { $inc: { likes: 1 } });

  await notificationService.create({
    recipientId: post.author,
    actorId: userId,
    type: 'like',
    postId,
  });

  return { liked: true };
};

export const listLikesForPost = async ({ postId, page = 1, limit = 20 }) => {
  const query = { post: postId };
  const [items, total] = await Promise.all([
    Like.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username fullName avatarUrl')
      .lean(),
    Like.countDocuments(query),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
};

export const isPostLikedByUser = async ({ postId, userId }) => {
  if (!userId) return false;
  const exists = await Like.exists({ post: postId, user: userId });
  return Boolean(exists);
};
