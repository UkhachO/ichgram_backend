import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import * as ctrl from '../controllers/message.controller.js';

const router = Router();

router.get('/', authenticate, ctrl.conversations);
router.get('/:userId', authenticate, ctrl.dialog);
router.post('/:userId', authenticate, ctrl.send);
router.post('/:userId/read', authenticate, ctrl.read);

export default router;
