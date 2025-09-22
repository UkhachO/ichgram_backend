import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import {
  validate,
  registerSchema,
  loginSchema,
} from '../validation/auth.schema.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/me', auth, asyncHandler(me));

export default router;
