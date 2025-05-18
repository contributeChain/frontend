import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-darkBg/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-code text-white text-sm"></i>
                </div>
                <span className="font-display font-bold text-xl tracking-tight">DevCred</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/" ? "text-darkText dark:text-lightText border-b-2 border-primary" : "text-gray-500 hover:text-primary dark:hover:text-primary"
                }`}>
                  Home
                </a>
              </Link>
              <Link href="/explore">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/explore" ? "text-darkText dark:text-lightText border-b-2 border-primary" : "text-gray-500 hover:text-primary dark:hover:text-primary"
                }`}>
                  Explore
                </a>
              </Link>
              <Link href="/repositories">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/repositories" ? "text-darkText dark:text-lightText border-b-2 border-primary" : "text-gray-500 hover:text-primary dark:hover:text-primary"
                }`}>
                  Repositories
                </a>
              </Link>
              <Link href="/social">
                <a className={`px-3 py-2 text-sm font-medium ${
                  location === "/social" ? "text-darkText dark:text-lightText border-b-2 border-primary" : "text-gray-500 hover:text-primary dark:hover:text-primary"
                }`}>
                  Social
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="hidden md:block bg-white dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
              onClick={toggleTheme}
            >
              {resolvedTheme === "dark" ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Input 
                    type="text"
                    placeholder="Search developers..."
                    className="w-64 bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
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
