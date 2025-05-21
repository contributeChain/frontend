import { User } from "@/lib/grove-service";
import { fetchNFTsForWallet } from "@/lib/web3-utils";
import { getUserStatistics } from "@/lib/githubClient";
import { useState, useEffect } from "react";

interface UserStatsProps {
  user: User;
}

export default function UserStats({ user }: UserStatsProps) {
  const [stats, setStats] = useState({
    contributions: 0,
    repositories: 0,
    followers: 0,
    nfts: 0,
    reputation: user.reputation || 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch GitHub stats if user has GitHub username
        if (user.githubUsername) {
          const githubStats = await getUserStatistics(user.githubUsername);
          
          setStats(prevStats => ({
            ...prevStats,
            contributions: githubStats.commitCount,
            repositories: githubStats.repositoryCount,
            followers: githubStats.followerCount
          }));
        }
        
        // Fetch NFTs if user has wallet address
        if (user.walletAddress) {
          const nfts = await fetchNFTsForWallet(user.walletAddress);
          
          if (nfts) {
            setStats(prevStats => ({
              ...prevStats,
              nfts: nfts.length
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 dark:border-gray-800">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 text-center border-r border-gray-200 dark:border-gray-800 last:border-r-0 animate-pulse">
            <div className="h-10 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 dark:border-gray-800">
      <div className="p-6 text-center border-r border-gray-200 dark:border-gray-800">
        <div className="text-3xl font-display font-bold text-primary">{stats.contributions.toLocaleString()}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Contributions</div>
      </div>
      <div className="p-6 text-center border-r border-gray-200 dark:border-gray-800 md:border-r-0 lg:border-r">
        <div className="text-3xl font-display font-bold text-secondary">{stats.repositories}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Repositories</div>
      </div>
      <div className="p-6 text-center border-t md:border-t-0 border-r border-gray-200 dark:border-gray-800">
        <div className="text-3xl font-display font-bold text-accent">{stats.followers}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
      </div>
      <div className="p-6 text-center border-t md:border-t-0 border-gray-200 dark:border-gray-800">
        <div className="text-3xl font-display font-bold text-gray-800 dark:text-gray-200">{stats.nfts}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">NFTs Earned</div>
      </div>
    </div>
  );
}
