import * as exploreService from '../services/explore.service.js';
import { explorePostsSchema } from '../schemas/explore.schemas.js';

export const getExplorePosts = async (req, res, next) => {
  try {
    const payload = await explorePostsSchema.validateAsync(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUserId = req.user?.id || null;

    const data = await exploreService.getExplorePosts(payload, currentUserId);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
