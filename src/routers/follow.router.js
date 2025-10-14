import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';

import * as followController from '../controllers/follow.controller.js';

const router = Router();

router.post('/:userId', authenticate, followController.follow);
router.delete('/:userId', authenticate, followController.unfollow);
router.get('/followers/:userId', authenticate, followController.listFollowers);
router.get('/following/:userId', authenticate, followController.listFollowing);

export default router;
