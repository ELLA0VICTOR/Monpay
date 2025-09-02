import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upsertSubscription, mySubscriptions, cancelAutoRenew } from '../controllers/subscriptionController.js';

const r = Router();
r.get('/mine', requireAuth, mySubscriptions);
r.post('/upsert', requireAuth, upsertSubscription);
r.post('/cancel', requireAuth, cancelAutoRenew);
export default r;
