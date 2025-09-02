import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // Ensure env variables are loaded here too

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import routesAuth from './routes/auth.js';
import routesCreator from './routes/creator.js';
import routesSubscription from './routes/subscription.js';
import routesContent from './routes/content.js';
import routesRelayer from './routes/relayer.js';
import errorHandler from './middleware/errorHandler.js';
import './services/cronService.js';
import routesPayment from './routes/payment.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: false
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Debug log
console.log("Loaded MONGO_URI from app.js:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { dbName: 'monpay' })
  .then(() => console.log('✅ Mongo connected'))
  .catch((e) => console.error('❌ Mongo error:', e));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', routesAuth);
app.use('/api/creator', routesCreator);
app.use('/api/subscription', routesSubscription);
app.use('/api/content', routesContent);
app.use('/api/relayer', routesRelayer);
app.use('/api/payment', routesPayment);

app.use(errorHandler);

export default app;
