// /backend/src/routes/auth.js
import { Router } from 'express';
import { getNonce, verifySignature, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/nonce/:address', getNonce);
r.post('/verify', verifySignature);
r.get('/me', requireAuth, me);

export default r;
