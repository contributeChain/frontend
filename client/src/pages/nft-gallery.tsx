import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useAuth } from "@/providers/AuthProvider";

interface NftItem {
  id: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
  repoName: string;
  mintedAt: string;
  transactionHash: string;
}

export default function NftGalleryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  const [nfts, setNfts] = useState<NftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchNfts = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with a real API call
        // For now, we'll use mock data
        const mockNfts: NftItem[] = [
          {
            id: 1,
            tokenId: "1",
            name: "React Contributor",
            description: "Contribution to react-router repository",
            imageUrl: "https://placehold.co/300x300/1E90FF/FFFFFF?text=React",
            rarity: "Rare",
            repoName: "facebook/react",
            mintedAt: new Date().toISOString(),
            transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          },
          {
            id: 2,
            tokenId: "2",
            name: "Web3.js Expert",
            description: "Contribution to web3.js repository",
            imageUrl: "https://placehold.co/300x300/9932CC/FFFFFF?text=Web3",
            rarity: "Epic",
            repoName: "ethereum/web3.js",
            mintedAt: new Date().toISOString(),
            transactionHash: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef"
          },
          {
            id: 3,
            tokenId: "3",
            name: "Solidity Developer",
            description: "Contribution to solidity repository",
            imageUrl: "https://placehold.co/300x300/FF8C00/FFFFFF?text=Solidity",
            rarity: "Legendary",
            repoName: "ethereum/solidity",
            mintedAt: new Date().toISOString(),
            transactionHash: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef"
          }
        ];
        
        setNfts(mockNfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        toast({
          title: "Error",
          description: "Failed to load NFTs",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNfts();
  }, [toast]);
  
  // Get color class based on rarity
  const getRarityColorClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-orange-500/10 text-orange-500';
      case 'epic':
        return 'bg-purple-500/10 text-purple-500';
      case 'rare':
        return 'bg-blue-500/10 text-blue-500';
      case 'uncommon':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter NFTs based on active tab
  const filteredNfts = nfts.filter(nft => {
    if (activeTab === 'all') return true;
    return nft.rarity.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <>
      <Helmet>
        <title>NFT Gallery - DevCred</title>
        <meta name="description" content="View your on-chain credentials and NFTs" />
      </Helmet>
      
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">NFT Gallery</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your on-chain credentials and achievements
              </p>
            </div>
            
            <div className="mb-8">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All NFTs</TabsTrigger>
                  <TabsTrigger value="legendary">Legendary</TabsTrigger>
                  <TabsTrigger value="epic">Epic</TabsTrigger>
                  <TabsTrigger value="rare">Rare</TabsTrigger>
                  <TabsTrigger value="uncommon">Uncommon</TabsTrigger>
                  <TabsTrigger value="common">Common</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                          <Skeleton className="h-48 w-full" />
                          <CardContent className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredNfts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredNfts.map((nft) => (
                        <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img 
                              src={nft.imageUrl} 
                              alt={nft.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${getRarityColorClass(nft.rarity)}`}>
                              {nft.rarity}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-display font-bold text-lg mb-1">{nft.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {nft.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{nft.repoName}</span>
                              <span>Minted {formatDate(nft.mintedAt)}</span>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://basescan.org/tx/${nft.transactionHash}`, '_blank')}
                                className="text-xs"
                              >
                                View on BaseScan
                              </Button>
                              <Button 
                                size="sm"
                                className="text-xs"
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-award text-4xl text-gray-400 mb-4"></i>
                      <h3 className="text-xl font-display font-medium mb-2">No NFTs Found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You don't have any NFTs in this category yet.
                      </p>
                      <Button onClick={() => navigate("/mint-nft")}>
                        Mint Your First NFT
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
} 