import { Link, useLocation } from "wouter";
import { useConnections } from "@/hooks/use-connections";
import { useGitHubStore, useAuthStore } from "@/store";
import { useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Github,
  Code,
  User,
  Settings,
  Blocks,
  Plus,
  Wallet,
  Link as LinkIcon,
  Trophy,
  Star,
  GitFork,
  Users,
  Activity,
  Zap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { disconnect } = useDisconnect();
  const githubLogout = useGitHubStore(state => state.logout);
  const authLogout = useAuthStore(state => state.logout);
  
  const {
    isConnected,
    isAuthenticated,
    isGitHubAuthenticated,
    displayUser,
  } = useConnections();

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

  // Define navigation sections based on connection state
  const getNavSections = () => {
    const sections = [
      {
        title: "General",
        items: [
          {
            href: "/",
            label: "Home",
            icon: Home,
            requiresAuth: false
          },
          {
            href: "/explore",
            label: "Explore",
            icon: Blocks,
            requiresAuth: false
          }
        ]
      }
    ];

    // Add GitHub section if connected
    if (isGitHubAuthenticated) {
      sections.push({
        title: "GitHub",
        items: [
          {
            href: "/repositories",
            label: "Repositories",
            icon: Github,
            requiresAuth: false
          },
          {
            href: "/contributions",
            label: "Contributions",
            icon: GitFork,
            requiresAuth: false
          },
          {
            href: "/achievements",
            label: "Achievements",
            icon: Trophy,
            requiresAuth: false
          }
        ]
      });
    }

    // Social section - always show but limit functionality for unauthenticated users
    sections.push({
      title: "Social",
      items: [
        {
          href: "/social",
          label: "Activity Feed",
          icon: Activity,
          requiresAuth: false
        },
        {
          href: "/connections",
          label: "Connections",
          icon: Users,
          requiresAuth: true
        },
        {
          href: "/reputation",
          label: "Reputation",
          icon: Star,
          requiresAuth: true
        }
      ]
    });

    // Add Create section - always visible but limited
    sections.push({
      title: "Create",
      items: [
        {
          href: "/mint-nft",
          label: "Mint NFT",
          icon: Plus,
          requiresAuth: false
        },
        {
          href: "/boost",
          label: "Boost",
          icon: Zap,
          requiresAuth: true
        }
      ]
    });

    return sections;
  };

  const navSections = getNavSections();

  // Define type for connection messages
  type ConnectionMessage = {
    icon: any;
    title: string;
    description: string;
    action: MouseEventHandler<HTMLButtonElement> | undefined;
    type: string;
  };

  // Get the connection message for each service
  const getConnectionMessages = () => {
    const messages: ConnectionMessage[] = [];
    
    // Wallet connection
    if (!isConnected) {
      messages.push({
        icon: Wallet,
        title: "Connect Wallet",
        description: "Connect your wallet to get started",
        action: undefined, // ConnectWalletButton handles this
        type: "wallet"
      });
    } else {
      messages.push({
        icon: Wallet,
        title: "Disconnect Wallet",
        description: "Disconnect your crypto wallet",
        action: handleWalletDisconnect,
        type: "wallet-disconnect"
      });
    }
    
    // GitHub connection
    if (isConnected && !isGitHubAuthenticated) {
      messages.push({
        icon: Github,
        title: "Connect GitHub",
        description: "Link your GitHub account",
        action: () => navigate("/link-github"),
        type: "github"
      });
    } else if (isGitHubAuthenticated) {
      messages.push({
        icon: Github,
        title: "Disconnect GitHub",
        description: "Unlink your GitHub account",
        action: handleGitHubDisconnect,
        type: "github-disconnect"
      });
    }
    
    // Authentication status
    if (isConnected && isGitHubAuthenticated && !isAuthenticated) {
      messages.push({
        icon: LinkIcon,
        title: "Complete Setup",
        description: "Finish setting up your account",
        action: () => navigate("/setup"),
        type: "setup"
      });
    } else if (isAuthenticated) {
      messages.push({
        icon: LogOut,
        title: "Sign Out",
        description: "Sign out of your account",
        action: handleAuthDisconnect,
        type: "auth-disconnect"
      });
    }
    
    return messages;
  };

  const connectionMessages = getConnectionMessages();

  return (
    <div className="flex h-screen flex-col gap-2">
      {/* Connection Status */}
      <div className="px-3 py-2 space-y-2">
        {/* Always show wallet connect button */}
        <ConnectWalletButton className="w-full justify-start" />
        
        {connectionMessages.map((message, index) => {
          // Skip wallet connection as we have the button above
          if (message.type === "wallet") return null;
          
          return (
            <Button
              key={index}
              variant={message.type.includes("disconnect") ? "destructive" : "outline"}
              className={cn(
                "w-full justify-start gap-2 h-auto py-3",
                message.type.includes("disconnect") && "bg-destructive/10 border-destructive/20"
              )}
              onClick={message.action}
            >
              <message.icon className={message.type.includes("disconnect") ? "text-destructive" : "text-yellow-500"} size={16} />
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{message.title}</span>
                <span className="text-xs text-muted-foreground">
                  {message.description}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-2">
          {navSections.map((section) => {
            // Filter items based on auth requirements
            const items = section.items.filter(
              (item) => !item.requiresAuth || isAuthenticated
            );

            // Skip empty sections
            if (items.length === 0) return null;

            return (
              <div key={section.title}>
                <h4 className="px-2 text-xs font-medium text-muted-foreground">
                  {section.title}
                </h4>
                <div className="mt-2 space-y-1">
                  {items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2",
                          location === item.href && "bg-primary/10 text-primary"
                        )}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* User Profile */}
      {displayUser && (
        <>
          <Separator />
          <div className="p-3">
            <Link href="/profile">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-auto py-2"
              >
                <img
                  src={displayUser.avatar_url}
                  alt={displayUser.login}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{displayUser.login}</span>
                  <span className="text-xs text-muted-foreground">View Profile</span>
                </div>
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
} 