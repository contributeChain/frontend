import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { networkConfig, lensClient, authenticateWithLens, checkLensProfile } from '@/lib/lensClient';
import { useAccount, useWalletClient } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface LensContextType {
  hasProfile: boolean | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const LensContext = createContext<LensContextType>({
  hasProfile: null,
  isAuthenticated: false,
  isLoading: true,
  authenticate: async () => false,
  logout: async () => {},
});

export const useLens = () => useContext(LensContext);

interface LensProviderProps {
  children: ReactNode;
}

export function LensProvider({ children }: LensProviderProps) {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  // Check authentication status on mount and when wallet changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!address) {
        setIsAuthenticated(false);
        setHasProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Check if the user is already authenticated
        const resumed = await lensClient.resumeSession();
        setIsAuthenticated(resumed.isOk());
        
        // Check if the user has a Lens profile
        const profileResult = await checkLensProfile(address);
        setHasProfile(profileResult.hasProfile);
      } catch (error) {
        console.error("Error checking Lens authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [address, isConnected]);

  // Authenticate with Lens Protocol
  const authenticate = async (): Promise<boolean> => {
    if (!address || !walletClient) {
      toast({
        title: "Authentication Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const authResult = await authenticateWithLens(address, walletClient);
      
      if (authResult.success) {
        setIsAuthenticated(true);
        
        toast({
          title: "Authentication Successful",
          description: "You're now connected to Lens Protocol",
          variant: "default"
        });
        
        return true;
      } else {
        toast({
          title: "Authentication Failed",
          description: "Failed to authenticate with Lens Protocol",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error authenticating with Lens:", error);
      
      toast({
        title: "Authentication Error",
        description: "An error occurred while connecting to Lens Protocol",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout from Lens Protocol
  const logout = async (): Promise<void> => {
    try {
      // Clear the session from storage
      localStorage.removeItem('lens.session.key');
      sessionStorage.removeItem('lens.session.key');
      
      // Update state
      setIsAuthenticated(false);
      
      toast({
        title: "Logged Out",
        description: "You've been disconnected from Lens Protocol",
        variant: "default"
      });
    } catch (error) {
      console.error("Error logging out from Lens:", error);
      
      toast({
        title: "Logout Error",
        description: "An error occurred while disconnecting from Lens Protocol",
        variant: "destructive"
      });
    }
  };

  const value = {
    hasProfile,
    isAuthenticated,
    isLoading,
    authenticate,
    logout
  };

  return (
    <LensContext.Provider value={value}>
      {children}
    </LensContext.Provider>
  );
} 