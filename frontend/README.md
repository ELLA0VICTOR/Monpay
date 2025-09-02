# MonPay — Gasless Subscriptions on Monad Testnet

- Chain ID: **10143**
- Currency: **MON**
- WMON: **0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701**
- Explorer: https://testnet.monadexplorer.com
- RPCs:
  - https://testnet-rpc.monad.xyz
  - https://rpc.ankr.com/monad_testnet
  - https://rpc-testnet.monadinfra.com

## Architecture

- **Smart Contracts**
  - `MonPayRelayer.sol` — MinimalForwarder-style trusted forwarder for gasless meta-txs (ERC-2771 pattern).
  - `MonPaySubscription.sol` — creators, plans, content references, subscriptions, revenue, recurring charge.
    - Supports **gasless** calls via the forwarder.
    - `subscribeWithPermit` takes EIP-2612 permit for WMON (if supported) to set allowance and pull funds in one tx.
    - `chargeRenewal` can be called by anyone (e.g., backend cron) when `autoRenew` is enabled and allowance is sufficient.

- **Backend (Node/Express)**
  - Relayer endpoint signs & forwards meta-transactions to `MonPayRelayer`.
  - Daily cron checks expiring subscriptions and calls `chargeRenewal` so renewals are automatic.
  - MongoDB stores user, creator profile, plans, content metadata, and tx records.

- **Frontend (Vite/React/Tailwind/RainbowKit)**
  - Dark neon UI inspired by tal3nt.xyz.
  - Marketplace, Creator & Subscriber dashboards, gated content.
  - Gasless interaction via backend relayer.

> ⚠️ If WMON on Monad **does not** implement EIP-2612 Permit, users must do a one-time approval tx (still gasless via forwarder for our contract methods, but the approval itself is a standard WMON call). In that case, the relayer cannot spoof `msg.sender` on the **WMON** token contract; users must send that approval themselves once.

## Dev Quickstart

1. **Contracts**
   ```bash
   cd contracts
   cp .env.example .env  # set RPC + PK
   npm i
   npx hardhat compile
   node scripts/deploy.js
