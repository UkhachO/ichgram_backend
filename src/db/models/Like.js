import { Schema, model } from 'mongoose';

const likeSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ post: 1, user: 1 }, { unique: true });
likeSchema.index({ createdAt: -1 });

export default model('Like', likeSchema);
