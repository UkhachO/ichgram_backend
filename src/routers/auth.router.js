import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import validateBody from '../decorators/validateBody.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

router.get('/verify/:token', verifyEmail);

router.post(
  '/password/forgot',
  validateBody(forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/password/reset',
  validateBody(resetPasswordSchema),
  resetPassword
);

export default router;
