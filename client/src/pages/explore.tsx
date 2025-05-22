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
  
  // Pagination states
  const [currentDevPage, setCurrentDevPage] = useState(1);
  const [currentNftPage, setCurrentNftPage] = useState(1);
  const itemsPerPage = 9; // For developers
  const nftsPerPage = 15; // For NFTs
  
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

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentNftPage(1);
  }, [selectedFilter]);

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
  
  // Pagination functions
  const indexOfLastDev = currentDevPage * itemsPerPage;
  const indexOfFirstDev = indexOfLastDev - itemsPerPage;
  const currentDevs = developers.slice(indexOfFirstDev, indexOfLastDev);
  const totalDevPages = Math.ceil(developers.length / itemsPerPage);
  
  // Filter NFTs first, then paginate
  const filteredNfts = nfts.filter(nft => selectedFilter === "all" || nft.rarity === selectedFilter);
  const indexOfLastNft = currentNftPage * nftsPerPage;
  const indexOfFirstNft = indexOfLastNft - nftsPerPage;
  const currentNfts = filteredNfts.slice(indexOfFirstNft, indexOfLastNft);
  const totalNftPages = Math.ceil(filteredNfts.length / nftsPerPage);
  
  // Pagination UI component
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    setPage 
  }: { 
    currentPage: number; 
    totalPages: number; 
    setPage: (page: number) => void 
  }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-8 gap-2">
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className="h-8 w-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Button>
        
        <div className="flex items-center text-sm">
          Page {currentPage} of {totalPages}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="h-8 w-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Explore Developers & NFTs - DevCred</title>
        <meta name="description" content="Discover developers, repositories, and NFTs on DevCred. Explore the world of on-chain developer credentials." />
      </Helmet>
      
      <div className="py-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
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
                className="absolute left-3 top-2.5 text-gray-400"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentDevs.length > 0 ? (
                    currentDevs.map((developer) => (
                      <Card 
                        key={developer.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                      >
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="p-4 sm:p-6 flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                              <img 
                                src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}&background=random`} 
                                alt={`${developer.username} profile picture`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                              />
                              <div>
                                <h3 className="font-display font-bold text-lg truncate">{developer.username}</h3>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  {developer.githubUsername && (
                                    <span className="flex items-center truncate"><svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> @{developer.githubUsername}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                              {developer.bio || "No bio available"}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 text-sm">
                              <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                  <path d="M4 22h16"></path>
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                </svg>
                                <span>{developer.reputation} Rep</span>
                              </div>
                              {developer.location && (
                                <div className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs flex items-center gap-1">
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  <span>{developer.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex justify-end mt-auto">
                            <Button 
                              variant="ghost" 
                              className="text-primary w-full sm:w-auto"
                              onClick={() => navigate(`/profile/${developer.githubUsername}`)}
                            >
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mx-auto text-gray-400 mb-4"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <h3 className="text-xl font-display font-bold mb-2">No developers found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        We couldn't find any developers. Please try again later.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Pagination for developers */}
                <Pagination 
                  currentPage={currentDevPage} 
                  totalPages={totalDevPages} 
                  setPage={setCurrentDevPage} 
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="nfts">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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
                
                {filteredNfts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {currentNfts.map(nft => (
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
                          onClick={() => navigate(`/nfts/${nft.id}`)}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination for NFTs */}
                    <Pagination 
                      currentPage={currentNftPage} 
                      totalPages={totalNftPages} 
                      setPage={setCurrentNftPage} 
                    />
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mx-auto text-gray-400 mb-4"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    <h3 className="text-xl font-display font-bold mb-2">No NFTs found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We couldn't find any NFTs matching your filter. Please try a different filter.
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
