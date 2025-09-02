import { ethers } from 'ethers';
import { ADDRS } from '../utils/constants.js';
import { relayerWallet } from '../utils/web3.js';
import Subscription from '../models/Subscription.js';

const SUB_ABI = [
  "function chargeRenewal(address subscriber, uint256 planId, uint256 months) external",
  "function subscriptions(address,uint256) view returns (uint256 planId,address subscriber,uint256 expiresAt,bool autoRenew)",
  "function plans(uint256) view returns (uint256 id,address creator,uint256 price,uint256 period,string memory name,string memory description,bool active)"
];

export async function processRenewal(subscriber, planId, months = 1) {
  const wallet = relayerWallet();
  const sub = new ethers.Contract(ADDRS.SUBSCRIPTION, SUB_ABI, wallet);
  const tx = await sub.chargeRenewal(subscriber, planId, months, { gasLimit: 500000 });
  const rec = await tx.wait();

  // update DB approx expiration
  const onchain = await sub.subscriptions(subscriber, planId);
  await Subscription.findOneAndUpdate(
    { subscriber: subscriber.toLowerCase(), planId },
    { expiresAt: new Date(Number(onchain.expiresAt) * 1000) },
    { upsert: true }
  );

  return rec.transactionHash;
}
