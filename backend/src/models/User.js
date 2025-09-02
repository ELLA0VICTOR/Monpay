// /backend/src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true, lowercase: true },
  username: { type: String },
  avatar: { type: String },
  nonce: { type: String }, // random nonce for auth
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
