import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { useConnections } from "@/hooks/use-connections";
import { useGitHubStore, useAuthStore } from "@/store";
import { useDisconnect } from "wagmi";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Menu, Search, X, ChevronDown, Home, Github, Code, Sun, Moon, Plus, User, LogOut, Settings, Blocks, Wallet, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { disconnect } = useDisconnect();
  const githubLogout = useGitHubStore(state => state.logout);
  const authLogout = useAuthStore(state => state.logout);
  const { toast } = useToast();
  
  const {
    isConnected,
    isAuthenticated,
    isGitHubAuthenticated,
    shouldConnectGitHub,
    displayUser,
  } = useConnections();

  // Listen for scroll to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setShowSearch(false);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Individual disconnect functions
  const handleWalletDisconnect = async () => {
    try {
      disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const handleGitHubDisconnect = async () => {
    try {
      await githubLogout();
      toast({
        title: "GitHub Disconnected",
        description: "Your GitHub account has been disconnected",
      });
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect GitHub",
        variant: "destructive",
      });
    }
  };

  const handleAuthDisconnect = async () => {
    try {
      await authLogout();
      toast({
        title: "Signed Out",
        description: "You've been signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Navigation items with connection status indicators
  const navItems = [
    { path: "/", label: "Home", icon: <Home size={16} /> },
    { path: "/explore", label: "Explore", icon: <Blocks size={16} /> },
    { 
      path: "/repositories", 
      label: "Repos", 
      icon: <Github size={16} />,
      requiresGithub: false,
    },
    {
      path: "/social",
      label: "Social",
      icon: <User size={16} />,
      requiresAuth: false,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <User size={16} />,
      requiresAuth: false,
    },
  ];

  // Get connection status indicator
  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: <Wallet className="text-yellow-500" size={14} />,
        text: "Connect Wallet",
        action: () => null, // WalletConnectButton handles this
      };
    }
    if (!isGitHubAuthenticated) {
      return {
        icon: <Github className="text-yellow-500" size={14} />,
        text: "Connect GitHub",
        action: () => setLocation("/link-github"),
      };
    }
    if (!isAuthenticated) {
      return {
        icon: <LinkIcon className="text-yellow-500" size={14} />,
        text: "Authenticate",
        action: () => setLocation("/setup"),
      };
    }
    return null;
  };

  const connectionStatus = getConnectionStatus();

  return (
    <header 
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md ${
        isScrolled ? "border-b border-border shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
                <Code className="text-white" size={16} />
              </div>
              <span className="font-display font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hidden sm:inline">DevCred</span>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => {
              // Always show navigation items in desktop view regardless of auth status
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                    location === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Input 
                  type="text"
                  placeholder="Search..."
                  className="w-40 h-8 bg-muted rounded-full py-1 px-3 pl-8 text-xs focus:w-56 transition-all duration-300 border-transparent focus:border-primary/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-2.5 top-2 text-muted-foreground" size={14} />
              </form>
            </div>

            {/* Connection Status */}
            {connectionStatus && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 h-8 text-xs"
                onClick={connectionStatus.action}
              >
                {connectionStatus.icon}
                {connectionStatus.text}
              </Button>
            )}

            {/* Wallet Connect Button - Always shown */}
            <WalletConnectButton size="sm" />

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 hidden sm:flex"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </Button>

            {/* User Menu */}
            {displayUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 rounded-full p-0 overflow-hidden">
                    <img 
                      src={displayUser.avatar_url} 
                      alt={displayUser.login} 
                      className="w-7 h-7 rounded-full ring-1 ring-primary/30" 
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {displayUser && (
                    <>
                      <div className="flex items-center gap-2 p-2 mb-1">
                        <img 
                          src={displayUser.avatar_url} 
                          alt={displayUser.login} 
                          className="w-8 h-8 rounded-full" 
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{displayUser.login}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            Connected
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User size={14} className="mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  {shouldConnectGitHub && (
                    <DropdownMenuItem onClick={() => setLocation("/link-github")}>
                      <Github size={14} className="mr-2" />
                      Connect GitHub
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {isConnected && (
                    <DropdownMenuItem onClick={handleWalletDisconnect}>
                      <Wallet size={14} className="mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  )}
                  
                  {isGitHubAuthenticated && (
                    <DropdownMenuItem onClick={handleGitHubDisconnect}>
                      <Github size={14} className="mr-2" />
                      Disconnect GitHub
                    </DropdownMenuItem>
                  )}
                  
                  {isAuthenticated && (
                    <DropdownMenuItem onClick={handleAuthDisconnect} className="text-red-500">
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <Menu size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <Code className="text-white" size={14} />
                      </div>
                      <span className="font-display font-bold text-base">DevCred</span>
                    </div>
                    <SheetClose className="rounded-full opacity-70 hover:opacity-100">
                      <X size={16} />
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col space-y-1 py-4">
                    {navItems.map((item) => {
                      // Always show navigation items in mobile view regardless of auth status
                      return (
                        <SheetClose key={item.path} asChild>
                          <Link 
                            href={item.path}
                            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                              location === item.path
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <div className="mt-auto pt-4 border-t space-y-2">
                    {/* Always show wallet connect button */}
                    <WalletConnectButton className="w-full" size="sm" />
                    
                    {connectionStatus && connectionStatus.text !== "Connect Wallet" && (
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          onClick={connectionStatus.action}
                          className="w-full flex items-center justify-center gap-2 text-sm h-9"
                          size="sm"
                        >
                          {connectionStatus.icon}
                          {connectionStatus.text}
                        </Button>
                      </SheetClose>
                    )}
                    
                    {isGitHubAuthenticated && (
                      <Button 
                        variant="outline"
                        onClick={handleGitHubDisconnect}
                        className="w-full flex items-center justify-center gap-2 text-sm h-9"
                        size="sm"
                      >
                        <Github size={14} />
                        Disconnect GitHub
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-center gap-2 text-sm h-9"
                      size="sm"
                    >
                      {resolvedTheme === "dark" ? (
                        <>
                          <Sun size={14} />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon size={14} />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden py-2">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                type="text"
                placeholder="Search developers..."
                className="w-full h-8 bg-muted rounded-full py-1 pl-8 pr-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
              <Button 
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setShowSearch(false)}
              >
                <X size={14} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
