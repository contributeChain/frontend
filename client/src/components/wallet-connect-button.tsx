import ConnectWalletButton from './ConnectWalletButton';

type WalletConnectButtonProps = {
  size?: 'sm' | 'default' | 'lg';
  showBalance?: boolean;
  className?: string;
};

export default function WalletConnectButton({
  size = 'default',
  showBalance = false,
  className = ''
}: WalletConnectButtonProps) {
  return <ConnectWalletButton size={size} showBalance={showBalance} className={className} />;
}
