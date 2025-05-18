import { User } from "@shared/schema";
import { fetchNFTsForWallet } from "@/lib/web3-utils";
import { fetchGitHubUser, fetchGitHubRepos } from "@/lib/github-utils";
import { useState, useEffect } from "react";

interface UserStatsProps {
  user: User;
}

export default function UserStats({ user }: UserStatsProps) {
  const [stats, setStats] = useState({
    contributions: 0,
    repositories: 0,
    nfts: 0,
    reputation: user.reputation || 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch GitHub stats if user has GitHub username
        if (user.githubUsername) {
          const githubUser = await fetchGitHubUser(user.githubUsername);
          const repositories = await fetchGitHubRepos(user.githubUsername);
          
          if (githubUser && repositories) {
            setStats(prevStats => ({
              ...prevStats,
              repositories: repositories.length,
              // This is a placeholder, in a real app we would fetch actual contributions count
              contributions: Math.floor(Math.random() * 2000) + 500
            }));
          }
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
      }
    };
    
    fetchStats();
  }, [user]);
  
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
        <div className="text-3xl font-display font-bold text-accent">{stats.nfts}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">NFTs Earned</div>
      </div>
      <div className="p-6 text-center border-t md:border-t-0 border-gray-200 dark:border-gray-800">
        <div className="text-3xl font-display font-bold text-gray-800 dark:text-gray-200">{stats.reputation}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Reputation Score</div>
      </div>
    </div>
  );
}
