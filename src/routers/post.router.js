import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';
import {
  create,
  getOne,
  remove,
  update,
  list,
} from '../controllers/post.controller.js';
import {
  toggle as toggleLike,
  listForPost as listLikes,
} from '../controllers/like.controller.js';
import {
  create as addComment,
  listForPost as listComments,
  remove as removeComment,
} from '../controllers/comment.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);

router.post('/', authenticate, upload.single('file'), create);
router.patch('/:id', authenticate, upload.single('file'), update);
router.delete('/:id', authenticate, remove);

router.post('/:id/likes/toggle', authenticate, toggleLike);
router.get('/:id/likes', listLikes);

router.post('/:id/comments', authenticate, addComment);
router.get('/:id/comments', listComments);
router.delete('/comments/:commentId', authenticate, removeComment);

export default router;
