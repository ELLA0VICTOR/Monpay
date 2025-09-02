// /backend/src/controllers/paymentController.js
import Transaction from '../models/Transaction.js';

/**
 * GET /api/payment/history
 * Protected. Returns recent payment transactions for the authenticated user.
 */
export async function getPaymentHistory(req, res) {
  const addr = req.user?.address;
  if (!addr) return res.status(401).json({ error: 'unauthenticated' });

  // return transactions where the user is the payer (from) or recipient (to), recent first
  const qs = {
    $or: [
      { from: addr.toLowerCase() },
      { to: addr.toLowerCase() }
    ]
  };

  const rows = await Transaction.find(qs)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  // normalize payload a bit for frontend
  const parsed = rows.map(r => ({
    txHash: r.hash,
    amount: r.payload?.amount || r.payload?.value || r.payload?.amountWei || null,
    status: r.status,
    type: r.type,
    createdAt: r.createdAt,
    creator: r.to,
    creatorName: r.payload?.creatorName || null,
    planId: r.payload?.planId || null,
    planName: r.payload?.planName || null
  }));

  return res.json(parsed);
}
