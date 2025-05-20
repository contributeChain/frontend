import { ConnectKitProvider as DefaultConnectKitProvider } from 'connectkit';
import { WagmiConfig } from 'wagmi';
import { ReactNode } from 'react';
import { config } from '@/lib/connectKit';

interface ConnectKitProviderProps {
  children: ReactNode;
}

export function ConnectKitProvider({ children }: ConnectKitProviderProps) {
  return (
    <WagmiConfig config={config}>
      <DefaultConnectKitProvider
        customTheme={{
          // Custom theme variables
          "--ck-connectbutton-font-size": "15px",
          "--ck-connectbutton-border-radius": "12px",
          "--ck-connectbutton-color": "#333333",
          "--ck-connectbutton-background": "white",
          "--ck-connectbutton-hover-background": "#f5f5f5",
        }}
        options={{
          embedGoogleFonts: true,
          avoidLayoutShift: true,
          disclaimer: (
            <>
              By connecting your wallet you agree to the{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="text-primary"
              >
                Privacy Policy
              </a>
            </>
          ),
        }}
      >
        {children}
      </DefaultConnectKitProvider>
    </WagmiConfig>
  );
} 