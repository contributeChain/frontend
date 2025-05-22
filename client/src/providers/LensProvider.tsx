import { ReactNode, createContext, useState, useEffect, useRef, useContext } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { lensClient } from '@/lib/lensClient';
import { useLensStore } from '@/store';
import { useNetworkStore, NetworkType } from '@/config/network';

// Define the LensSession type locally since it's not exported
type LensSession = {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
};

export type LensContextType = {
  isAuthenticated: boolean;
  authenticate: (address: string, walletClient: any) => Promise<boolean>;
  logout: () => Promise<void>;
  hasProfile: boolean | null;
  isLoading: boolean;
  sessionClient: any | null;
  network: NetworkType;
};

export const LensContext = createContext<LensContextType>({
  isAuthenticated: false,
  authenticate: async () => false,
  logout: async () => {},
  hasProfile: null,
  isLoading: false,
  sessionClient: null,
  network: 'testnet',
});

// Hook to use the Lens context
export const useLens = () => useContext(LensContext);

function LensProvider({ children }: { children: ReactNode }) {
  // Get state and methods from Zustand store
  const {
    hasProfile: storeHasProfile,
    isAuthenticated: storeIsAuthenticated,
    isLoading: storeIsLoading,
    authenticate: storeAuthenticate,
    logout: storeLogout,
    checkAuth: storeCheckAuth
  } = useLensStore();
  
  // Get network state
  const { network } = useNetworkStore();
  
  // Local state to track sessionClient which isn't tracked in the store
  const [sessionClient, setSessionClient] = useState<any>(null);
  
  // Access account and wallet client for authentication
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  
  // For tracking component mount status
  const isMountedRef = useRef(true);
  
  // Handle network changes
  useEffect(() => {
    if (storeIsAuthenticated && address) {
      // Force logout and re-auth when network changes
      storeLogout();
      toast({
        title: "Network Changed",
        description: `Switched to ${network === 'mainnet' ? 'Lens Mainnet' : 'Lens Testnet'}. Please re-authenticate.`,
        variant: "default"
      });
    }
    
    // Reset session client
    setSessionClient(null);
    
    // Update lens client with new environment
    import('@/lib/lensClient').then(({ setLensEnvironment }) => {
      setLensEnvironment(network);
    });
    
  }, [network, storeLogout, toast]);
  
  // Update session client when authenticated state changes
  useEffect(() => {
    const updateSessionClient = async () => {
      if (storeIsAuthenticated) {
        try {
          const resumed = await lensClient.resumeSession();
          if (resumed.isOk()) {
            setSessionClient(resumed.value);
          }
        } catch (err) {
          // Silent fail is acceptable here
        }
      } else {
        setSessionClient(null);
      }
    };
    
    updateSessionClient();
  }, [storeIsAuthenticated]);
  
  // Sync with store when address changes
  useEffect(() => {
    if (address) {
      storeCheckAuth(address);
    }
  }, [address, storeCheckAuth]);
  
  // Track component mounting status
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const authenticate = async (): Promise<boolean> => {
    if (!address || !walletClient) {
      toast({
        title: "Authentication Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await storeAuthenticate(address, walletClient);
    
    if (success) {
      try {
        const resumed = await lensClient.resumeSession();
        if (resumed.isOk()) {
          setSessionClient(resumed.value);
          
          toast({
            title: "Authentication Successful",
            description: `You're now connected to Lens ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
            variant: "default"
          });
        }
      } catch (err) {
        // Silent fail
      }
    } else {
      toast({
        title: "Authentication Failed",
        description: `Failed to authenticate with Lens ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
        variant: "destructive"
      });
    }
    
    return success;
  };

  const logout = async (): Promise<void> => {
    await storeLogout();
    setSessionClient(null);
    
    toast({
      title: "Logged Out",
      description: "You've been disconnected from Lens Protocol",
      variant: "default"
    });
  };

  return (
    <LensContext.Provider
      value={{
        isAuthenticated: storeIsAuthenticated,
        authenticate,
        logout,
        hasProfile: storeHasProfile,
        isLoading: storeIsLoading,
        sessionClient,
        network,
      }}
    >
      {children}
    </LensContext.Provider>
  );
}

export default LensProvider; 