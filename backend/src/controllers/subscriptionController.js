import Subscription from '../models/Subscription.js';

export async function upsertSubscription(req, res) {
  const { subscriber, planId, creator, expiresAt, autoRenew, months } = req.body;
  const doc = await Subscription.findOneAndUpdate(
    { subscriber: subscriber.toLowerCase(), planId },
    { subscriber: subscriber.toLowerCase(), planId, creator: creator.toLowerCase(), expiresAt, autoRenew, months },
    { upsert: true, new: true }
  );
  res.json(doc);
}

export async function mySubscriptions(req, res) {
  const me = req.user.address;
  const list = await Subscription.find({ subscriber: me }).sort({ updatedAt: -1 });
  res.json(list);
}

export async function cancelAutoRenew(req, res) {
  const me = req.user.address;
  const { planId } = req.body;
  await Subscription.findOneAndUpdate({ subscriber: me, planId }, { autoRenew: false });
  res.json({ ok: true });
}
