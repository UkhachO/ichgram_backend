import * as commentService from '../services/comment.service.js';
import {
  createCommentSchema,
  listCommentsSchema,
} from '../schemas/comment.schemas.js';
import HttpError from '../utils/HttpError.js';

export const create = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = createCommentSchema.validate(req.body, {
      abortEarly: false,
    });
    const comment = await commentService.addComment({
      postId: id,
      authorId: req.user.id,
      text: value.text,
    });
    res.status(201).json({ ok: true, comment });
  } catch (e) {
    next(e);
  }
};

export const listForPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = listCommentsSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await commentService.listCommentsForPost({
      postId: id,
      ...value,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    if (!commentId) throw HttpError(400, 'commentId is required');
    await commentService.removeComment({ commentId, requesterId: req.user.id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
