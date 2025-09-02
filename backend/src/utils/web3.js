import { ethers } from 'ethers';
import { MONAD } from './constants.js';

export const provider = new ethers.providers.JsonRpcProvider(MONAD.rpc, {
  name: 'monad-testnet',
  chainId: MONAD.chainId
});

export function relayerWallet() {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  if (!pk) throw new Error('RELAYER_PRIVATE_KEY missing');
  return new ethers.Wallet(pk, provider);
}
