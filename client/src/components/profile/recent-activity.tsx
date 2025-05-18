import { useState, useEffect } from "react";
import { Activity, User } from "@shared/schema";
import { fetchGitHubActivities } from "@/lib/github-utils";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "wouter";

interface RecentActivityProps {
  user: User;
}

export default function RecentActivity({ user }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user.githubUsername) return;
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/activities/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error",
          description: "Failed to load recent activities. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [user, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
      </div>
    );
  }
  
  // If no activities, show placeholder activities
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      userId: user.id,
      type: "commit",
      repoName: "react-performance-toolkit",
      description: "Added new virtualization component with 40% performance improvement",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      metadata: {
        tags: [
          { name: "performance", color: "secondary" },
          { name: "react", color: "primary" },
          { name: "optimization", color: "accent" }
        ]
      }
    },
    {
      id: 2,
      userId: user.id,
      type: "nft_mint",
      repoName: "",
      description: "Earned NFT PR-MERGE-42",
      nftId: 1,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      metadata: {
        name: "PR-MERGE-42",
        description: "Major feature merge recognized with on-chain credential",
        rarity: "common",
        transactionHash: "0x3a2...8f91",
        tags: [
          { name: "nft", color: "accent" }
        ]
      }
    },
    {
      id: 3,
      userId: user.id,
      type: "repo_create",
      repoName: "blockchain-auth-system",
      description: "New open source project for Web3 authentication with OAuth integration",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      metadata: {
        tags: [
          { name: "blockchain", color: "secondary" },
          { name: "auth", color: "primary" },
          { name: "web3", color: "accent" }
        ]
      }
    }
  ];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commit":
        return "fa-code-commit";
      case "nft_mint":
        return "fa-award";
      case "repo_create":
        return "fa-star";
      default:
        return "fa-check-circle";
    }
  };
  
  const getIconClass = (type: string) => {
    switch (type) {
      case "commit":
        return "bg-primary/10 text-primary";
      case "nft_mint":
        return "bg-accent/10 text-accent";
      case "repo_create":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-500";
    }
  };
  
  const getTagClass = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "secondary":
        return "bg-secondary/10 text-secondary";
      case "accent":
        return "bg-accent/10 text-accent";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-500";
    }
  };
  
  return (
    <>
      <h4 className="font-display font-bold text-lg mb-4">Recent Activity</h4>
      <div className="space-y-3">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-3 items-start">
            <div className={`w-8 h-8 ${getIconClass(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${getActivityIcon(activity.type)} text-sm`}></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium">
                  {activity.type === "commit" && (
                    <>Contributed to <Link href={`/repositories/${activity.repoName}`}><a className="text-primary">{activity.repoName}</a></Link></>
                  )}
                  {activity.type === "nft_mint" && (
                    <>Earned NFT <span className="text-accent">{activity.metadata?.name}</span></>
                  )}
                  {activity.type === "repo_create" && (
                    <>Created repository <Link href={`/repositories/${activity.repoName}`}><a className="text-secondary">{activity.repoName}</a></Link></>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.createdAt)}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
              
              {activity.metadata?.tags && (
                <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                  {activity.metadata.tags.map((tag, idx) => (
                    <span key={idx} className={`px-2 py-1 ${getTagClass(tag.color)} rounded-full`}>{tag.name}</span>
                  ))}
                </div>
              )}
              
              {activity.type === "nft_mint" && activity.metadata?.transactionHash && (
                <div className="mt-2 flex items-center">
                  <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-1">
                    <i className="fas fa-link text-gray-500"></i>
                    <span className="font-mono">{activity.metadata.transactionHash}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
