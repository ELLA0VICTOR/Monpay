import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  creator: { type: String, index: true, lowercase: true },
  contentId: { type: Number, index: true },
  uri: String,
  title: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Content', ContentSchema);
