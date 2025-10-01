import Notification from '../db/models/Notification.js';
import HttpError from '../utils/HttpError.js';
import mongoose from 'mongoose';
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
    post: postId || undefined,
    comment: commentId || undefined,
  });

  const populated = await doc
    .populate('actor', 'username fullName avatarUrl')
    .populate('post', 'imageUrl')
    .populate('comment', 'text');

  try {
    const io = getIO && getIO();
    if (io) {
      io.to(`user:${recipientId}`).emit('notification:new', {
        id: populated._id,
        type: populated.type,
        actor: populated.actor,
        post: populated.post,
        comment: populated.comment,
        createdAt: populated.createdAt,
      });
    }
  } catch {}

  return populated;
};

export const list = async ({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false,
}) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));

  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'username fullName avatarUrl')
      .populate('post', 'imageUrl')
      .populate('comment', 'text')
      .lean(),
    Notification.countDocuments(query),
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const markOneRead = async ({ userId, notificationId }) => {
  if (!mongoose.isValidObjectId(notificationId))
    throw HttpError(400, 'Invalid id');
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
