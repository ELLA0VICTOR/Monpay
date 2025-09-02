import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  subscriber: { type: String, index: true, lowercase: true },
  planId: { type: Number, index: true },
  creator: { type: String, index: true, lowercase: true },
  expiresAt: { type: Date, index: true },
  autoRenew: { type: Boolean, default: false },
  months: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Subscription', SubscriptionSchema);
