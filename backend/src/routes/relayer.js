import { Router } from 'express';
import { nonce, forward } from '../controllers/relayerController.js';

const r = Router();
r.get('/nonce', nonce);
r.post('/forward', forward);
export default r;
