import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ContributionGrid from "@/components/contribution-grid";
import UserStats from "@/components/profile/user-stats";
import FeaturedNFTs from "@/components/profile/featured-nfts";
import RecentActivity from "@/components/profile/recent-activity";
import { fetchGitHubUser } from "@/lib/github-utils";
import { getCurrentWalletAddress, shortenAddress } from "@/lib/web3-utils";
import { getUserByGitHubUsername, getRepositoriesByUserId, addUserToCollection, Repository, User } from "@/lib/grove-service";
import { useAuth } from "@/hooks/use-auth";

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
  const { user: authUser, isAuthenticated } = useAuth();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setNotFound(false);
      
      try {
        // Check wallet connection
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);
        
        // CASE 1: Viewing a specific user's profile by username
        if (username) {
          console.log(`Loading profile for GitHub username: ${username}`);
          const userData = await getUserByGitHubUsername(username);
          
          if (userData) {
            // User found in Grove
            setUser(userData);
            
            // Fetch repositories
            if (userData.id) {
              const reposData = await getRepositoriesByUserId(userData.id);
              setRepositories(reposData);
            }
          } else {
            // User not found in Grove, try to fetch from GitHub directly
            console.log(`User not found in Grove, fetching from GitHub: ${username}`);
            const githubUser = await fetchGitHubUser(username);
            
            if (githubUser) {
              // Create a placeholder user from GitHub data
              const placeholderUser: User = {
                id: Date.now(),
                username: githubUser.name || githubUser.login,
                githubUsername: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                reputation: Math.floor(Math.random() * 1000),
                password: "",
                walletAddress: null,
                bio: githubUser.bio || null,
                location: githubUser.location || null,
                website: githubUser.blog || githubUser.html_url || null,
                createdAt: new Date()
              };
              
              setUser(placeholderUser);
              
              // If we're authenticated, we could save this user to Grove
              if (isAuthenticated && address && address.startsWith('0x')) {
                console.log('Saving GitHub user to Grove collection');
                await addUserToCollection(placeholderUser, address as `0x${string}`);
              }
            } else {
              // User not found on GitHub either
              console.log(`User not found: ${username}`);
              setNotFound(true);
              toast({
                title: "User not found",
                description: `Could not find a user with username ${username}`,
                variant: "destructive"
              });
            }
          }
        } 
        // CASE 2: Viewing the current authenticated user's profile
        else if (isAuthenticated && authUser) {
          console.log('Loading authenticated user profile');
          
          // If the user has a GitHub account linked
          if (authUser.githubUser) {
            const githubUsername = authUser.githubUser.login;
            console.log(`Authenticated user has GitHub: ${githubUsername}`);
            
            // Try to get user from Grove by GitHub username
            let userData = await getUserByGitHubUsername(githubUsername);
            
            if (userData) {
              // User found in Grove
              setUser(userData);
              
              // Fetch repositories
              if (userData.id) {
                const reposData = await getRepositoriesByUserId(userData.id);
                setRepositories(reposData);
              }
            } else {
              // User not in Grove yet, create from authUser
              console.log('Creating user profile from authenticated GitHub user');
              const newUser: User = {
                id: Date.now(),
                username: authUser.githubUser.name || authUser.githubUser.login,
                githubUsername: authUser.githubUser.login,
                avatarUrl: authUser.githubUser.avatar_url,
                reputation: 0,
                password: "",
                walletAddress: authUser.walletAddress,
                bio: authUser.githubUser.bio || null,
                location: (authUser.githubUser as any).location || null,
                website: (authUser.githubUser as any).blog || authUser.githubUser.html_url || null,
                createdAt: new Date()
              };
              
              setUser(newUser);
              
              // Save to Grove if we have a valid wallet address
              if (authUser.walletAddress && authUser.walletAddress.startsWith('0x')) {
                console.log('Saving authenticated user to Grove collection');
                await addUserToCollection(newUser, authUser.walletAddress as `0x${string}`);
              }
            }
          } else {
            // Authenticated but no GitHub account linked
            console.log('Authenticated user has no GitHub account linked');
            toast({
              title: "GitHub account not linked",
              description: "Please link your GitHub account to view your profile",
            });
            
            // Create minimal user profile from wallet
            const minimalUser: User = {
              id: Date.now(),
              username: `user_${Date.now()}`,
              githubUsername: null,
              avatarUrl: null,
              reputation: 0,
              password: "",
              walletAddress: authUser.walletAddress,
              bio: null,
              location: null,
              website: null,
              createdAt: new Date()
            };
            
            setUser(minimalUser);
          }
        } 
        // CASE 3: Not authenticated and no username provided
        else {
          console.log('Not authenticated and no username provided');
          // Don't redirect, just set user to null and show connect profile component
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, [username, toast, navigate, authUser, isAuthenticated]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You have unfollowed ${user?.username}`
        : `You are now following ${user?.username}`,
    });
  };

  // Loading state
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

  // User not found state
  if (notFound || (username && !user)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <i className="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
          <h1 className="text-2xl font-display font-bold mb-2">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The profile for <span className="font-semibold">{username}</span> doesn't exist or isn't available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/explore')} variant="outline">
              Explore Developers
            </Button>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connect profile state (no username provided and not authenticated)
  if (!username && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <i className="fas fa-user-circle text-4xl text-primary mb-4"></i>
          <h1 className="text-2xl font-display font-bold mb-2">Connect Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your wallet and link your GitHub account to view your developer profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/link-github')} variant="outline">
              <i className="fab fa-github mr-2"></i> Link GitHub
            </Button>
            <Button onClick={() => navigate('/')}>
              <i className="fas fa-wallet mr-2"></i> Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Regular profile view
  if (!user) {
    return null; // This shouldn't happen, but just in case
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
