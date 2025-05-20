import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGitHub } from '@/providers/GitHubProvider';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';

export default function GitHubCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login } = useGitHub();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Parse the code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setError('No authorization code received from GitHub');
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'No authorization code received from GitHub'
          });
          setIsProcessing(false);
          return;
        }

        // Process the GitHub login with the code
        await login(code);
        
        // Redirect to profile page on success
        toast({
          title: 'Successfully authenticated with GitHub',
          description: 'Your GitHub account is now linked to your wallet',
        });
        
        setIsProcessing(false);
        setLocation('/profile');
      } catch (err) {
        console.error('GitHub authentication error:', err);
        setError('Failed to authenticate with GitHub');
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Failed to authenticate with GitHub',
        });
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [login, setLocation, toast]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {isProcessing ? (
              <>
                <Spinner size="lg" />
                <h2 className="text-2xl font-bold">Authenticating with GitHub...</h2>
                <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
              </>
            ) : error ? (
              <>
                <div className="p-3 rounded-full bg-destructive/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h2 className="text-2xl font-bold">Authentication Failed</h2>
                <p className="text-muted-foreground">{error}</p>
                <button 
                  onClick={() => setLocation('/')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                >
                  Return Home
                </button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-green-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2 className="text-2xl font-bold">Authentication Successful</h2>
                <p className="text-muted-foreground">You have successfully linked your GitHub account.</p>
                <p className="text-muted-foreground">Redirecting to your profile...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 