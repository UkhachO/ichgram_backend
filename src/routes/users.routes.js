import { Router } from 'express';
import {
  getProfile,
  getMe,
  updateProfile,
} from '../controllers/users.controller.js';
import { auth } from '../middlewares/auth.js'; 
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/:id', getProfile);

router.get('/me/info', auth, getMe);

router.patch('/:id', auth, upload.single('profileImage'), updateProfile);

export default router;
