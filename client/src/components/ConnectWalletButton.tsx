import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';

type ConnectWalletButtonProps = {
  size?: 'sm' | 'default' | 'lg';
  showBalance?: boolean;
  className?: string;
};

export const ConnectWalletButton = ({ 
  size = 'default', 
  showBalance = false,
  className = ''
}: ConnectWalletButtonProps) => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName }) => {
        const displayAddress = ensName || (address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '');

        return (
          <Button 
            onClick={show}
            size={size}
            className={className}
            disabled={isConnecting}
          >
            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {showBalance ? (
                  <span>{displayAddress}</span>
                ) : (
                  <span>Connected</span>
                )}
              </div>
            ) : isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <span>Connect Wallet</span>
            )}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default ConnectWalletButton; 