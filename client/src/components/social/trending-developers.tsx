import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fetchTrendingDevelopers, getUserByWalletAddress, addUserFollowActivity, User } from "@/lib/grove-service";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { getCurrentWalletAddress } from "@/lib/web3-utils";

export default function TrendingDevelopers() {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<{[key: number]: boolean}>({});
  const [processingStates, setProcessingStates] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    const loadDevelopers = async () => {
      setLoading(true);
      
      try {
        // Get trending developers from Grove storage
        const trendingDevs = await fetchTrendingDevelopers(10);
        setDevelopers(trendingDevs);
      } catch (error) {
        console.error("Error fetching trending developers from Grove:", error);
        // Keep empty array in case of error
        setDevelopers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadDevelopers();
  }, []);

  // Handle follow button click
  const handleFollow = async (developer: User) => {
    if (!isConnected || !address) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to follow developers",
        variant: "destructive"
      });
      return;
    }
    
    // Set processing state for this specific developer
    setProcessingStates(prev => ({ ...prev, [developer.id]: true }));
    
    try {
      // Get user data for the current wallet address
      const followerUser = await getUserByWalletAddress(address);
      
      if (!followerUser) {
        toast({
          title: "Error",
          description: "Your profile not found. Please create a profile first.",
          variant: "destructive"
        });
        return;
      }
      
      // Add user follow activity
      const success = await addUserFollowActivity(
        developer, // followed user
        followerUser, // follower user
        address as `0x${string}` // wallet address
      );
      
      if (success) {
        // Update following state for this specific developer
        setFollowingStates(prev => ({ ...prev, [developer.id]: true }));
        
        toast({
          title: "Success",
          description: `You are now following ${developer.username}`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to follow developer. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error following developer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Clear processing state
      setProcessingStates(prev => ({ ...prev, [developer.id]: false }));
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display font-bold text-lg">Trending Developers</h3>
        </div>
        <div className="p-4 flex justify-center items-center h-48">
          <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
        </div>
      </div>
    );
  }
  
  // If there are no developers to display, show a message
  if (developers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display font-bold text-lg">Trending Developers</h3>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No trending developers found.</p>
          <p className="text-sm mt-2">Check back soon!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-display font-bold text-lg">Trending Developers</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {developers.map((developer) => (
            <div key={developer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${developer.githubUsername || developer.id}`}>
                  <img 
                    src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}`} 
                    alt={`${developer.username} profile picture`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div>
                  <Link href={`/profile/${developer.githubUsername || developer.id}`}>
                    <div className="font-medium text-sm">{developer.username}</div>
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{developer.reputation || 0} reputation</div>
                </div>
              </div>
              <Button 
                className={`text-xs px-2 py-1 rounded-full ${
                  followingStates[developer.id] 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                variant={followingStates[developer.id] ? "default" : "ghost"}
                onClick={() => handleFollow(developer)}
                disabled={processingStates[developer.id] || followingStates[developer.id]}
              >
                {processingStates[developer.id] ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : followingStates[developer.id] ? (
                  <>
                    <i className="fas fa-check mr-1"></i> Following
                  </>
                ) : (
                  "Follow"
                )}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/explore">
            <Button variant="link" className="text-primary hover:text-primary/90 text-sm font-medium">
              View All Developers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
