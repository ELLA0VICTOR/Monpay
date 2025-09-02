import jwt from 'jsonwebtoken';
import { utils } from 'ethers';

export function issueToken(address) {
  return jwt.sign({ address: address.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifySignedMessage(address, message, signature) {
  const rec = utils.verifyMessage(message, signature);
  return rec.toLowerCase() === address.toLowerCase();
}
