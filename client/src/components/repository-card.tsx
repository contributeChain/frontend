import { Link } from "wouter";
import { formatTimeAgo } from "@/lib/utils";
import { type Repository, addRepositoryFollowActivity, getUserByWalletAddress, isFollowingRepository } from "@/lib/grove-service";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGrove } from "@/hooks/use-grove";

interface RepositoryCardProps {
  repository: Repository;
  username: string;
  onRefresh?: () => Promise<void>;
}

export default function RepositoryCard({ repository, username, onRefresh }: RepositoryCardProps) {
  const { address, isConnected } = useAccount();
  const { refreshGroveData } = useGrove();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user is already following this repository when component mounts
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (isConnected && address) {
        try {
          const repoFullName = `${username}/${repository.name}`;
          const following = await isFollowingRepository(address, repoFullName);
          setIsFollowing(following);
        } catch (error) {
          console.error("Error checking repository following status:", error);
        }
      }
    };
    
    checkFollowingStatus();
  }, [address, isConnected, repository.name, username]);
  
  // Get repository icon based on the repository language or name
  const getRepositoryIcon = () => {
    const language = repository.language?.toLowerCase() || '';
    
    if (language.includes('react') || repository.name.toLowerCase().includes('react')) {
      return 'fa-react';
    } else if (language.includes('node') || repository.name.toLowerCase().includes('node')) {
      return 'fa-node-js';
    } else if (language.includes('javascript') || language.includes('js')) {
      return 'fa-js';
    } else if (language.includes('typescript') || language.includes('ts')) {
      return 'fa-code';
    } else if (language.includes('python') || language.includes('py')) {
      return 'fa-python';
    } else if (language.includes('blockchain') || repository.name.toLowerCase().includes('blockchain')) {
      return 'fa-code';
    } else if (language.includes('web3') || repository.name.toLowerCase().includes('web3')) {
      return 'fa-layer-group';
    } else if (language.includes('defi') || repository.name.toLowerCase().includes('defi')) {
      return 'fa-layer-group';
    } else {
      return 'fa-code';
    }
  };

  // Get repository tag based on the repository language or name
  const getRepositoryTag = () => {
    const language = repository.language?.toLowerCase() || '';
    
    if (language.includes('react') || repository.name.toLowerCase().includes('react')) {
      return 'React';
    } else if (language.includes('web3') || repository.name.toLowerCase().includes('web3')) {
      return 'Web3';
    } else if (language.includes('blockchain') || repository.name.toLowerCase().includes('blockchain')) {
      return 'Blockchain';
    } else if (language.includes('defi') || repository.name.toLowerCase().includes('defi')) {
      return 'DeFi';
    } else if (language) {
      return repository.language || 'Other';
    } else {
      return 'Other';
    }
  };

  // Get tag color class based on tag
  const getTagColorClass = () => {
    const tag = getRepositoryTag().toLowerCase();
    
    if (tag === 'react') {
      return 'bg-secondary/10 text-secondary';
    } else if (tag === 'web3') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'blockchain') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'defi') {
      return 'bg-accent/10 text-accent';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  // Get icon color class based on tag
  const getIconColorClass = () => {
    const tag = getRepositoryTag().toLowerCase();
    
    if (tag === 'react') {
      return 'bg-secondary/10 text-secondary';
    } else if (tag === 'web3' || tag === 'blockchain') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'defi') {
      return 'bg-accent/10 text-accent';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };
  
  // Handle repository follow
  const handleFollow = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to follow repositories",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get user data for the current wallet address
      const user = await getUserByWalletAddress(address);
      
      if (!user) {
        toast({
          title: "Error",
          description: "User profile not found. Please create a profile first.",
          variant: "destructive"
        });
        return;
      }
      
      // Add repository follow activity
      const repoFullName = `${username}/${repository.name}`;
      const success = await addRepositoryFollowActivity(repoFullName, user, address as `0x${string}`);
      
      if (success) {
        setIsFollowing(true);
        toast({
          title: "Success",
          description: `You are now following ${repoFullName}`
        });
        
        // Refresh data to update UI
        refreshGroveData();
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to follow repository. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error following repository:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/20">
      <Link href={`/repositories/${repository.id}`}>
        <a className="block cursor-pointer">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getIconColorClass()} rounded-full flex items-center justify-center`}>
                  <i className={`fas ${getRepositoryIcon()}`}></i>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">{repository.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`text-xs px-2 py-1 ${getTagColorClass()} rounded-full`}>
                  {getRepositoryTag()}
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {repository.description || "No description provided."}
            </p>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-star"></i>
                  <span>{repository.stars}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-code-branch"></i>
                  <span>{repository.forks}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-secondary font-medium">
                <i className="fas fa-certificate text-xs"></i>
                <span>{repository.nftCount} NFTs</span>
              </div>
            </div>
          </div>
        </a>
      </Link>
      
      <div className="border-t border-gray-100 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Updated {repository.lastUpdated ? formatTimeAgo(repository.lastUpdated) : 'recently'}</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Button
                size="sm" 
                variant="outline"
                className={`text-xs ${isFollowing ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFollow();
                }}
                disabled={isProcessing || isFollowing}
              >
                {isProcessing ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : isFollowing ? (
                  <i className="fas fa-check mr-1"></i>
                ) : (
                  <i className="fas fa-bell mr-1"></i>
                )}
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            <Link href={`/mint-nft?repo=${username}/${repository.name}`}>
              <a className="text-secondary hover:text-secondary/90 text-sm font-medium flex items-center gap-1">
                <i className="fas fa-award text-xs"></i>
                Mint NFT
              </a>
            </Link>
            <Link href={`/repositories/${repository.id}`}>
              <a className="text-primary hover:text-primary/90 text-sm font-medium">View Details</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
