import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { connectWallet, getCurrentWalletAddress, formatWalletAddress, addWalletListener, removeWalletListener } from "@/lib/web3-utils";

export default function WalletConnectButton() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      const address = await getCurrentWalletAddress();
      setWalletAddress(address);
    };
    
    checkConnection();
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
      }
    };
    
    addWalletListener(handleAccountsChanged);
    
    return () => {
      removeWalletListener(handleAccountsChanged);
    };
  }, []);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  if (walletAddress) {
    return (
      <Button
        className="bg-white dark:bg-gray-800 text-primary dark:text-primary border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full shadow-sm"
      >
        <i className="fas fa-wallet mr-2"></i>
        {formatWalletAddress(walletAddress)}
      </Button>
    );
  }
  
  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-primary to-accent text-white font-medium py-2 px-4 rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
    >
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
    </Button>
  );
}
