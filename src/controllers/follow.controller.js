import * as followService from '../services/follow.service.js';
import HttpError from '../utils/HttpError.js';

export const follow = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const data = await followService.followUser({
      requesterId: req.user.id,
      targetUserId,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const unfollow = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const data = await followService.unfollowUser({
      requesterId: req.user.id,
      targetUserId,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const listFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await followService.listFollowers({
      userId,
      page,
      limit,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const listFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await followService.listFollowing({
      userId,
      page,
      limit,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
