import { ethers } from 'ethers';
import { ADDRS } from '../utils/constants.js';
import { relayerWallet } from '../utils/web3.js';
import Transaction from '../models/Transaction.js';

// Minimal ABI to call execute(Request, signature)
const RELAYER_ABI = [
  "function getNonce(address from) view returns (uint256)",
  "function execute(tuple(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data) req, bytes signature) external payable returns (bool, bytes)"
];

export async function getNonceFor(address) {
  const wallet = relayerWallet();
  const fwd = new ethers.Contract(ADDRS.RELAYER, RELAYER_ABI, wallet);
  return await fwd.getNonce(address);
}

export async function sendMetaTx(req, signature) {
  const wallet = relayerWallet();
  const fwd = new ethers.Contract(ADDRS.RELAYER, RELAYER_ABI, wallet);

  const gasLimit = ethers.BigNumber.from(req.gas || 500000);
  const tx = await fwd.execute(req, signature, { gasLimit });
  const rec = await tx.wait();

  await Transaction.create({
    hash: rec.transactionHash,
    from: req.from,
    to: req.to,
    status: rec.status === 1 ? 'confirmed' : 'failed',
    type: 'meta',
    payload: { req }
  });

  return rec;
}
