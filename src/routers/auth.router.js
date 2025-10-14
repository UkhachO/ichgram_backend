import { Router } from 'express';
import validateBody from '../decorators/validateBody.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import {
  register,
  verifyEmail,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import authenticate from '../middlewares/authenticate.js';

import normalizeLogin from '../middlewares/normalizeLogin.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);

router.get('/verify', verifyEmail);

router.post('/login', normalizeLogin, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

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
