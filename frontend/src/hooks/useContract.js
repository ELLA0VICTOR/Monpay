import { useMemo } from 'react';
import { SUBSCRIPTION_ADDRESS } from '../utils/constants';
import { usePublicClient, useWalletClient } from 'wagmi';
import abi from './subscriptionAbi.json';

export default function useContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const contract = useMemo(() => ({
    address: SUBSCRIPTION_ADDRESS,
    abi
  }), []);
  return { publicClient, walletClient, contract };
}
