import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getGitHubAuthUrl } from '@/lib/auth-service';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface GitHubProfileLinkProps {
  onComplete?: () => void;
}

export function GitHubProfileLink({ onComplete }: GitHubProfileLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const handleGitHubConnect = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet before linking GitHub.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store any return path for after authentication if needed
      localStorage.setItem('post_github_auth_redirect', window.location.pathname);
      
      // Redirect to GitHub OAuth authorization URL
      const authUrl = getGitHubAuthUrl();
      console.log("Redirecting to GitHub auth URL:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error redirecting to GitHub auth:', error);
      setIsLoading(false);
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Link your GitHub Account</CardTitle>
        <CardDescription>
          Connect your GitHub profile to start earning contributor NFTs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 text-primary"
            fill="currentColor"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="font-medium text-lg">GitHub Profile Connection</h3>
          <p className="text-muted-foreground">
            Link your GitHub account to verify your contributions and earn rewards
          </p>
        </div>
        
        {!isConnected && (
          <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 rounded-md text-sm">
            <p className="flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              Please connect your wallet first
            </p>
          </div>
        )}
        
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You'll get...</span>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Mint NFTs for your open-source contributions</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Share your contributions on Lens Protocol</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Build your on-chain developer reputation</span>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGitHubConnect} 
          disabled={isLoading || !isConnected}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 -ml-1" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Connect with GitHub
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 