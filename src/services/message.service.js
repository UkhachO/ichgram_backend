import Message from '../db/models/Message.js';
import User from '../db/models/User.js';
import HttpError from '../utils/HttpError.js';
import mongoose from 'mongoose';

export const sendMessage = async ({ fromId, toId, text }) => {
  if (!mongoose.isValidObjectId(toId))
    throw HttpError(400, 'Invalid recipient');
  const toUser = await User.findById(toId).select('_id');
  if (!toUser) throw HttpError(404, 'Recipient not found');

  const doc = await Message.create({ from: fromId, to: toId, text });
  const populated = await doc
    .populate('from', 'username fullName')
    .populate('to', 'username fullName');

  return {
    id: populated.id,
    from: populated.from,
    to: populated.to,
    text: populated.text,
    createdAt: populated.createdAt,
    readAt: populated.readAt,
  };
};

export const getDialog = async ({ userId, withId, limit = 30, before }) => {
  if (!mongoose.isValidObjectId(withId)) throw HttpError(400, 'Invalid user');

  const match = {
    $or: [
      { from: userId, to: withId },
      { from: withId, to: userId },
    ],
  };
  if (before) match.createdAt = { $lt: new Date(before) };

  const items = await Message.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('from', 'username fullName')
    .populate('to', 'username fullName')
    .lean();

  return { items: items.reverse() }; 
};

export const markAsRead = async ({ userId, fromId }) => {
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
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$partner',
        lastMessage: { $first: '$$ROOT' },
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
        partner: {
          _id: '$partner._id',
          username: '$partner.username',
          fullName: '$partner.fullName',
        },
        lastMessage: {
          _id: '$lastMessage._id',
          from: '$lastMessage.from',
          to: '$lastMessage.to',
          text: '$lastMessage.text',
          createdAt: '$lastMessage.createdAt',
        },
        unread: 1,
      },
    },
  ];

  const items = await Message.aggregate(pipeline);
  return { items };
};
