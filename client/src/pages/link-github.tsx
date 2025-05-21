import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Container } from '@/components/layout/container';
import { GitHubProfileLink } from '@/components/github/GitHubProfileLink';
import { GitHubProfilePreview } from '@/components/profile/GitHubProfilePreview';

export default function LinkGitHubPage() {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // If already authenticated with GitHub, redirect to profile
  useEffect(() => {
    if (isAuthenticated && user?.githubUser) {
      toast({
        title: "Already Connected",
        description: "Your GitHub account is already linked to your wallet",
      });
      setLocation('/profile');
    }
  }, [isAuthenticated, user, setLocation, toast]);
  
  const handleComplete = () => {
    setLocation('/profile');
  };
  
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
          {isConnected && user?.githubUser ? (
            <GitHubProfilePreview onConfirm={handleComplete} />
          ) : (
            <GitHubProfileLink onComplete={handleComplete} />
          )}
        </div>
      </Container>
    </>
  );
} 