import * as followService from '../services/follow.service.js';

export const follow = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;
    const data = await followService.followUser({
      followerId,
      targetUserId: userId,
    });
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

export const unfollow = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;
    const data = await followService.unfollowUser({
      followerId,
      targetUserId: userId,
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

export const followers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const data = await followService.getFollowers({
      userId,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

export const following = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const data = await followService.getFollowing({
      userId,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
