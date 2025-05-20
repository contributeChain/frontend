import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/providers/Web3Provider";
import { formatWalletAddress } from "@/lib/web3-utils";

export default function WalletConnectButton() {
  const { address, isConnecting, connect } = useWeb3();
  
  const handleConnect = async () => {
    await connect();
  };
  
  if (address) {
    return (
      <Button
        className="bg-white dark:bg-gray-800 text-primary dark:text-primary border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full shadow-sm"
      >
        <i className="fas fa-wallet mr-2"></i>
        {formatWalletAddress(address)}
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
