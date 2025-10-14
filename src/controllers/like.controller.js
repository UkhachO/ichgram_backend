import * as likeService from '../services/like.service.js';
import { listLikesSchema } from '../schemas/like.schemas.js';

export const toggle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await likeService.toggleLike({
      postId: id,
      userId: req.user.id,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const listForPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = listLikesSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await likeService.listLikesForPost({
      postId: id,
      page: Number(value.page) || 1,
      limit: Number(value.limit) || 20,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const isLiked = async (req, res, next) => {
  try {
    const { id } = req.params;
    const liked = await likeService.isPostLikedByUser({
      postId: id,
      userId: req.user?.id,
    });
    res.json({ ok: true, liked });
  } catch (e) {
    next(e);
  }
};
