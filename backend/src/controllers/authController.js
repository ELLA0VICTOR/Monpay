// /backend/src/controllers/authController.js
import User from '../models/User.js';
import { issueToken, verifySignedMessage } from '../utils/helpers.js';
import { utils } from 'ethers';
import crypto from 'crypto';

/**
 * GET /api/auth/nonce/:address
 * Returns a nonce message that the user should sign.
 */
export async function getNonce(req, res) {
  const address = (req.params.address || '').toLowerCase();
  if (!address) return res.status(400).json({ error: 'address required' });

  // find or create user
  let user = await User.findOne({ address });
  if (!user) {
    user = await User.create({ address, nonce: crypto.randomBytes(16).toString('hex') });
  } else {
    // refresh nonce each time
    user.nonce = crypto.randomBytes(16).toString('hex');
    await user.save();
  }

  // message format must be identical to what frontend will sign
  const message = `MonPay Authentication\nAddress: ${address}\nNonce: ${user.nonce}`;
  return res.json({ message, nonce: user.nonce });
}

/**
 * POST /api/auth/verify
 * Body: { address, signature }
 * Verifies the provided signature over the message (nonce) and returns JWT on success.
 */
export async function verifySignature(req, res) {
  const { address, signature } = req.body;
  if (!address || !signature) return res.status(400).json({ error: 'address & signature required' });

  const lower = address.toLowerCase();
  const user = await User.findOne({ address: lower });
  if (!user || !user.nonce) return res.status(400).json({ error: 'no nonce for address' });

  const message = `MonPay Authentication\nAddress: ${lower}\nNonce: ${user.nonce}`;

  // verify signature using ethers
  try {
    const recovered = utils.verifyMessage(message, signature).toLowerCase();
    if (recovered !== lower) {
      return res.status(400).json({ error: 'invalid signature' });
    }

    // clear nonce (prevent replay), optionally create user record
    user.nonce = crypto.randomBytes(8).toString('hex');
    await user.save();

    const token = issueToken(lower);
    return res.json({ token, user });
  } catch (err) {
    console.error('verifySignature error', err);
    return res.status(400).json({ error: 'signature verification failed' });
  }
}

/**
 * GET /api/auth/me
 * Returns the current user from JWT.
 */
export async function me(req, res) {
  const addr = req.user?.address;
  if (!addr) return res.status(401).json({ error: 'unauthenticated' });
  const user = await User.findOne({ address: addr.toLowerCase() });
  return res.json({ user });
}
