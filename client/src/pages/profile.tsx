import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, Activity, Repository } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ContributionGrid from "@/components/contribution-grid";
import UserStats from "@/components/profile/user-stats";
import FeaturedNFTs from "@/components/profile/featured-nfts";
import RecentActivity from "@/components/profile/recent-activity";
import { fetchGitHubUser } from "@/lib/github-utils";
import { getCurrentWalletAddress, shortenAddress } from "@/lib/web3-utils";

interface ProfileProps {
  username?: string | null;
}

export default function Profile({ username }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If no username is provided, check if the user is logged in
    // and redirect to their profile, or show a default profile
    const checkUserAndWallet = async () => {
      setIsLoading(true);
      
      try {
        // Check wallet connection
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);
        
        // Fetch user data
        let response;
        if (username) {
          response = await fetch(`/api/users/github/${username}`);
        } else {
          response = await fetch('/api/users/me');
        }
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Fetch repositories
          const reposResponse = await fetch(`/api/repositories/${userData.id}`);
          if (reposResponse.ok) {
            const reposData = await reposResponse.json();
            setRepositories(reposData);
          }
        } else {
          // If the profile doesn't exist or isn't found, create a placeholder
          // This is just for demo purposes - in production we'd show a "Not Found" message
          if (username) {
            // Try to fetch GitHub user data to create a placeholder
            const githubUser = await fetchGitHubUser(username);
            
            if (githubUser) {
              setUser({
                id: 0,
                username: githubUser.name || githubUser.login,
                password: "",
                githubUsername: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                bio: githubUser.bio || "",
                location: githubUser.location || "",
                website: githubUser.blog || "",
                reputation: Math.floor(Math.random() * 1000),
                walletAddress: null,
                createdAt: new Date()
              });
            } else {
              toast({
                title: "User not found",
                description: `Could not find a user with username ${username}`,
                variant: "destructive"
              });
              navigate('/explore');
            }
          } else {
            // No username and no logged in user
            toast({
              title: "Not logged in",
              description: "Please log in to view your profile",
              variant: "destructive"
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAndWallet();
  }, [username, toast, navigate]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You have unfollowed ${user?.username}`
        : `You are now following ${user?.username}`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <i className="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
          <h1 className="text-2xl font-display font-bold mb-2">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The profile you're looking for doesn't exist or isn't available.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Explore Developers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{user.username} - DevCred Profile</title>
        <meta name="description" content={`View ${user.username}'s developer profile, GitHub contributions, and NFTs on DevCred.`} />
      </Helmet>
      
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">Developer Profile</h2>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="px-6 py-8 md:p-8 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative">
                  <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                    alt={`${user.username} profile picture`} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-xs rounded-full w-8 h-8 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-display font-bold">{user.username}</h3>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 mt-2">
                        {user.githubUsername && (
                          <span className="flex items-center"><i className="fab fa-github mr-1"></i> @{user.githubUsername}</span>
                        )}
                        {user.location && (
                          <span className="flex items-center"><i className="fas fa-map-marker-alt mr-1"></i> {user.location}</span>
                        )}
                        {user.walletAddress && (
                          <div className="hidden md:flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                            <span>{shortenAddress(user.walletAddress)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        className={`${
                          isFollowing 
                            ? "bg-gray-100 dark:bg-gray-800 text-darkText dark:text-lightText" 
                            : "bg-primary hover:bg-primary/90 text-white"
                        } font-medium py-2 px-4 rounded-lg flex items-center gap-2 text-sm`}
                        onClick={handleFollow}
                      >
                        <i className={`fas ${isFollowing ? "fa-user-check" : "fa-user-plus"}`}></i>
                        <span>{isFollowing ? "Following" : "Follow"}</span>
                      </Button>
                      <Button
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-darkText dark:text-lightText font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        <i className="fas fa-share-alt"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {user.bio || "Building open source tools for developers. Passionate about blockchain technology and web performance optimization."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <UserStats user={user} />
            
            {/* NFTs and Contribution Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* NFTs Column */}
              <div className="lg:col-span-1">
                <FeaturedNFTs walletAddress={user.walletAddress || undefined} />
              </div>
              
              {/* Contribution Graph Column */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-display font-bold text-lg">Contribution Activity</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{currentYear}</span>
                    <select
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-transparent border-none cursor-pointer"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
                
                {/* Contribution Calendar */}
                {user.githubUsername && (
                  <ContributionGrid username={user.githubUsername} year={currentYear} />
                )}
                
                {/* Recent Activity */}
                <RecentActivity user={user} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
