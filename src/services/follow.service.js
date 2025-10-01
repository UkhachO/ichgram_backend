import Follow from '../db/models/Follow.js';
import User from '../db/models/User.js';
import HttpError from '../utils/HttpError.js';
import { getIO } from '../utils/ws.js';

export const followUser = async ({ followerId, targetUserId }) => {
  if (followerId === String(targetUserId)) {
    throw new HttpError(400, 'You cannot follow yourself');
  }

  const exists = await User.exists({ _id: targetUserId });
  if (!exists) throw new HttpError(404, 'User not found');

  try {
    const doc = await Follow.create({
      follower: followerId,
      following: targetUserId,
    });

    try {
      const io = getIO?.();
      if (io) {
        io.to(`user:${targetUserId}`).emit('follow:new', {
          followerId,
          followingId: String(targetUserId),
          createdAt: doc.createdAt,
          _id: String(doc._id),
        });
      }
    } catch {
 
    }

    return { _id: doc._id };
  } catch (e) {
    if (e.code === 11000) throw new HttpError(409, 'Already following');
    throw e;
  }
};

export const unfollowUser = async ({ followerId, targetUserId }) => {
  const res = await Follow.findOneAndDelete({
    follower: followerId,
    following: targetUserId,
  });
  if (!res) throw new HttpError(404, 'Follow relation not found');
  return { ok: true };
};

const userPublicProjection = '_id username fullName avatar';

export const getFollowers = async ({ userId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', userPublicProjection)
      .lean(),
    Follow.countDocuments({ following: userId }),
  ]);

  return {
    page,
    limit,
    total,
    items: items.map((f) => ({
      _id: f.follower._id,
      username: f.follower.username,
      fullName: f.follower.fullName,
      avatar: f.follower.avatar,
      followedAt: f.createdAt,
    })),
  };
};

export const getFollowing = async ({ userId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('following', userPublicProjection)
      .lean(),
    Follow.countDocuments({ follower: userId }),
  ]);

  return {
    page,
    limit,
    total,
    items: items.map((f) => ({
      _id: f.following._id,
      username: f.following.username,
      fullName: f.following.fullName,
      avatar: f.following.avatar,
      followedAt: f.createdAt,
    })),
  };
};
