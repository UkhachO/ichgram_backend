import Notification from '../db/models/Notification.js';
import HttpError from '../utils/HttpError.js';
import { getIO } from '../utils/ws.js';

export const create = async ({
  recipientId,
  actorId,
  type,
  postId = null,
  commentId = null,
}) => {
  if (String(recipientId) === String(actorId)) return null;

  const doc = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    post: postId,
    comment: commentId,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${recipientId}`).emit('notification:new', {
      _id: doc._id,
      type,
      post: postId,
      comment: commentId,
      actor: actorId,
      createdAt: doc.createdAt,
    });
  }

  return doc;
};

export const list = async ({ userId, page = 1, limit = 20 }) => {
  const q = { recipient: userId };
  const [items, total] = await Promise.all([
    Notification.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'username fullName avatarUrl')
      .populate('post', '_id')
      .populate('comment', '_id')
      .lean(),
    Notification.countDocuments(q),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
};

export const markOneRead = async ({ userId, notificationId }) => {
  const res = await Notification.updateOne(
    { _id: notificationId, recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
  if (!res.matchedCount) throw HttpError(404, 'Notification not found');
  return { updated: res.modifiedCount || 0 };
};

export const markAllRead = async ({ userId }) => {
  const res = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
  return { updated: res.modifiedCount || 0 };
};
