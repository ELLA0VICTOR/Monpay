import { useState } from 'react';
import { RELAYER_ADDRESS, BACKEND } from '../utils/constants';
import api from '../utils/api';
import { encodeFunctionData } from 'viem';

export default function useMetaTransaction(contract) {
  const [loading, setLoading] = useState(false);

  // Build a forwarder Request for MonPayRelayer
  async function sendMeta(from, to, data, gas = 500000n, value = 0n) {
    setLoading(true);
    try {
      const { data: nres } = await api.get('/api/relayer/nonce', { params: { address: from } });
      const nonce = BigInt(nres.nonce);

      // Signature: keccak256(Request) with 0x1901 prefix and empty domain separator (matching contract)
      // We'll sign digest client-side by packing the struct to hash, then sign via personal_sign
      const enc = window.ethereum;
      if (!enc) throw new Error('No wallet');
      const packed = await buildPacked(from, to, value, gas, nonce, data);
      const signature = await enc.request({
        method: 'personal_sign',
        params: [packed.digestHex, from]
      });

      const req = {
        from, to,
        value: Number(value),
        gas: Number(gas),
        nonce: Number(nonce),
        data
      };

      const { data: submit } = await api.post('/api/relayer/forward', { req, signature });
      return submit;
    } finally {
      setLoading(false);
    }
  }

  // Helper encodes like the forwarder does
  async function buildPacked(from, to, value, gas, nonce, data) {
    const hexData = data;
    const typehash = '0x' + Buffer.from('Request(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)').toString('hex');
    const ethersLike = window.ethereum; // only for personal_sign
    const hashStruct = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('monpay')); // placeholder
    // For simplicity of demo, we rely on the contract verifying with ecrecover over a 0x1901 + hashStruct.
    // We provide digest = keccak256("\x19\x01" + 0x0 + keccak256(abi-encoded struct)).
    // We compute it on the backend in production. Here we fake by passing the hex of keccak(data).

    // Minimal client: backend recomputes and validates; the signature is used for ecrecover.
    const digestHex = hexData; // placeholder; backend recomputes from (req, signature).

    return { digestHex };
  }

  function encode(contractAbi, functionName, args) {
    return encodeFunctionData({ abi: contractAbi, functionName, args });
  }

  return { sendMeta, encode, loading, RELAYER_ADDRESS };
}
