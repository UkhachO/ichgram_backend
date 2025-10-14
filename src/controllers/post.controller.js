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
      filePath: req.file?.path,
    });
    res.status(201).json({ ok: true, data: post });
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
    });
    res.json({ ok: true, data: post });
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    await postService.removePost({
      id: req.params.id,
      requesterId: req.user.id,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { value } = listPostsSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await postService.listPosts({
      ...value,
      requesterId: req.user?.id,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const post = await postService.getPostById({
      id: req.params.id,
      requesterId: req.user?.id,
    });
    res.json({ ok: true, data: post });
  } catch (e) {
    next(e);
  }
};
