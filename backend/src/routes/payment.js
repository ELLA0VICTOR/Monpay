// /backend/src/routes/payment.js
import { Router } from 'express';
import { getPaymentHistory } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/history', requireAuth, getPaymentHistory);

export default r;
