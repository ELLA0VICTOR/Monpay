// /backend/src/controllers/creatorController.js
import Creator from '../models/Creator.js';

/**
 * Upsert profile for currently authenticated user
 * POST /api/creator/profile (existing)
 */
export async function upsertProfile(req, res) {
  const owner = req.user.address;
  const { displayName, bio } = req.body;
  const doc = await Creator.findOneAndUpdate(
    { owner },
    { displayName, bio },
    { upsert: true, new: true }
  );
  res.json(doc);
}

/**
 * GET /api/creator/:address
 */
export async function getProfile(req, res) {
  const { address } = req.params;
  const doc = await Creator.findOne({ owner: address.toLowerCase() });
  res.json(doc || null);
}

/**
 * PUT /api/creator/:address
 * Update creator profile by address — only allowed if authenticated user matches address
 */
export async function updateProfileByAddress(req, res) {
  const { address } = req.params;
  const authAddr = req.user?.address?.toLowerCase();
  if (authAddr !== address.toLowerCase()) {
    return res.status(403).json({ error: 'forbidden - mismatch address' });
  }

  const update = req.body || {};
  const doc = await Creator.findOneAndUpdate(
    { owner: address.toLowerCase() },
    { $set: update },
    { upsert: true, new: true }
  );

  res.json(doc);
}

/**
 * POST /api/creator/plans (existing snapshot)
 */
export async function savePlansSnapshot(req, res) {
  const owner = req.user.address;
  const { plans } = req.body;
  const doc = await Creator.findOneAndUpdate(
    { owner },
    { $set: { plans } },
    { upsert: true, new: true }
  );
  res.json(doc);
}
