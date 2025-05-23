import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useGitHubStore } from '@/store';
import { Container } from '@/components/layout/container';
import { GitHubProfileLink } from '@/components/github/GitHubProfileLink';
import { GitHubProfilePreview } from '@/components/profile/GitHubProfilePreview';

export default function LinkGitHubPage() {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  
  // Use useMemo to prevent unnecessary re-renders
  const gitHubAuth = useMemo(() => {
    const state = useGitHubStore.getState();
    return { 
      isAuthenticated: state.isAuthenticated,
      user: state.user 
    };
  }, []); // Empty dependency array since we only need it once on mount
  
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleComplete = useCallback(() => {
    setLocation('/profile');
  }, [setLocation]);
  
  // Check for GitHub connection only once on mount or when auth state changes
  useEffect(() => {
    // Get current values directly from the store to avoid stale closures
    const { isAuthenticated: gitHubIsAuthenticated, user: gitHubUser } = useGitHubStore.getState();
    
    // Check both auth store and GitHub store authentication state
    const hasGitHubConnected = 
      (isAuthenticated && user?.githubUser) || 
      (gitHubIsAuthenticated && gitHubUser);
    
    if (hasGitHubConnected) {
      toast({
        title: "Already Connected",
        description: "Your GitHub account is already linked to your wallet",
      });
      setLocation('/profile');
    }
  }, [isAuthenticated, user, setLocation, toast]);
  
  return (
    <>
      <Helmet>
        <title>Link GitHub | Lens Alchemy</title>
      </Helmet>
      <Container className="max-w-4xl py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Connect your GitHub Account</h1>
          <p className="text-muted-foreground">
            Link your GitHub account to your wallet to start earning contributor NFTs
          </p>
        </div>
        
        {!isConnected && (
          <div className="text-center p-8 border border-dashed rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-2">Connect Wallet First</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to continue with GitHub linking.
            </p>
          </div>
        )}
        
        <div className="mt-8">
          {isConnected && (user?.githubUser || gitHubAuth.user) ? (
            <GitHubProfilePreview onConfirm={handleComplete} />
          ) : (
            <GitHubProfileLink onComplete={handleComplete} />
          )}
        </div>
      </Container>
    </>
  );
} 