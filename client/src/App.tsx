import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
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
import RepositoryDetail from "@/pages/repository-detail";
import AddRepository from "@/pages/add-repository";
import Social from "@/pages/social";
import NotFound from "@/pages/not-found";
import { GitHubCallback } from "@/components/auth/GitHubCallback";
import LinkGitHubPage from "@/pages/link-github";
import { LensProvider } from "@/providers/LensProvider";
import { GroveProvider } from "@/providers/GroveProvider";
import { GitHubProvider } from "@/providers/GitHubProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth } from "@/providers/AuthProvider";
import MintNftPage from "./pages/mint-nft";
import { Providers as Web3Providers } from "@/providers/Providers";

function Router() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/callback" component={GitHubCallback} />
      <Route path="/profile/:username?">{params => <Profile username={params.username || user?.githubUser?.login} />}</Route>
      <Route path="/explore" component={Explore} />
      <Route path="/repositories" component={Repositories} />
      <Route path="/repositories/:id">{params => <RepositoryDetail params={params} />}</Route>
      <Route path="/add-repository" component={AddRepository} />
      <Route path="/link-github" component={LinkGitHubPage} />
      <Route path="/mint-nft" component={MintNftPage} />
      {/* <Route path="/nft-gallery" component={NftGalleryPage} / */}
      <Route path="/social" component={Social} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Create a global providers wrapper to ensure proper provider hierarchy
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Web3Providers>
      <LensProvider>
        <GitHubProvider>
          <AuthProvider>
            <GroveProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </GroveProvider>
          </AuthProvider>
        </GitHubProvider>
      </LensProvider>
    </Web3Providers>
  );
}

function App() {
  const { theme, setTheme } = useTheme();
  
  return (
    <AppProviders>
      <Header />
      <main>
        <Toaster />
        <Router />
      </main>
      <Footer />
      <MobileNav />
    </AppProviders>
  );
}

export default App;
