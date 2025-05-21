import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { type GitHubUser as BaseGitHubUser } from '@/lib/githubClient';

// Extend the base GitHubUser interface with additional properties that might be present
interface ExtendedGitHubUser extends BaseGitHubUser {
  email?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
}

export interface GitHubProfilePreviewProps {
  onConfirm?: () => void;
}

export function GitHubProfilePreview({ onConfirm }: GitHubProfilePreviewProps) {
  const { user, disconnectGitHub } = useAuth();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!user?.githubUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub Profile Not Connected</CardTitle>
          <CardDescription>Please connect your GitHub account to continue</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Cast to the extended interface to handle optional properties
  const githubUser = user.githubUser as ExtendedGitHubUser;
  
  const handleDisconnect = () => {
    disconnectGitHub();
    toast({
      title: "GitHub Disconnected",
      description: "Your GitHub account has been disconnected from your wallet",
    });
    setShowConfirmDialog(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600">
        {/* Profile background */}
      </div>
      
      <div className="px-6 -mt-16 relative">
        <img
          src={githubUser.avatar_url}
          alt={githubUser.login}
          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
        />
      </div>
      
      <CardHeader className="pt-2">
        <CardTitle className="text-2xl flex items-center gap-2">
          {githubUser.name || githubUser.login}
          {githubUser.email && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
              Verified
            </span>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          @{githubUser.login}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {githubUser.bio && (
          <p className="text-sm">{githubUser.bio}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {githubUser.company && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
              <span>{githubUser.company}</span>
            </div>
          )}
          
          {githubUser.location && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{githubUser.location}</span>
            </div>
          )}
          
          {githubUser.email && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              <span>{githubUser.email}</span>
            </div>
          )}
          
          {githubUser.blog && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <a href={/^https?:\/\//.test(githubUser.blog) ? githubUser.blog : `https://${githubUser.blog}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                {githubUser.blog}
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 border-t border-b py-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{githubUser.public_repos || 0}</div>
            <div className="text-xs text-muted-foreground">Repositories</div>
          </div>
          <div className="text-center border-x">
            <div className="text-2xl font-bold">{githubUser.followers || 0}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{githubUser.following || 0}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">Connected to wallet {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Disconnect</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect GitHub Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect your GitHub account? You will need to reconnect it to access all features.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button onClick={handleConfirm}>Continue</Button>
      </CardFooter>
    </Card>
  );
} 