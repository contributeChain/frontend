import { ConnectKitButton as BaseConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';

export function DefaultConnectKitButton() {
  return (
    <BaseConnectKitButton />
  );
}

// Custom styled version if needed
export function CustomConnectKitButton({ className = '' }) {
  return (
    <BaseConnectKitButton.Custom>
      {({
        isConnected,
        isConnecting,
        show,
        hide,
        address,
        ensName,
        chain,
      }) => {
        return (
          <div>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={show}
                  type="button"
                  className={`flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full font-medium text-white hover:bg-white/20 transition-colors ${className}`}
                >
                  {chain && chain.name}
                </button>

                <button
                  onClick={show}
                  type="button"
                  className={`flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full font-medium text-white hover:bg-white/20 transition-colors ${className}`}
                >
                  {ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')}
                </button>
              </div>
            ) : (
              <button 
                onClick={show} 
                type="button"
                className={`bg-gradient-to-r from-primary to-accent text-white font-medium rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2 ${className}`}
              >
                <i className="fas fa-wallet mr-1"></i>
                <span>Connect</span>
              </button>
            )}
          </div>
        );
      }}
    </BaseConnectKitButton.Custom>
  );
} 