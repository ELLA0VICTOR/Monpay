export const MONAD = {
    chainId: Number(process.env.CHAIN_ID || 10143),
    rpc: process.env.MONAD_RPC || 'https://testnet-rpc.monad.xyz',
    explorer: 'https://testnet.monadexplorer.com'
  };
  
  export const ADDRS = {
    SUBSCRIPTION: process.env.SUBSCRIPTION_CONTRACT,
    RELAYER: process.env.RELAYER_CONTRACT,
    WMON: process.env.WMON
  };
  