import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import * as ctrl from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/read-all', authenticate, ctrl.readAll);
router.post('/:id/read', authenticate, ctrl.readOne);

export default router;
