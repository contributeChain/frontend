import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NFTCard from "@/components/nft-card";
import { useToast } from "@/hooks/use-toast";
import { fetchUsers, fetchNFTs, type User, type NFT } from "@/lib/grove-service";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [developers, setDevelopers] = useState<User[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch developers and NFTs from Grove
        const [usersData, nftsData] = await Promise.all([
          fetchUsers(),
          fetchNFTs()
        ]);
        
        setDevelopers(usersData);
        setNfts(nftsData);
      } catch (error) {
        console.error("Error fetching explore data:", error);
        toast({
          title: "Error",
          description: "Failed to load data from Grove. Please try again later.",
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
      toast({
        title: "Searching",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

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
                {developers.length > 0 ? (
                  developers.map((developer) => (
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
                  ))
                ) : (
                  <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                    <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-display font-bold mb-2">No developers found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We couldn't find any developers. Please try again later.
                    </p>
                  </div>
                )}
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
                
                {nfts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {nfts
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
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                    <i className="fas fa-image text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-display font-bold mb-2">No NFTs found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We couldn't find any NFTs. Please try again later.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
