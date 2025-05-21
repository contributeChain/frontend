import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useAuthStore, useGitHubStore } from "@/store";
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
import { Menu, Search, X, ChevronDown, Home, Github, Code, Sun, Moon, Plus, User, LogOut, Settings, Blocks } from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isConnected } = useAccount();
  
  // Use Zustand stores instead of context
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const githubLogout = useGitHubStore((state) => state.logout);
  
  // Combined logout function
  const handleLogout = () => {
    logout();
    githubLogout();
  };
  
  // Function to navigate to GitHub link page
  const navigateToGitHubLink = () => {
    setLocation("/github/link");
  };

  // Navigation items - simplified to the most important ones
  const navItems = [
    { path: "/", label: "Home", icon: <Home size={16} /> },
    { path: "/explore", label: "Explore", icon: <Blocks size={16} /> },
    { path: "/repositories", label: "Repos", icon: <Github size={16} /> },
  ];

  // Listen for scroll to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (location === "/") return null;
    
    const paths = location.split("/").filter(Boolean);
    if (paths.length === 0) return null;
    
    return (
      <Breadcrumb className="hidden md:flex text-xs">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {paths.map((path, index) => (
            <BreadcrumbItem key={path}>
              <BreadcrumbLink asChild>
                <Link href={`/${paths.slice(0, index + 1).join("/")}`}>
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </Link>
              </BreadcrumbLink>
              {index < paths.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setShowSearch(false);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header 
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md ${
        isScrolled ? "border-b border-border shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo - simplified */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
                <Code className="text-white" size={16} />
              </div>
              <span className="font-display font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent hidden sm:inline">DevCred</span>
            </Link>
          </div>

          {/* Unified Center Section */}
          <div className="flex items-center">
            {/* Desktop Navigation - compact */}
            <nav className="hidden md:flex md:items-center md:space-x-1 mr-2">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} 
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                    location === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}>
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Compact Search Bar */}
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
          </div>

          {/* Right side actions - combined into a more compact format */}
          <div className="flex items-center space-x-1">
            {/* Search toggle (mobile) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={16} />
            </Button>

            {/* Combined Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                  <Plus size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/mint-nft">Mint NFT</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/social">Social</Link>
                </DropdownMenuItem>
                {isConnected && !isAuthenticated && (
                  <DropdownMenuItem onClick={navigateToGitHubLink}>
                    <Github size={14} className="mr-2" />
                    Connect GitHub
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle - compact */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 hidden sm:flex"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </Button>

            {/* User profile - compact */}
            {isAuthenticated && user?.githubUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 rounded-full p-0 overflow-hidden">
                    <img 
                      src={user.githubUser.avatar_url} 
                      alt={user.githubUser.login} 
                      className="w-7 h-7 rounded-full ring-1 ring-primary/30" 
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="flex items-center gap-2 p-2 mb-1">
                    <img 
                      src={user.githubUser.avatar_url} 
                      alt={user.githubUser.login} 
                      className="w-8 h-8 rounded-full" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.githubUser.login}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User size={14} className="mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings size={14} className="mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-500">
                    <LogOut size={14} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="block">
                <WalletConnectButton size="sm" />
              </div>
            )}

            {/* Mobile menu */}
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
                    {[
                      ...navItems,
                      { path: "/mint-nft", label: "Mint NFT", icon: <Plus size={16} /> },
                      { path: "/social", label: "Social", icon: <User size={16} /> }
                    ].map((item) => (
                      <SheetClose key={item.path} asChild>
                        <Link href={item.path} 
                          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                            location === item.path
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          }`}>
                          {item.icon}
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="mt-auto pt-4 border-t space-y-2">
                    {isConnected && !isAuthenticated && (
                      <SheetClose asChild>
                        <Button 
                          variant="outline"
                          onClick={navigateToGitHubLink}
                          className="w-full flex items-center justify-center gap-2 text-sm h-9"
                          size="sm"
                        >
                          <Github size={14} />
                          Connect GitHub
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <div className="w-full">
                        <WalletConnectButton size="sm" />
                      </div>
                    </SheetClose>
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

        {/* Mobile Search Overlay */}
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

        {/* Breadcrumbs - more compact */}
        <div className="pl-0 -mt-1 h-5 overflow-hidden">
          {generateBreadcrumbs()}
        </div>
      </div>
    </header>
  );
}
