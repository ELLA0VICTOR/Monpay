import { Router } from 'express';
import { addContent, listByCreator } from '../controllers/contentController.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.get('/:address', listByCreator);
r.post('/', requireAuth, addContent);
export default r;
