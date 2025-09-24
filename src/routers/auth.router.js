import { Router } from 'express';
import authGuard from '../middlewares/authGuard.js';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', authGuard, ctrl.logout);
router.get('/me', authGuard, ctrl.me);

export default router;
