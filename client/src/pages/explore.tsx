import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Nft } from "@shared/schema";
import NFTCard from "@/components/nft-card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [developers, setDevelopers] = useState<User[]>([]);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch developers and NFTs
        const [developersResponse, nftsResponse] = await Promise.all([
          fetch('/api/developers'),
          fetch('/api/nfts/featured')
        ]);
        
        if (developersResponse.ok) {
          const developersData = await developersResponse.json();
          setDevelopers(developersData);
        } else {
          toast({
            title: "Error",
            description: "Failed to load developers data",
            variant: "destructive"
          });
        }
        
        if (nftsResponse.ok) {
          const nftsData = await nftsResponse.json();
          setNfts(nftsData);
        } else {
          toast({
            title: "Error",
            description: "Failed to load NFTs data",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching explore data:", error);
        toast({
          title: "Error",
          description: "Failed to load explore data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExploreData();
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Filter the current data based on search query
      // or navigate to a search page
      toast({
        title: "Searching",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Mock/placeholder data if API failed
  const ensureDevelopers = developers.length > 0 ? developers : [
    {
      id: 1,
      username: "Sarah Chen",
      githubUsername: "sarahcodes",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      password: "",
      reputation: 876,
      walletAddress: "0x3a2...8f91",
      bio: "Building open source tools for developers.",
      location: "San Francisco",
      website: "https://sarah.dev",
      createdAt: new Date()
    },
    {
      id: 2,
      username: "Alex Rivera",
      githubUsername: "alexdev",
      avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      password: "",
      reputation: 742,
      walletAddress: "0x7b4...2f6e",
      bio: "Full stack developer passionate about Web3.",
      location: "New York",
      website: "https://alexdev.io",
      createdAt: new Date()
    },
    {
      id: 3,
      username: "Maya Johnson",
      githubUsername: "mayacodes",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      password: "",
      reputation: 524,
      walletAddress: "0x3d5...9f21",
      bio: "Frontend developer and UI/UX enthusiast.",
      location: "Berlin",
      website: "https://maya.design",
      createdAt: new Date()
    }
  ];

  // Ensure we have NFTs data
  const ensureNFTs = nfts.length > 0 ? nfts : [
    {
      id: 1,
      userId: 1,
      tokenId: "COMMIT-7834",
      name: "React Component Library",
      description: "Major contribution to open source library",
      imageUrl: "",
      rarity: "rare",
      repoName: "react-ui-library",
      mintedAt: new Date(2023, 4, 15),
      transactionHash: "0x3a28fb7c9472d7eb05f5d80e2c8c3c059befc9245bded0aef5244672c1b7bc5d",
      metadata: { type: "commit", language: "javascript" }
    },
    {
      id: 2,
      userId: 2,
      tokenId: "STREAK-30",
      name: "30 Day Commit Streak",
      description: "Consistent contributions for 30 days",
      imageUrl: "",
      rarity: "epic",
      mintedAt: new Date(2023, 5, 20),
      transactionHash: "0x7b42bf6e9c3a7eb8f5d8bfd645ab21de9f7c8b94e3d5f9b2a1b3c4d5e6f7g8h9",
      metadata: { type: "streak", days: 30 }
    },
    {
      id: 3,
      userId: 1,
      tokenId: "PR-MERGE-42",
      name: "Major Feature Merge",
      description: "Pull request with significant feature addition",
      imageUrl: "",
      rarity: "common",
      repoName: "blockchain-auth-system",
      mintedAt: new Date(2023, 6, 10),
      transactionHash: "0x3d59f21a8c7d6e9b2a1b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4",
      metadata: { type: "pull-request", additions: 1240, deletions: 345 }
    },
    {
      id: 4,
      userId: 3,
      tokenId: "FIRST-COMMIT",
      name: "First Contribution",
      description: "First GitHub contribution minted as NFT",
      imageUrl: "",
      rarity: "common",
      repoName: "javascript-utils",
      mintedAt: new Date(2023, 7, 5),
      transactionHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7",
      metadata: { type: "first-commit", repository: "javascript-utils" }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Explore Developers & NFTs - DevCred</title>
        <meta name="description" content="Discover developers, repositories, and NFTs on DevCred. Explore the world of on-chain developer credentials." />
      </Helmet>
      
      <div className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Explore DevCred</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Discover developers, their contributions, and the NFTs they've earned through their open source work.
          </p>
        </div>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Input 
                type="text"
                placeholder="Search developers, repositories, or NFTs..."
                className="w-full bg-white dark:bg-gray-800 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        <Tabs defaultValue="developers" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="developers">Developers</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="developers">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ensureDevelopers.map((developer) => (
                  <Card 
                    key={developer.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}&background=random`} 
                            alt={`${developer.username} profile picture`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                          />
                          <div>
                            <h3 className="font-display font-bold text-lg">{developer.username}</h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              {developer.githubUsername && (
                                <span className="flex items-center"><i className="fab fa-github mr-1"></i> @{developer.githubUsername}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {developer.bio}
                        </p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                              <i className="fas fa-trophy text-xs"></i>
                              <span>{developer.reputation} Rep</span>
                            </div>
                            <div className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs">
                              {developer.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex justify-end">
                        <Button 
                          variant="ghost" 
                          className="text-primary"
                          onClick={() => navigate(`/profile/${developer.githubUsername}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nfts">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <Button 
                    variant={selectedFilter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange("all")}
                    className="rounded-full"
                  >
                    All
                  </Button>
                  <Button 
                    variant={selectedFilter === "common" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange("common")}
                    className="rounded-full"
                  >
                    Common
                  </Button>
                  <Button 
                    variant={selectedFilter === "rare" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange("rare")}
                    className="rounded-full"
                  >
                    Rare
                  </Button>
                  <Button 
                    variant={selectedFilter === "epic" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange("epic")}
                    className="rounded-full"
                  >
                    Epic
                  </Button>
                  <Button 
                    variant={selectedFilter === "legendary" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange("legendary")}
                    className="rounded-full"
                  >
                    Legendary
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ensureNFTs
                    .filter(nft => selectedFilter === "all" || nft.rarity === selectedFilter)
                    .map(nft => (
                      <NFTCard 
                        key={nft.id} 
                        nft={{
                          id: nft.id,
                          tokenId: nft.tokenId || "",
                          name: nft.name,
                          description: nft.description || "",
                          imageUrl: nft.imageUrl || "",
                          rarity: (nft.rarity as "common" | "rare" | "epic" | "legendary") || "common",
                          repoName: nft.repoName,
                          mintedAt: new Date(nft.mintedAt),
                          transactionHash: nft.transactionHash,
                          metadata: nft.metadata
                        }}
                        onClick={() => navigate(`/nft/${nft.id}`)}
                      />
                    ))
                  }
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
