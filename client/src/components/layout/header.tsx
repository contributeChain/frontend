import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { ConnectKitButton } from "@/components/ConnectKitButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useAccount } from "wagmi";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const [location] = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected } = useAccount();
  const { user, isAuthenticated, connectGitHub } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Lens Alchemy</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/repositories" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Repositories
            </Link>
            <Link href="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Explore
            </Link>
            <Link href="/social" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Social
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center gap-2">
            {isConnected && !isAuthenticated && (
              <Button 
                variant="outline"
                size="sm"
                onClick={connectGitHub}
                className="flex items-center gap-2"
              >
                <svg height="20" width="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Connect GitHub
              </Button>
            )}
            {isAuthenticated && user?.githubUser && (
              <Link href="/profile" className="flex items-center gap-2 rounded-full overflow-hidden pr-2 hover:bg-muted transition-colors">
                <img 
                  src={user.githubUser.avatar_url} 
                  alt={user.githubUser.login} 
                  className="w-8 h-8 rounded-full" 
                />
                <span className="text-sm hidden md:inline-block">{user.githubUser.login}</span>
              </Link>
            )}
            <ThemeToggle />
            <ConnectKitButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
