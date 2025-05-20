import { useWalletClient, usePublicClient } from 'wagmi';
import { useState } from 'react';

export function useTransaction() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);

  const sendTransaction = async (to: `0x${string}`, value: bigint, data?: `0x${string}`) => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsPending(true);
    setError(null);
    setHash(null);

    try {
      const hash = await walletClient.sendTransaction({
        to,
        value,
        data: data || '0x',
      });

      setHash(hash);
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const waitForTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    return publicClient.waitForTransactionReceipt({ hash });
  };

  return {
    sendTransaction,
    waitForTransaction,
    isPending,
    error,
    hash,
  };
} 