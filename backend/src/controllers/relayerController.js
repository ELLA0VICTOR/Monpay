import { getNonceFor, sendMetaTx } from '../services/relayerService.js';

export async function nonce(req, res) {
  const { address } = req.query;
  const n = await getNonceFor(address);
  res.json({ nonce: Number(n) });
}

export async function forward(req, res) {
  const { req: metaReq, signature } = req.body;
  if (!metaReq || !signature) return res.status(400).json({ error: 'missing meta req or signature' });
  const receipt = await sendMetaTx(metaReq, signature);
  res.json({ txHash: receipt.transactionHash || receipt.txHash || null, receipt });
}
