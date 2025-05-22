import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/activity-card";
import TrendingDevelopers from "@/components/social/trending-developers";
import PopularNFTs from "@/components/social/popular-nfts";
import PopularTags from "@/components/social/popular-tags";
import { useToast } from "@/hooks/use-toast";
import { useConnections } from "@/hooks/use-connections";
import { lensService, PageSize } from "@/services/lens";
import { LensPostMetadata } from "@/types/lens";
import { useLens } from "@/hooks/use-lens";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";
import { Activity, User, invalidateAllGroveCache } from "@/lib/grove-service";
import { useGrove } from "@/hooks/use-grove";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { Link } from "wouter";

export default function Social() {
  const [activities, setActivities] = useState<{activity: Activity, user: User}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { toast } = useToast();
  const { isConnected, isGitHubAuthenticated } = useConnections();
  const { hasProfile } = useLens();
  const { refreshGroveData } = useGrove();

  useEffect(() => {
    if (isConnected) {
      fetchActivities(true);
    }
  }, [isConnected]);

  const fetchActivities = async (reset = false) => {
    if (!isConnected) return;
    
    if (reset) {
      setIsLoading(true);
      setCursor(null); // Reset cursor when fetching from the beginning
    } else {
      setLoadingMore(true);
    }
    
    try {
      // First refresh Grove data to ensure we have latest content
      refreshGroveData();
      
      // Use Lens service to fetch posts from the Lens Protocol
      const result = await lensService.fetchFeed(
        PageSize.Ten,
        reset ? null : cursor
      );
      
      if (result.success) {
        if (reset) {
          setActivities(result.posts);
        } else {
          setActivities(prev => [...prev, ...result.posts]);
        }
        
        // Update cursor and hasMore state
        setCursor(result.cursor);
        setHasMore(result.hasMore);
      } else {
        toast({
          title: "Error",
          description: "Failed to load social feed from Lens",
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
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    // Reset and fetch activities with new filter
    setCursor(null);
    fetchActivities(true);
  };

  // Add function to handle refresh
  const handleManualRefresh = useCallback(() => {
    // Invalidate Grove cache and fetch activities again
    refreshGroveData();
    fetchActivities(true);
  }, [refreshGroveData]);

  // Show loading skeletons
  const renderLoadingSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <ActivityCard
        key={`skeleton-${index}`}
        activity={{
          activity: {
            id: 0,
            userId: 0,
            type: "lens_post",
            description: "",
            createdAt: new Date(),
            metadata: {}
          }
        } as any}
        user={{
          id: 0,
          username: "",
          githubUsername: "",
          avatarUrl: "",
          password: "",
          reputation: 0,
          walletAddress: "",
          bio: "",
          location: "",
          website: "",
          createdAt: new Date()
        }}
        isLoading={true}
      />
    ));
  };

  const filteredActivities = activities.filter(item => {
    // Cast metadata to our type to help TypeScript
    const metadata = item.activity.activity.metadata as LensPostMetadata;
    
    if (filter === "all") return true;
    if (filter === "nft_mints" && item.activity.activity.type === "nft_mint") return true;
    if (filter === "achievements" && (
      item.activity.activity.type === "nft_mint" || 
      metadata?.achievement
    )) return true;
    if (filter === "contributions" && item.activity.activity.type === "commit") return true;
    if (filter === "lens_posts" && item.activity.activity.type === "lens_post") return true;
    return false;
  });

  return (
    <>
      <Helmet>
        <title>Developer Social Feed - Lens Alchemy</title>
        <meta name="description" content="Stay up to date with the latest developer activities, NFT mints, and achievements in the Lens Alchemy community." />
      </Helmet>
      
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Developer Social Feed</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Stay up to date with the latest developer activities</p>
            </div>
            
            {isConnected && (
              <Button 
                variant="outline" 
                onClick={handleManualRefresh} 
                className="gap-2 group relative overflow-hidden"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                </svg>
                Refresh
                <div className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Button>
            )}
          </div>
          
          {!isConnected ? (
            <div className="bg-gradient-to-br from-primary/5 to-blue-600/5 dark:from-primary/10 dark:to-blue-600/10 rounded-xl p-8 border border-primary/10 relative overflow-hidden shadow-sm backdrop-blur-sm text-center">
              <div className="max-w-md mx-auto py-8">
                <h3 className="text-xl font-semibold mb-4">Connect Your Wallet to View the Social Feed</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  To access the developer social feed and interact with the community, please connect your wallet.
                </p>
                <ConnectWalletButton size="lg" />
              </div>
            </div>
          ) : !isGitHubAuthenticated ? (
            <div className="bg-gradient-to-br from-primary/5 to-blue-600/5 dark:from-primary/10 dark:to-blue-600/10 rounded-xl p-8 border border-primary/10 relative overflow-hidden shadow-sm backdrop-blur-sm text-center">
              <div className="max-w-md mx-auto py-8">
                <h3 className="text-xl font-semibold mb-4">Connect Your GitHub Account</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  To see personalized content in the social feed, please connect your GitHub account.
                </p>
                <Button asChild size="lg">
                  <Link href="/link-github">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 -ml-1" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Connect with GitHub
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-3 rounded-xl shadow-sm">
                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {["all", "nft_mints", "achievements", "contributions", "lens_posts"].map((filterType) => (
                    <Button 
                      key={filterType}
                      onClick={() => handleFilterChange(filterType)}
                      className={`text-sm whitespace-nowrap px-4 py-2 rounded-full transition-all duration-300 ${
                        filter === filterType 
                          ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      variant="ghost"
                    >
                      {filterType === "all" ? "All" : 
                       filterType === "nft_mints" ? "NFT Mints" : 
                       filterType === "achievements" ? "Achievements" : 
                       filterType === "contributions" ? "Contributions" : 
                       "Lens Posts"}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  {/* Coming Soon Post Creation Section */}
                  <div className="bg-gradient-to-br from-primary/5 to-blue-600/5 dark:from-primary/10 dark:to-blue-600/10 rounded-xl p-8 border border-primary/10 relative overflow-hidden shadow-sm backdrop-blur-sm">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold mb-3 text-primary">Create Post</h3>
                      <div className="bg-white/70 dark:bg-gray-900/70 rounded-lg p-6 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                          <div className="h-10 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          <div className="text-center px-6 py-8">
                            <h4 className="text-lg font-medium mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Coming Soon!</h4>
                            <p className="text-gray-500 dark:text-gray-400">
                              We're working on an enhanced posting experience for developers.
                              <br />Stay tuned for updates!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isLoading && activities.length === 0 ? (
                    <div className="space-y-6">
                      {renderLoadingSkeletons()}
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    <div className="space-y-6">
                      {filteredActivities.map((activity) => (
                        <ActivityCard
                          key={activity.activity.activity.id}
                          activity={activity.activity}
                          user={activity.user}
                        />
                      ))}
                      
                      {hasMore && (
                        <div className="mt-8 flex justify-center">
                          <Button
                            onClick={() => fetchActivities()}
                            disabled={loadingMore}
                            variant="outline"
                            className="px-8 py-6 rounded-xl group relative overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {loadingMore ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Loading more activities...</span>
                                </>
                              ) : (
                                <>
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-5 w-5"
                                  >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                  <span>Load More Activities</span>
                                </>
                              )}
                            </span>
                            <div className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-8 h-8 text-gray-400"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No activities found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Try changing the filter or check back later.</p>
                      <Button onClick={handleManualRefresh} variant="outline">
                        Refresh Feed
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-4 space-y-8">
                  <TrendingDevelopers />
                  <PopularNFTs />
                  <PopularTags />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
