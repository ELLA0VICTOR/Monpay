import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { useEffect } from 'react';

const MONAD = {
  id: Number(import.meta.env.VITE_CHAIN_ID || 10143),
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RPC || 'https://testnet-rpc.monad.xyz'] },
    public: { http: [import.meta.env.VITE_RPC || 'https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
  },
  testnet: true
};

const { chains, publicClient } = configureChains(
  [MONAD],
  [
    jsonRpcProvider({
      rpc: () => ({ http: import.meta.env.VITE_RPC || 'https://testnet-rpc.monad.xyz' })
    })
  ]
);

// Use a temporary project ID or remove WalletConnect for now
const { connectors } = getDefaultWallets({
  appName: 'MonPay',
  projectId: '2f05a7cac472ced85b0c53d73b931145', // Temporary public project ID
  chains
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Providers({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        chains={chains} 
        modalSize="compact" 
        theme={darkTheme({
          accentColor: '#8b5cf6',
          accentColorForeground: '#0b0b12',
          borderRadius: 'large'
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}