import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useGitHubStore } from '@/store';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAccount } from 'wagmi';

export function GitHubCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Use Zustand stores instead of context
  const updateUserWithGitHub = useAuthStore((state) => state.updateUserWithGitHub);
  const githubLogin = useGitHubStore((state) => state.login);
  
  const hasProcessedCode = useRef(false);
  
  useEffect(() => {
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
      
      if (!isConnected || !address) {
        setError('Wallet connection required. Please connect your wallet first.');
        setIsProcessing(false);
        return;
      }
      
      try {
        // Exchange code for access token via our server endpoint - only once
        console.log("Exchanging authorization code for token...");
        const response = await axios.get(`/api/github/oauth/callback?code=${code}`);
        
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
  }, [isConnected, address, updateUserWithGitHub, githubLogin, setLocation, toast]);
  
  const handleRetry = () => {
    setLocation('/github/link');
  };
  
  if (isProcessing) {
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
            <div className="bg-destructive/10 p-4 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null; // Should never reach here as we're either processing or have an error
} 