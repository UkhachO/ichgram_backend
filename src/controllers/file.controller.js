import * as fileService from '../services/file.service.js';
import User from '../db/models/User.js';

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { url, publicId } = await fileService.uploadToCloudinary(
      req.file.path
    );

    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatarPublicId) {
      try {
        await fileService.deleteFromCloudinary(user.avatarPublicId);
      } catch {}
    }

    user.avatarUrl = url;
    user.avatarPublicId = publicId;
    await user.save();

    res.status(201).json({ ok: true, url, publicId });
  } catch (e) {
    next(e);
  }
};
