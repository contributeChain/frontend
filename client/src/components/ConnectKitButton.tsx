import { ConnectKitButton as DefaultConnectKitButton } from 'connectkit';
import { Button } from '@/components/ui/button';

export function ConnectKitButton() {
  return (
    <DefaultConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName }) => {
        return (
          <Button
            onClick={show}
            disabled={isConnecting}
            className={
              isConnected
                ? "bg-white dark:bg-gray-800 text-primary dark:text-primary border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full shadow-sm"
                : "bg-gradient-to-r from-primary to-accent text-white font-medium py-2 px-4 rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            }
          >
            {isConnected ? (
              <div className="flex items-center">
                <i className="fas fa-wallet mr-2"></i>
                <span>{ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
              </div>
            ) : (
              <>
                {isConnecting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-wallet"></i>
                    <span>Connect Wallet</span>
                  </>
                )}
              </>
            )}
          </Button>
        );
      }}
    </DefaultConnectKitButton.Custom>
  );
} 