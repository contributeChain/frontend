import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Activity, User } from "@shared/schema";
import ActivityCard from "@/components/activity-card";
import TrendingDevelopers from "@/components/social/trending-developers";
import PopularNFTs from "@/components/social/popular-nfts";
import PopularTags from "@/components/social/popular-tags";
import { useToast } from "@/hooks/use-toast";
import { lensService } from "@/services/lens";
import { LensPostMetadata } from "@/types/lens";
import LensPostForm from "@/components/lens-post-form";
import { useAccount } from "wagmi";
import { useLens } from "@/hooks/use-lens";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";

export default function Social() {
  const [activities, setActivities] = useState<{activity: Activity, user: User}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { hasProfile } = useLens();

  // Determine if viewing as guest
  const isGuestMode = !isConnected || hasProfile === false;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    
    try {
      // Use Lens service to fetch posts from the Lens Protocol
      const result = await lensService.fetchFeed(20);
      
      if (result.success) {
        setActivities(result.posts);
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
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const filteredActivities = activities.filter(item => {
    // Cast metadata to our type to help TypeScript
    const metadata = item.activity.metadata as LensPostMetadata;
    
    if (filter === "all") return true;
    if (filter === "nft_mints" && item.activity.type === "nft_mint") return true;
    if (filter === "achievements" && (
      item.activity.type === "nft_mint" || 
      metadata?.achievement
    )) return true;
    if (filter === "contributions" && item.activity.type === "commit") return true;
    if (filter === "lens_posts" && item.activity.type === "lens_post") return true;
    return false;
  });

  return (
    <>
      <Helmet>
        <title>Developer Social Feed - Lens Alchemy</title>
        <meta name="description" content="Stay up to date with the latest developer activities, NFT mints, and achievements in the Lens Alchemy community." />
      </Helmet>
      
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Developer Social Feed</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Stay up to date with the latest developer activities</p>
            </div>
          </div>
          
          {isGuestMode && (
            <Alert className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-amber-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <AlertTitle className="text-amber-800 dark:text-amber-400">Guest Mode</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                You're browsing in guest mode. Connect your wallet and create a Lens profile to interact with posts and create your own content.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
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
              <Button 
                onClick={() => handleFilterChange("lens_posts")}
                className={`text-sm px-3 py-1 rounded-full ${filter === "lens_posts" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                variant="ghost"
              >
                Lens Posts
              </Button>
            </div>
            
            {isGuestMode && (
              <Button variant="default" className="text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Connect Wallet
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="mb-8">
                <LensPostForm />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {filteredActivities.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                      <i className="fas fa-rss text-4xl text-gray-400 mb-4"></i>
                      <h3 className="text-xl font-display font-bold mb-2">No activities found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {isGuestMode 
                          ? filter === "all"
                            ? "You're browsing as a guest. Content is limited to public posts."
                            : `No ${filter.replace('_', ' ')} found matching the current filter.` 
                          : "No activities match the current filter. Try a different filter or follow more developers."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredActivities.map(({ activity, user }) => (
                        <ActivityCard key={activity.id} activity={activity} user={user} />
                      ))}
                      
                      {isGuestMode && filteredActivities.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
                          <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded-full mr-3">
                              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Guest mode limitations</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Connect your wallet and create a Lens profile to like, comment, and create your own posts.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {filteredActivities.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline"
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-darkText dark:text-lightText font-medium py-2 px-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                        onClick={fetchActivities}
                        disabled={isLoading}
                      >
                        <span>{isLoading ? 'Loading...' : 'Load More'}</span>
                        {isLoading ? null : <i className="fas fa-chevron-down"></i>}
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
              
              {isGuestMode && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-5 rounded-xl mt-6 border border-primary-100 dark:border-primary-800">
                  <h3 className="font-bold text-primary-900 dark:text-primary-400 text-lg mb-3">Why Create a Lens Profile?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Own your content and social graph</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Share GitHub contributions on-chain</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Earn rewards for your contributions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Build your reputation across Web2 & Web3</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-4" size="sm">
                    Connect Wallet & Create Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
