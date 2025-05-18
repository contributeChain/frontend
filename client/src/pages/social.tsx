import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Activity, User } from "@shared/schema";
import ActivityCard from "@/components/activity-card";
import TrendingDevelopers from "@/components/social/trending-developers";
import PopularNFTs from "@/components/social/popular-nfts";
import PopularTags from "@/components/social/popular-tags";
import { useToast } from "@/hooks/use-toast";

export default function Social() {
  const [activities, setActivities] = useState<{activity: Activity, user: User}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/activities/feed');
        
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load social feed",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching social feed:", error);
        toast({
          title: "Error",
          description: "Failed to load social feed. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [toast]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const filteredActivities = activities.filter(item => {
    if (filter === "all") return true;
    if (filter === "nft_mints" && item.activity.type === "nft_mint") return true;
    if (filter === "achievements" && (
      item.activity.type === "nft_mint" || 
      item.activity.metadata?.achievement
    )) return true;
    if (filter === "contributions" && item.activity.type === "commit") return true;
    return false;
  });

  // Placeholder data if API failed
  const ensureActivities = filteredActivities.length > 0 ? filteredActivities : [
    {
      activity: {
        id: 1,
        userId: 1,
        type: "commit",
        repoName: "react-performance-toolkit",
        description: "Just released a major update to my React Performance Toolkit! Check out the new virtualization component that improves rendering by 40% 🚀",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: {
          tags: [
            { name: "react", color: "primary" },
            { name: "performance", color: "secondary" }
          ]
        }
      },
      user: {
        id: 1,
        username: "Sarah Chen",
        githubUsername: "sarahcodes",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
        password: "",
        reputation: 876,
        walletAddress: "0x3a2...8f91",
        bio: "",
        location: "",
        website: "",
        createdAt: new Date()
      }
    },
    {
      activity: {
        id: 2,
        userId: 2,
        type: "nft_mint",
        description: "Just minted my 100th contribution NFT on DevCred! The streak badge looks awesome 🏆",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        metadata: {
          name: "100 Day Contribution Streak",
          description: "Legendary NFT Achievement",
          rarity: "legendary",
          transactionHash: "0x7b4...2f6e",
          tags: [
            { name: "achievement", color: "accent" },
            { name: "streak", color: "secondary" }
          ]
        }
      },
      user: {
        id: 2,
        username: "Alex Rivera",
        githubUsername: "alexdev",
        avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
        password: "",
        reputation: 742,
        walletAddress: "0x7b4...2f6e",
        bio: "",
        location: "",
        website: "",
        createdAt: new Date()
      }
    },
    {
      activity: {
        id: 3,
        userId: 3,
        type: "repo_create",
        repoName: "blockchain-auth-system",
        description: "Excited to join the DevCred community! Just connected my GitHub account and minted my first NFT 🎉",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        metadata: {
          name: "First Contribution NFT",
          description: "Joined the DevCred ecosystem",
          transactionHash: "0x3d5...9f21",
          tags: [
            { name: "welcome", color: "primary" },
            { name: "firstNFT", color: "secondary" }
          ]
        }
      },
      user: {
        id: 3,
        username: "Maya Johnson",
        githubUsername: "mayacodes",
        avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
        password: "",
        reputation: 524,
        walletAddress: "0x3d5...9f21",
        bio: "",
        location: "",
        website: "",
        createdAt: new Date()
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Developer Social Feed - DevCred</title>
        <meta name="description" content="Stay up to date with the latest developer activities, NFT mints, and achievements in the DevCred community." />
      </Helmet>
      
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Developer Social Feed</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Stay up to date with the latest developer activities</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleFilterChange("all")}
                className={`text-sm px-3 py-1 rounded-full ${filter === "all" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                variant="ghost"
              >
                All
              </Button>
              <Button 
                onClick={() => handleFilterChange("nft_mints")}
                className={`text-sm px-3 py-1 rounded-full ${filter === "nft_mints" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                variant="ghost"
              >
                NFT Mints
              </Button>
              <Button 
                onClick={() => handleFilterChange("achievements")}
                className={`text-sm px-3 py-1 rounded-full ${filter === "achievements" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                variant="ghost"
              >
                Achievements
              </Button>
              <Button 
                onClick={() => handleFilterChange("contributions")}
                className={`text-sm px-3 py-1 rounded-full ${filter === "contributions" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                variant="ghost"
              >
                Contributions
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {ensureActivities.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                      <i className="fas fa-rss text-4xl text-gray-400 mb-4"></i>
                      <h3 className="text-xl font-display font-bold mb-2">No activities found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No activities match the current filter. Try a different filter or follow more developers.
                      </p>
                    </div>
                  ) : (
                    ensureActivities.map(({ activity, user }) => (
                      <ActivityCard key={activity.id} activity={activity} user={user} />
                    ))
                  )}
                  
                  {ensureActivities.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline"
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-darkText dark:text-lightText font-medium py-2 px-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                      >
                        <span>Load More</span>
                        <i className="fas fa-chevron-down"></i>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="lg:col-span-4">
              <TrendingDevelopers />
              <PopularNFTs />
              <PopularTags />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
