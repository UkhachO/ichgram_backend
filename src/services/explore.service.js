import Post from '../db/models/Post.js';
import Like from '../db/models/Like.js';

export const getExplorePosts = async (
  { page = 1, limit = 12 },
  currentUserId = null
) => {
 
  const size = limit;
  const pipeline = [
    { $sample: { size } },
    {
      $project: {
        _id: 1,
        author: 1,
        description: 1,
        imageUrl: 1,
        createdAt: 1,
        likes: 1,
      },
    },
  ];

  const itemsRaw = await Post.aggregate(pipeline);

  let likedIds = new Set();
  if (currentUserId && itemsRaw.length) {
    const postIds = itemsRaw.map((p) => p._id);
    const likes = await Like.find({
      user: currentUserId,
      post: { $in: postIds },
    })
      .select('post')
      .lean();

    likedIds = new Set(likes.map((l) => String(l.post)));
  }

  const items = itemsRaw.map((p) => ({
    id: String(p._id),
    author: String(p.author),
    description: p.description || '',
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    likes: p.likes || 0,
    likedByMe: likedIds.has(String(p._id)),
  }));

  return {
    items,
    page,
    limit,
  };
};
