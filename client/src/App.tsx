import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Explore from "@/pages/explore";
import Repositories from "@/pages/repositories";
import Social from "@/pages/social";
import NotFound from "@/pages/not-found";
import { getCurrentWalletAddress } from "@/lib/web3-utils";
import { isGitHubConnected, getConnectedGitHubUsername } from "@/lib/github-utils";

function Router() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if wallet is connected
    const checkWalletConnection = async () => {
      const address = await getCurrentWalletAddress();
      setWalletAddress(address);
    };
    
    // Check if GitHub is connected
    const checkGitHubConnection = async () => {
      const isConnected = await isGitHubConnected();
      setGithubConnected(isConnected);
      
      if (isConnected) {
        const username = await getConnectedGitHubUsername();
        setGithubUsername(username);
      }
    };
    
    checkWalletConnection();
    checkGitHubConnection();
  }, []);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile/:username?">{params => <Profile username={params.username || githubUsername} />}</Route>
      <Route path="/explore" component={Explore} />
      <Route path="/repositories" component={Repositories} />
      <Route path="/social" component={Social} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { theme, setTheme } = useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <main>
          <Toaster />
          <Router />
        </main>
        <Footer />
        <MobileNav />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
