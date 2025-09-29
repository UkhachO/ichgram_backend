import User from '../db/models/User.js';

export const searchUsers = async ({ q, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;

  const usernameRe = new RegExp(`^${q}`, 'i');
  const nameRe = new RegExp(q, 'i');

  const where = { $or: [{ username: usernameRe }, { fullName: nameRe }] };

  const [items, total] = await Promise.all([
    User.find(where)
      .select('_id username fullName avatarUrl isVerified')
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(where),
  ]);

  return {
    items: items.map((u) => ({
      id: String(u._id),
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl || null,
      isVerified: !!u.isVerified,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};
