import { Router } from 'express';
import * as exploreController from '../controllers/explore.controller.js';

const router = Router();

router.get('/posts', exploreController.getExplorePosts);

export default router;
