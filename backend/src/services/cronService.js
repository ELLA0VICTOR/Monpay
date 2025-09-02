import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import { processRenewal } from './subscriptionService.js';

// Run hourly: renew anything expired with autoRenew=true
cron.schedule('15 * * * *', async () => {
  const now = new Date();
  try {
    const expiring = await Subscription.find({
      autoRenew: true,
      expiresAt: { $lte: now }
    }).limit(50);

    for (const s of expiring) {
      try {
        await processRenewal(s.subscriber, s.planId, s.months || 1);
        console.log('Renewed', s.subscriber, s.planId);
      } catch (e) {
        console.error('Renewal failed', s.subscriber, s.planId, e.message);
      }
    }
  } catch (e) {
    console.error('cron error', e);
  }
});
