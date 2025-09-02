import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  hash: { type: String, unique: true },
  from: String,
  to: String,
  status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
  type: { type: String, enum: ['meta', 'renewal', 'withdraw', 'subscribe'], default: 'meta' },
  payload: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
