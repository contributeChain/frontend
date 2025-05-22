import { Switch, Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Explore from "@/pages/explore";
import Repositories from "@/pages/repositories";
import RepositoryDetail from "@/pages/repository-detail";
import AddRepository from "@/pages/add-repository";
import Social from "@/pages/social";
import NotFound from "@/pages/not-found";
import { GitHubCallback } from "@/components/auth/GitHubCallback";
import LinkGitHubPage from "@/pages/link-github";
import MintNftPage from "./pages/mint-nft";
import NFTDetailPage from "./pages/nft-detail";
import NftCollectionPage from "./pages/nft-collection";
import RepositoryNFTsPage from "./pages/repository-nfts";
import { useEffect } from "react";
import { useAccount, useEnsName } from "wagmi";
import { useAuthStore, useGitHubStore, useLensStore } from "./store";
import { InfrastructureProviders } from "./providers/InfrastructureProviders";

// Main App structure with a single Router at the top level
function App() {
  return (
    <InfrastructureProviders>
      <Router>
        <AppWithStores />
      </Router>
    </InfrastructureProviders>
  );
}

// Component with store initialization logic
function AppWithStores() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  
  // Access Zustand stores
  const initWallet = useAuthStore((state) => state.initWallet);
  const initGitHub = useGitHubStore((state) => state.initGitHub);
  const checkAuth = useLensStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const githubUser = useGitHubStore((state) => state.user);
  const isGitHubAuthenticated = useGitHubStore((state) => state.isAuthenticated);
  const updateUserWithGitHubInfo = useAuthStore((state) => state.updateUserWithGitHubInfo);
  
  // Initialize wallet connection
  useEffect(() => {
    initWallet(address as string, isConnected);
  }, [address, isConnected, initWallet]);
  
  // Initialize GitHub
  useEffect(() => {
    initGitHub();
  }, [initGitHub]);
  
  // Initialize Lens
  useEffect(() => {
    checkAuth(address);
  }, [address, checkAuth]);
  
  // Sync GitHub user with Auth user
  useEffect(() => {
    if (isConnected && address && isGitHubAuthenticated && githubUser && user) {
      updateUserWithGitHubInfo(address as string, githubUser);
    }
  }, [isConnected, address, isGitHubAuthenticated, githubUser, user, updateUserWithGitHubInfo]);
  
  return <AppContent />;
}

// Separate routes component that accesses user from the store
function AppRoutes() {
  // Get user from auth store
  const user = useAuthStore((state) => state.user);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/callback" component={GitHubCallback} />
      <Route path="/profile/:username?">
        {params => <Profile username={params.username || user?.githubUser?.login} />}
      </Route>
      <Route path="/explore" component={Explore} />
      <Route path="/repositories" component={Repositories} />
      <Route path="/repositories/:id">
        {params => <RepositoryDetail params={params} />}
      </Route>
      <Route path="/repositories/:id/nfts">
        {params => <RepositoryNFTsPage params={params} />}
      </Route>
      <Route path="/add-repository" component={AddRepository} />
      <Route path="/link-github" component={LinkGitHubPage} />
      <Route path="/github/link" component={LinkGitHubPage} />
      <Route path="/mint-nft" component={MintNftPage} />
      <Route path="/social" component={Social} />
      <Route path="/nft-collection" component={NftCollectionPage} />
      <Route path="/nfts/:id">
        {params => <NFTDetailPage params={params} />}
      </Route>
      <Route path="/repositories/:repoId/nfts/:id">
        {params => <NFTDetailPage params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main content including layout and routes
function AppContent() {
  return (
    <TooltipProvider>
      <Header />
      <main>
        <Toaster />
        <AppRoutes />
      </main>
      <Footer />
      <MobileNav />
    </TooltipProvider>
  );
}

export default App;
