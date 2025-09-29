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
    const { value } = listLikesSchema.validate(req.query, {
      abortEarly: false,
    });
    const { id } = req.params;
    const data = await likeService.listLikesForPost({ postId: id, ...value });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
