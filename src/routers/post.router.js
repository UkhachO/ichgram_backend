import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js'; // multer memoryStorage
import {
  create,
  getOne,
  remove,
  update,
  list,
} from '../controllers/post.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);

router.post('/', authenticate, upload.single('file'), create);
router.patch('/:id', authenticate, upload.single('file'), update);
router.delete('/:id', authenticate, remove);

export default router;
