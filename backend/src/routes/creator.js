// /backend/src/routes/creator.js
import { Router } from 'express';
import { upsertProfile, getProfile, savePlansSnapshot, updateProfileByAddress } from '../controllers/creatorController.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.get('/:address', getProfile);
r.post('/profile', requireAuth, upsertProfile);
r.put('/:address', requireAuth, updateProfileByAddress);
r.post('/plans', requireAuth, savePlansSnapshot);
export default r;
