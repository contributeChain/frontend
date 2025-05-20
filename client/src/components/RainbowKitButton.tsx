import { ConnectButton } from '@rainbow-me/rainbowkit';

export function RainbowKitButton() {
  return (
    <ConnectButton 
      accountStatus="address"
      showBalance={true}
      chainStatus="icon"
    />
  );
}

// Custom styled version if needed
export function CustomRainbowKitButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal} 
                    type="button"
                    className="bg-gradient-to-r from-primary to-accent text-white font-medium py-2 px-4 rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <i className="fas fa-wallet"></i>
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    {account.displayName}
                    {account.displayBalance && (
                      <span>{account.displayBalance}</span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 