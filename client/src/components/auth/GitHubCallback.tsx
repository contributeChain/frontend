import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGitHub } from '@/providers/GitHubProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export function GitHubCallback() {
  const { login } = useGitHub();
  const { linkGithubWithWallet } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      // Parse the URL for the authorization code
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code received');
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'No authorization code received from GitHub',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      try {
        // Authenticate with GitHub
        await login(code);
        
        // Link GitHub account with the connected wallet
        await linkGithubWithWallet();
        
        toast({
          title: 'GitHub Connected',
          description: 'Your GitHub account has been successfully linked to your wallet',
        });
        
        // Get the redirect URL from state or default to profile
        const state = searchParams.get('state');
        const redirectPath = state ? decodeURIComponent(state) : '/profile';
        
        // Redirect to the appropriate page
        navigate(redirectPath);
      } catch (err) {
        console.error('GitHub authentication error:', err);
        setError('Failed to authenticate with GitHub');
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'Failed to connect your GitHub account. Please try again.',
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [login, linkGithubWithWallet, location, navigate, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="text-destructive text-xl font-bold mb-4">Authentication Error</div>
        <p className="text-center mb-6">{error}</p>
        <p className="text-center text-sm text-muted-foreground">
          Redirecting to home page...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
      <Spinner className="h-12 w-12 mb-4" />
      <h2 className="text-xl font-bold mb-2">Connecting to GitHub...</h2>
      <p className="text-center text-muted-foreground mb-6">
        Please wait while we link your GitHub account with your wallet.
      </p>
    </div>
  );
} 