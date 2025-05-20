import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface GitHubProfileLinkProps {
  onComplete?: () => void;
  redirectPath?: string;
}

export function GitHubProfileLink({ 
  onComplete, 
  redirectPath = '/profile' 
}: GitHubProfileLinkProps) {
  const { address, isConnected } = useAccount();
  const { user, connectGitHub } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      setIsProcessing(true);
      connectGitHub();
      // No need to set processing to false since we're redirecting away
    } catch (error) {
      setIsProcessing(false);
      console.error('Error connecting to GitHub:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Failed to connect to GitHub. Please try again.',
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <svg height="24" width="24" viewBox="0 0 16 16" className="fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Connect GitHub Account
        </CardTitle>
        <CardDescription className="text-white/80">
          Link your GitHub account to your wallet to access all features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="p-4 bg-muted rounded-lg text-sm border">
          <div className="flex items-start gap-2 mb-2">
            <div className="bg-green-500 text-white p-1 rounded-full mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7"></path>
              </svg>
            </div>
            <div>
              <span className="font-medium">Wallet Connected:</span> {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Not connected'}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`${user?.githubUser ? 'bg-green-500' : 'bg-amber-500'} text-white p-1 rounded-full mt-0.5`}>
              {user?.githubUser ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="5" y2="19"></line>
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                </svg>
              )}
            </div>
            <div>
              <span className="font-medium">GitHub Account:</span> {user?.githubUser ? user.githubUser.login : 'Not connected'}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Benefits of Connecting</h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
              <div>
                <span className="font-medium">Track Your Contributions</span>
                <p className="text-sm text-muted-foreground">See all your GitHub contributions in one place</p>
              </div>
            </li>
            <li className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div>
                <span className="font-medium">Earn Contributor NFTs</span>
                <p className="text-sm text-muted-foreground">Get rewarded with NFTs for your open-source work</p>
              </div>
            </li>
            <li className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <div>
                <span className="font-medium">Join the Developer Community</span>
                <p className="text-sm text-muted-foreground">Connect with other Web3 developers</p>
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        {user?.githubUser ? (
          <>
            <div className="flex items-center gap-2">
              <img 
                src={user.githubUser.avatar_url} 
                alt={user.githubUser.login} 
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <div className="font-medium">{user.githubUser.name || user.githubUser.login}</div>
                <div className="text-muted-foreground">@{user.githubUser.login}</div>
              </div>
            </div>
            <Button onClick={onComplete}>Continue</Button>
          </>
        ) : isProcessing ? (
          <Button disabled className="w-full">
            <Spinner className="mr-2 h-4 w-4" /> Connecting...
          </Button>
        ) : (
          <Button onClick={handleConnectGitHub} className="w-full">
            Connect GitHub
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 