import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useAccount } from "wagmi";

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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-darkBg/95 dark:to-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center transform hover:rotate-3 transition-transform duration-200 shadow-lg">
                  <i className="fas fa-code text-white text-sm"></i>
                </div>
                <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">DevCred</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-1">
              {[
                { path: "/", label: "Home" },
                { path: "/explore", label: "Explore" },
                { path: "/repositories", label: "Repositories" },
                { path: "/mint-nft", label: "Mint NFT" },
                { path: "/social", label: "Social" }
              ].map((item) => (
                <Link key={item.path} href={item.path}>
                  <a className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    location === item.path
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  }`}>
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            {isConnected && !isAuthenticated && (
              <Button 
                variant="outline"
                size="sm"
                onClick={connectGitHub}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg height="20" width="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Connect GitHub
              </Button>
            )}
            {isAuthenticated && user?.githubUser && (
              <Link href="/profile" className="flex items-center gap-2 rounded-full overflow-hidden pr-3 pl-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <img 
                  src={user.githubUser.avatar_url} 
                  alt={user.githubUser.login} 
                  className="w-8 h-8 rounded-full ring-2 ring-primary/30" 
                />
                <span className="text-sm hidden md:inline-block font-medium">{user.githubUser.login}</span>
              </Link>
            )}
            <button 
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative group">
                  <Input 
                    type="text"
                    placeholder="Search developers..."
                    className="w-52 bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-transparent focus:border-primary/30 transition-all duration-200 group-hover:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 group-hover:text-primary transition-colors"></i>
                </div>
              </form>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
