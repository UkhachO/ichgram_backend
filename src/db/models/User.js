import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, default: null },
    verifyTokenExpiresAt: { type: Date, default: null },

    passwordChangedAt: { type: Date },

    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordTokenExp: { type: Date, default: null },
    resetPasswordUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(String(this.password), 10);
  next();
});

userSchema.methods.isPasswordValid = function (candidate) {
  return bcrypt.compare(String(candidate), this.password);
};

export default mongoose.model('User', userSchema);
