import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { lensService } from '@/services/lens';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWalletClient } from 'wagmi';
import { useLens } from '@/hooks/use-lens';
import { useAuth } from '@/hooks/use-auth';
import { MetadataAttributeType } from '@lens-protocol/metadata';
import { createLensProfileWithMetadata, checkLensProfile, ProfileMetadata } from '@/lib/lensClient';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LensPostForm() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showCreateProfileDialog, setShowCreateProfileDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [useGithubUsername, setUseGithubUsername] = useState(true);
  const [viewAsGuest, setViewAsGuest] = useState(false);
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { hasProfile, isAuthenticated, authenticate, isLoading, sessionClient } = useLens();
  const { user } = useAuth();
  
  // Local loading state that defaults to true and gets updated once we know the real state
  const [localLoading, setLocalLoading] = useState(true);
  
  // Update local loading state when isLoading changes
  useEffect(() => {
    setLocalLoading(isLoading);
  }, [isLoading]);

  // Set GitHub username as default when available
  useEffect(() => {
    if (user?.githubUser?.login && useGithubUsername) {
      setUsername(user.githubUser.login);
    }
  }, [user?.githubUser?.login, useGithubUsername]);

  // Show profile creation dialog if user doesn't have a profile
  useEffect(() => {
    if (isConnected && hasProfile === false && !isLoading && !viewAsGuest) {
      setShowCreateProfileDialog(true);
    }
  }, [hasProfile, isConnected, isLoading, viewAsGuest]);

  // Ensure we're not stuck in loading state forever
  useEffect(() => {
    // Set a timeout to force loading to false if it doesn't happen naturally
    const timeout = setTimeout(() => {
      setLocalLoading(false);
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  const handleCreateProfile = async () => {
    if (!username.trim() || !address || !walletClient) {
      toast({
        title: 'Error',
        description: 'Please enter a username and connect your wallet',
        variant: 'destructive'
      });
      return;
    }
    
    setIsCreatingProfile(true);
    
    try {
      // First authenticate with Lens if not already authenticated
      if (!isAuthenticated) {
        const authResult = await authenticate(address, walletClient);
        
        if (!authResult) {
          throw new Error("Failed to authenticate with Lens");
        }
      }
      
      // Check if we have an authenticated session
      if (!sessionClient) {
        throw new Error("No authenticated session. Please try again.");
      }
      
      // Create a Lens profile with the username
      const profileMetadata: ProfileMetadata = {
        name: username,
        bio: user?.githubUser?.bio || '',
        picture: user?.githubUser?.avatar_url || '',
        attributes: [
          {
            key: "twitter",
            type: MetadataAttributeType.STRING,
            value: "https://twitter.com/username",
          },
        ],
      }
      const profileResult = await createLensProfileWithMetadata(sessionClient, walletClient, username, address, profileMetadata);
      
      if (!profileResult) {
        toast({
          title: 'Profile Created',
          description: `Your Lens profile ${username} has been created successfully!`,
          variant: 'default'
        });
        
        // Refresh hasProfile state - re-fetch the profile status
        if (address) {
          const profileCheck = await checkLensProfile(address);
          
          if (profileCheck.hasProfile) {
            // Update UI states
            setShowCreateProfileDialog(false);
            // Force page reload to update all components with new profile state
            window.location.reload();
          }
        }
      } else {
        throw new Error("Failed to create profile, profileResult: " + profileResult);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create your Lens profile',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('walletClient lens post form', walletClient);
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post',
        variant: 'destructive'
      });
      return;
    }
    console.log('walletClient lens post form', walletClient);
    
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }
    console.log('walletClient lens post form', walletClient);
    if (hasProfile === false) {
      setShowCreateProfileDialog(true);
      return;
    }
    console.log('walletClient lens post form', walletClient);
    
    // Make sure we're authenticated
    if (!isAuthenticated) {
      const authResult = await authenticate(address, walletClient);
      
      if (!authResult) {
        toast({
          title: 'Authentication Failed',
          description: 'You need to authenticate with Lens to post content',
          variant: 'destructive'
        });
        return;
      }
    }
    console.log('walletClient lens post form', walletClient);
    setIsSubmitting(true);
    console.log('walletClient lens post form submitting', walletClient);
    try {
      console.log('walletClient lens post form', walletClient);
      const result = await lensService.createPublication(
        {
          content,
          title: title || undefined,
          tags: ['lens-alchemy', 'github']
        },
        walletClient
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your post has been published to Lens Protocol',
          variant: 'default'
        });
        
        // Clear the form
        setContent('');
        setTitle('');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to publish post',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGuestMode = () => {
    setViewAsGuest(!viewAsGuest);
    setShowCreateProfileDialog(false);
  };
  
  // Show loading state when checking profile status
  if (localLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="ml-4">Loading profile data...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create a Lens Post</CardTitle>
            {!isConnected && (
              <Button variant="ghost" size="sm" onClick={toggleGuestMode}>
                {viewAsGuest ? "Connect Wallet" : "View as Guest"}
              </Button>
            )}
            {isConnected && hasProfile === false && (
              <Button variant="ghost" size="sm" onClick={toggleGuestMode}>
                {viewAsGuest ? "Create Profile" : "View as Guest"}
              </Button>
            )}
          </div>
          {viewAsGuest && (
            <CardDescription className="text-amber-500 dark:text-amber-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Guest Mode: You can view content but cannot post
            </CardDescription>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                disabled={viewAsGuest || !isConnected || hasProfile === false}
              />
            </div>
            <div>
              <Textarea
                placeholder={viewAsGuest 
                  ? "Connect your wallet and create a profile to post..."
                  : !isConnected 
                  ? "Connect your wallet to post..." 
                  : hasProfile === false 
                  ? "Create a Lens profile to post..." 
                  : "What's on your mind?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[120px]"
                required
                disabled={viewAsGuest || !isConnected || hasProfile === false}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {viewAsGuest ? (
              <Button type="button" onClick={toggleGuestMode} className="ml-auto">
                Connect & Create Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" type="button" onClick={() => setContent('')}>
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !content.trim() || !address || hasProfile === false}
                >
                  {isSubmitting ? 'Posting...' : hasProfile === false ? 'Create Profile First' : 'Post to Lens'}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Profile Creation Dialog */}
      <Dialog open={showCreateProfileDialog} onOpenChange={setShowCreateProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Your Lens Profile</DialogTitle>
            <DialogDescription>
              Share your open-source contributions with the world through Lens Protocol.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {user?.githubUser && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <img 
                  src={user.githubUser.avatar_url} 
                  alt={user.githubUser.login} 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-medium">GitHub Profile Connected</h3>
                  <p className="text-sm text-muted-foreground">{user.githubUser.name || user.githubUser.login}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Choose your Lens handle</Label>
              <Input
                id="username"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Your profile will be <strong>lens/{username}</strong> on the Lens Protocol
              </p>
            </div>
            
            {user?.githubUser && (
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="useGithub" 
                  checked={useGithubUsername}
                  onCheckedChange={(checked) => {
                    setUseGithubUsername(checked === true);
                    if (checked && user.githubUser?.login) {
                      setUsername(user.githubUser.login);
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="useGithub"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Use my GitHub username
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Create a unified identity across GitHub and Lens
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Why create a Lens profile?
              </h4>
              <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc pl-5">
                <li>Share your GitHub contributions with the web3 community</li>
                <li>Mint contribution NFTs that link to your Lens profile</li>
                <li>Build your digital reputation across web2 and web3</li>
                <li>Own your content and social graph forever</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateProfileDialog(false);
                setViewAsGuest(true);
              }}
            >
              View as Guest
            </Button>
            <Button 
              onClick={handleCreateProfile} 
              disabled={isCreatingProfile || !username.trim() || !address}
            >
              {isCreatingProfile ? 'Creating...' : 'Create Lens Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 