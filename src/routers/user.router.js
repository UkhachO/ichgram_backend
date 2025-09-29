import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/search', userController.searchUsers);

export default router;
