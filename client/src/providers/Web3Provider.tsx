import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { connectWallet, getCurrentWalletAddress, addWalletListener, removeWalletListener } from "@/lib/web3-utils";

export interface Web3ContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const defaultContext: Web3ContextType = {
  address: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
};

export const Web3Context = createContext<Web3ContextType>(defaultContext);

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    // Check if wallet is already connected on mount
    const checkConnection = async () => {
      const currentAddress = await getCurrentWalletAddress();
      setAddress(currentAddress);
    };
    
    checkConnection();
    
    // Add listener for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setAddress(null);
      } else {
        // User switched accounts
        setAddress(accounts[0]);
      }
    };
    
    addWalletListener(handleAccountsChanged);
    
    // Cleanup listener on unmount
    return () => {
      removeWalletListener(handleAccountsChanged);
    };
  }, []);
  
  const connect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const newAddress = await connectWallet();
      setAddress(newAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnect = () => {
    // With the current implementation using ethers.js, we don't have a direct
    // way to disconnect. The user would need to disconnect from their wallet directly.
    // This function is provided for API completeness.
    setAddress(null);
  };
  
  const value = {
    address,
    isConnecting,
    isConnected: !!address,
    connect,
    disconnect,
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
} 