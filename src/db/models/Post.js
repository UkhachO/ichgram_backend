import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default model('Post', postSchema);
