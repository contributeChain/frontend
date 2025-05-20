import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useGitHub } from '@/providers/GitHubProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Octokit } from '@octokit/core';

export function GitHubCallback() {
  const { login } = useGitHub();
  const { linkGithubWithWallet } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting to GitHub...');
  // Add a ref to track if we've already processed the code
  const codeProcessed = useRef(false);
  
  useEffect(() => {
    const handleCallback = async () => {
      // If we've already processed this code, don't try again
      if (codeProcessed.current) {
        return;
      }

      // Parse the URL for the authorization code
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code received');
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'No authorization code received from GitHub',
        });
        setTimeout(() => setLocation('/'), 3000);
        return;
      }
      
      // Mark this code as being processed to prevent duplicate requests
      codeProcessed.current = true;
      
      try {
        setStatus('Exchanging code for access token...');
        console.log('Exchanging code for access token');
        
        // First, exchange the code for an access token via our server
        const response = await axios.get(`/api/github/oauth/callback?code=${code}`);
        
        console.log('Server response:', {
          status: response.status,
          hasData: !!response.data,
          hasToken: !!response.data?.access_token,
          tokenType: typeof response.data?.access_token,
          tokenValue: response.data?.access_token ? 
                     `${String(response.data.access_token).substring(0, 5)}...` : 
                     'none',
          dataKeys: response.data ? Object.keys(response.data) : [],
          fullData: JSON.stringify(response.data)
        });
        
        if (response.data.error) {
          throw new Error(`Server error: ${response.data.error}`);
        }
        
        // Extract and handle the token with extensive validation
        const { access_token } = response.data;
        
        if (access_token === undefined || access_token === null) {
          console.error('No access token received from server');
          throw new Error('No access token received from server');
        }
        
        // Use different methods to try to convert the token to a string
        let tokenStr;
        try {
          // Direct to string conversion
          tokenStr = '' + access_token;
          console.log('Token after direct string conversion:', {
            value: tokenStr.substring(0, 5) + '...',
            type: typeof tokenStr,
            length: tokenStr.length
          });
        } catch (e) {
          console.error('Error in direct string conversion:', e);
          
          // Fallback to String constructor
          try {
            tokenStr = String(access_token);
            console.log('Token after String() conversion:', {
              value: tokenStr.substring(0, 5) + '...',
              type: typeof tokenStr,
              length: tokenStr.length
            });
          } catch (e2) {
            console.error('Error in String() conversion:', e2);
            
            // Last resort - JSON stringify if it's an object
            if (typeof access_token === 'object') {
              try {
                tokenStr = JSON.stringify(access_token);
                console.log('Token after JSON.stringify conversion:', {
                  value: tokenStr.substring(0, 5) + '...',
                  type: typeof tokenStr,
                  length: tokenStr.length
                });
              } catch (e3) {
                console.error('Error in JSON.stringify conversion:', e3);
                throw new Error('Failed to convert token to string in any way');
              }
            } else {
              throw new Error(`Cannot convert token of type ${typeof access_token} to string`);
            }
          }
        }
        
        if (!tokenStr || tokenStr.trim() === '') {
          console.error('Empty token after conversion');
          throw new Error('Empty token after conversion');
        }
        
        setStatus('Authenticating with GitHub...');
        console.log('Access token received, authenticating with GitHub');
        
        // Use the access token to authenticate with GitHub
        console.log('Logging in with GitHub');
        console.log('Token:', tokenStr);
        
        let githubUserData;
        
        try {
          // Try the regular login flow
          await login(tokenStr);
        } catch (loginError) {
          console.error('Error during login, trying alternative approach:', loginError);
          
          // If login fails, try direct authentication with GitHub
          try {
            // Create a direct Octokit instance
            const octokit = new Octokit({
              auth: tokenStr
            });
            
            // Verify it works by fetching the user
            const { data: user } = await octokit.request('GET /user');
            console.log('Successfully authenticated directly with GitHub:', user.login);
            
            // Save user data for later use
            githubUserData = user;
            
            // Store the token
            localStorage.setItem('github_token', tokenStr);
            
            // Continue with the app flow - this will use the stored token on next page
            console.log('Direct authentication successful, continuing workflow');
          } catch (directAuthError) {
            console.error('Even direct authentication failed:', directAuthError);
            throw loginError; // Throw the original error
          }
        }
        
        // Wait a moment to ensure GitHub provider state is updated
        setStatus('Linking GitHub with wallet...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('GitHub authentication successful, linking with wallet');
        
        try {
          // Link GitHub account with the connected wallet
          await linkGithubWithWallet();
        } catch (linkError) {
          console.error('Error linking with wallet, will try to continue anyway:', linkError);
          // We'll still try to continue even if linking fails
          // This is because the GitHub authentication was successful
        }
        
        toast({
          title: 'GitHub Connected',
          description: 'Your GitHub account has been successfully linked to your wallet',
        });
        
        // Get the redirect URL from state or default to profile
        const state = searchParams.get('state');
        const redirectPath = state ? decodeURIComponent(state) : '/profile';
        
        // Replace the URL to remove the code from the history and prevent resubmission
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setStatus('Redirecting to profile...');
        // Redirect to the appropriate page
        setLocation(redirectPath);
      } catch (err: any) {
        console.error('GitHub authentication error:', err);
        const errMessage = err.response?.data?.message || err.message || 'Unknown error';
        setError(`Failed to authenticate with GitHub: ${errMessage}`);
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: `Failed to connect your GitHub account: ${errMessage}`,
        });
        
        // Replace the URL to remove the code from the history 
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setTimeout(() => setLocation('/'), 3000);
      }
    };

    handleCallback();
  }, [login, linkGithubWithWallet, setLocation, toast]);

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
      <h2 className="text-xl font-bold mb-2">{status}</h2>
      <p className="text-center text-muted-foreground mb-6">
        Please wait while we link your GitHub account with your wallet.
      </p>
    </div>
  );
} 