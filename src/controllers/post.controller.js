import * as postService from '../services/post.service.js';
import {
  createPostSchema,
  updatePostSchema,
  listPostsSchema,
} from '../schemas/post.schemas.js';

export const create = async (req, res, next) => {
  try {
    const { value } = createPostSchema.validate(req.body, {
      abortEarly: false,
    });
    const post = await postService.createPost({
      authorId: req.user.id,
      description: value.description,
      fileBuffer: req.file?.buffer, // ← multer кладе buffer сюди
    });
    res.status(201).json({ ok: true, post });
  } catch (e) {
    next(e);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.json({ ok: true, post });
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await postService.deletePost({
      id: req.params.id,
      requesterId: req.user.id,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { value } = updatePostSchema.validate(req.body, {
      abortEarly: false,
    });
    const post = await postService.updatePost({
      id: req.params.id,
      requesterId: req.user.id,
      description: value.description,
      fileBuffer: req.file?.buffer,
    });
    res.json({ ok: true, post });
  } catch (e) {
    next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { value } = listPostsSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await postService.listPosts(value);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
