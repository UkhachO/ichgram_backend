import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import {
  followers,
  following,
  follow,
  unfollow,
} from '../controllers/follow.controller.js';

const router = Router();
router.post('/:userId', authenticate, follow); 
router.delete('/:userId', authenticate, unfollow); 


router.get('/:userId/followers', followers); 
router.get('/:userId/following', following);

export default router;
