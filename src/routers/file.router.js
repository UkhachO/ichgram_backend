import { Router } from 'express';
import authGuard from '../middlewares/authGuard.js';
import upload from '../middlewares/upload.js';
import * as fileCtrl from '../controllers/file.controller.js';

const router = Router();

router.post('/avatar', authGuard, upload.single('file'), fileCtrl.uploadAvatar);

export default router;
