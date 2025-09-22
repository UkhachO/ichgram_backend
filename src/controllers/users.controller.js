import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { _id, name, bio, profileImageUrl, createdAt } = user;
    res.json({ user: { _id, name, bio, profileImageUrl, createdAt } });
  } catch (e) {
    next(e);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).lean();
    if (!me) return res.status(404).json({ message: 'User not found' });

    const { _id, name, bio, profileImageUrl, createdAt, email } = me;
    res.json({ user: { _id, name, bio, profileImageUrl, createdAt, email } });
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (req.user.id !== targetId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, bio } = req.body;
    const updateData = {};
    if (typeof name === 'string') updateData.name = name.trim();
    if (typeof bio === 'string') updateData.bio = bio.trim();

    if (req.file?.path) {

      const current = await User.findById(targetId).select('profileImageId');
      if (current?.profileImageId) {
        try {
          await cloudinary.uploader.destroy(current.profileImageId);
        } catch {}
      }

      updateData.profileImageUrl = req.file.path;
      updateData.profileImageId = req.file.filename; 
    }

    const updated = await User.findByIdAndUpdate(
      targetId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });

    const { _id, profileImageUrl, createdAt } = updated;
    res.json({
      message: 'Profile updated',
      user: {
        _id,
        name: updated.name,
        bio: updated.bio,
        profileImageUrl,
        createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
};
