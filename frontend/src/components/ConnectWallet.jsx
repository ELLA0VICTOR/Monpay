import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
  return (
    <div className="ml-2">
      <ConnectButton accountStatus="avatar" showBalance={false} />
    </div>
  );
}
