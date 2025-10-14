import Comment from '../db/models/Comment.js';
import Post from '../db/models/Post.js';
import HttpError from '../utils/HttpError.js';
import * as notificationService from './notification.service.js';

export const addComment = async ({ postId, authorId, text }) => {
  const post = await Post.findById(postId);
  if (!post) throw HttpError(404, 'Post not found');

  const comment = await Comment.create({
    post: postId,
    author: authorId,
    text: String(text || '').trim(),
  });

  await notificationService.create({
    recipientId: post.author,
    actorId: authorId,
    type: 'comment',
    postId,
    commentId: comment._id,
  });

  return comment
    .populate('author', 'username fullName avatarUrl')
    .then((d) => d.toObject());
};

export const listCommentsForPost = async ({ postId, page = 1, limit = 20 }) => {
  const query = { post: postId };
  const [items, total] = await Promise.all([
    Comment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl')
      .lean(),
    Comment.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const removeComment = async ({ commentId, requesterId }) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw HttpError(404, 'Comment not found');

  const isOwner = String(comment.author) === String(requesterId);
  if (!isOwner) throw HttpError(403, 'Forbidden');

  await comment.deleteOne();
};
