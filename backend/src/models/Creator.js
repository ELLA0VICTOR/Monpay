import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true, lowercase: true },
  displayName: { type: String, required: true },
  bio: { type: String, default: '' },
  plans: [{
    planId: Number,
    price: String,      // in wei, as string
    period: Number,
    name: String,
    description: String,
    active: Boolean
  }],
  analytics: {
    subscribers: { type: Number, default: 0 },
    revenueWei: { type: String, default: '0' },
    contentCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('Creator', CreatorSchema);
