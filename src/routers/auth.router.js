import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import * as v from '../controllers/verify.controller.js'; 
const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', ctrl.me);

// 👇 нові
router.post('/verify/send', v.resend);
router.get('/verify/:token', v.verify);

export default router;
