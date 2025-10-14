import mongoose from 'mongoose';
import Message from '../db/models/Message.js';
import User from '../db/models/User.js';
import HttpError from '../utils/HttpError.js';

export const sendMessage = async ({ fromId, toId, text }) => {
  if (!mongoose.isValidObjectId(toId))
    throw HttpError(400, 'Invalid recipient');
  const toUser = await User.findById(toId).select('_id');
  if (!toUser) throw HttpError(404, 'Recipient not found');

  const doc = await Message.create({
    from: fromId,
    to: toId,
    text: String(text || '').trim(),
  });

  const populated = await doc
    .populate('from', 'username fullName avatarUrl')
    .populate('to', 'username fullName avatarUrl');

  return populated.toObject();
};

export const listDialog = async ({
  userId,
  partnerId,
  limit = 30,
  before = null,
}) => {
  if (!mongoose.isValidObjectId(partnerId))
    throw HttpError(400, 'Invalid partner');

  const q = {
    $or: [
      { from: userId, to: partnerId },
      { from: partnerId, to: userId },
    ],
  };
  if (before) q.createdAt = { $lt: before };

  const items = await Message.find(q)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('from', 'username fullName avatarUrl')
    .populate('to', 'username fullName avatarUrl')
    .lean();

  return { items: items.reverse(), limit, hasMore: items.length === limit };
};

export const markAsRead = async ({ userId, fromId }) => {
  if (!mongoose.isValidObjectId(fromId))
    throw HttpError(400, 'Invalid partner');
  const res = await Message.updateMany(
    { to: userId, from: fromId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return { updated: res.modifiedCount || 0 };
};

export const getConversations = async ({ userId }) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const pipeline = [
    { $match: { $or: [{ from: uid }, { to: uid }] } },
    {
      $addFields: {
        partner: { $cond: [{ $eq: ['$from', uid] }, '$to', '$from'] },
        isUnread: {
          $cond: [
            { $and: [{ $eq: ['$to', uid] }, { $eq: ['$readAt', null] }] },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$partner',
        lastMessage: { $last: '$$ROOT' },
        unread: { $sum: '$isUnread' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner',
      },
    },
    { $unwind: '$partner' },
    {
      $project: {
        partner: { _id: 1, username: 1, fullName: 1, avatarUrl: 1 },
        lastMessage: {
          _id: '$lastMessage._id',
          from: '$lastMessage.from',
          to: '$lastMessage.to',
          text: '$lastMessage.text',
          createdAt: '$lastMessage.createdAt',
          readAt: '$lastMessage.readAt',
        },
        unread: 1,
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ];

  const items = await Message.aggregate(pipeline);
  return { items };
};
