import { useAccount, useBalance, useDisconnect, useEnsName } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected, status } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();

  return {
    address,
    ensName,
    balance: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    disconnect,
  };
} 