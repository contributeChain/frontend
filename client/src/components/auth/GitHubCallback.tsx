import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useGitHubStore } from '@/store';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAccount } from 'wagmi';
import ConnectWalletButton from '@/components/ConnectWalletButton';

export function GitHubCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [walletChecked, setWalletChecked] = useState(false);
  const [connectionStateDebug, setConnectionStateDebug] = useState<any>({});
  
  // Use Zustand stores instead of context
  const updateUserWithGitHub = useAuthStore((state) => state.updateUserWithGitHub);
  const githubLogin = useGitHubStore((state) => state.login);
  
  const hasProcessedCode = useRef(false);
  
  // Add a separate effect to check wallet connection with a delay
  useEffect(() => {
    // Allow more time for ConnectKit to initialize the wallet connection
    const timer = setTimeout(() => {
      // Log connection state for debugging
      const debugState = {
        isConnected,
        address,
        hasAddress: !!address,
        timestamp: new Date().toISOString()
      };
      setConnectionStateDebug(debugState);
      console.log("Wallet connection state:", debugState);
      setWalletChecked(true);
    }, 2000); // Increased to 2 seconds for more reliable connection
    
    return () => clearTimeout(timer);
  }, [isConnected, address]);
  
  useEffect(() => {
    // Only proceed when wallet check is complete
    if (!walletChecked) return;
    
    const handleGitHubCallback = async () => {
      // Prevent duplicated processing
      if (hasProcessedCode.current) return;
      
      // Extract code from URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      
      // Mark as processed immediately to prevent duplicate attempts
      hasProcessedCode.current = true;
      
      // Check if there was an error in the GitHub redirect
      if (errorParam) {
        console.error('GitHub auth error:', errorParam);
        setError('GitHub authentication was denied or failed');
        setIsProcessing(false);
        return;
      }

      // Ensure we have a code and a connected wallet
      if (!code) {
        setError('No authorization code received from GitHub');
        setIsProcessing(false);
        return;
      }
      
      // Check for wallet connection - either isConnected flag OR presence of address
      const walletConnected = isConnected || !!address;
      
      if (!walletConnected) {
        console.error('Wallet connection required:', { isConnected, address, connectionStateDebug });
        setError('Wallet connection required. Please connect your wallet first.');
        setIsProcessing(false);
        return;
      }
      
      if (!address) {
        console.error('No wallet address found despite connection status:', { isConnected, connectionStateDebug });
        setError('Could not determine your wallet address. Please try reconnecting your wallet.');
        setIsProcessing(false);
        return;
      }
      
      try {
        // Exchange code for access token via our server endpoint - only once
        console.log("Exchanging authorization code for token...");
        const response = await axios.post(`/api/auth/callback`, { code });
        
        if (response.status !== 200 || !response.data.access_token) {
          throw new Error('Failed to exchange code for token');
        }
        
        console.log("Token received successfully, updating user profile...");
        
        // First authenticate with GitHub
        await githubLogin(response.data.access_token);
        
        // Then link the wallet with GitHub user using the token
        await updateUserWithGitHub(response.data.access_token, address);
        
        // Show success toast
        toast({
          title: 'GitHub Account Linked',
          description: 'Your GitHub account has been successfully connected.',
          variant: 'default',
        });
        
        // Redirect to the saved path or profile page
        const redirectPath = localStorage.getItem('post_github_auth_redirect') || '/profile';
        localStorage.removeItem('post_github_auth_redirect'); // Clean up
        
        // Use a slight delay to ensure state updates complete
        setTimeout(() => {
          setLocation(redirectPath);
        }, 100);
      } catch (error) {
        console.error('Error processing GitHub callback:', error);
        setError('Failed to link GitHub account. Please try again.');
        setIsProcessing(false);
      }
    };
    
    // Only run if we're on the callback route and haven't processed yet
    if (!hasProcessedCode.current) {
      handleGitHubCallback();
    }
  }, [isConnected, address, updateUserWithGitHub, githubLogin, setLocation, toast, walletChecked, connectionStateDebug]);
  
  const handleRetry = () => {
    hasProcessedCode.current = false; // Reset processing state
    setIsProcessing(true); // Reset UI state
    setError(null); // Clear errors
    setWalletChecked(false); // Reset wallet check
    
    // Force a new wallet check
    setTimeout(() => {
      setWalletChecked(true);
    }, 1000);
  };
  
  if (isProcessing && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connecting GitHub</CardTitle>
            <CardDescription>Linking your GitHub account with your wallet...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="mt-4 text-center text-muted-foreground">
              Please wait while we securely connect your GitHub account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    const isWalletError = error.includes('Wallet connection required') || 
                         error.includes('wallet address');
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Failed</CardTitle>
            <CardDescription>
              We encountered an issue while connecting your GitHub account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 p-4 rounded-md mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            
            {isWalletError && (
              <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-md mb-4">
                <p className="mb-4 text-sm text-center">Please connect your wallet first:</p>
                <ConnectWalletButton />
                {address && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-md w-full">
                    <p className="text-xs text-center text-green-700 dark:text-green-400">
                      Address detected: {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Connection state: {isConnected ? 'Connected' : 'Not connected'}</p>
              {address && <p>Address: {address.slice(0, 6)}...{address.slice(-4)}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null; // Should never reach here as we're either processing or have an error
} 