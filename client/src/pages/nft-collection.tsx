import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alchemyService, NFTItem, NFTCollection } from "@/lib/alchemyService";

export default function NftCollectionPage() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  // State for NFTs and collections
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch NFTs when address changes
  useEffect(() => {
    if (address && isConnected) {
      fetchUserNFTs();
      fetchUserCollections();
    }
  }, [address, isConnected]);
  
  // Fetch user's NFTs from Alchemy
  const fetchUserNFTs = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const userNfts = await alchemyService.getNFTsByOwner(address);
      setNfts(userNfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your NFT collection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch user's NFT collections from Alchemy
  const fetchUserCollections = async () => {
    if (!address) return;
    
    try {
      const userCollections = await alchemyService.getCollectionsByOwner(address);
      setCollections(userCollections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };
  
  // Fetch NFTs from a specific collection
  const fetchCollectionNFTs = async (contractAddress: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setSelectedCollection(contractAddress);
    
    try {
      const collectionNfts = await alchemyService.getNFTsInCollection(contractAddress, address);
      setNfts(collectionNfts);
      setActiveTab("collection");
    } catch (error) {
      console.error("Error fetching collection NFTs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch NFTs from this collection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get rarity color based on NFT traits
  const getRarityColor = (nft: NFTItem) => {
    const rarityAttribute = nft.attributes.find(attr => 
      attr.trait_type === "Rarity" || attr.trait_type === "rarityTier" || attr.trait_type === "rarity_tier"
    );
    
    if (rarityAttribute) {
      const rarityValue = rarityAttribute.value.toLowerCase();
      if (rarityValue.includes("legendary")) return "#FF8C00";
      if (rarityValue.includes("epic")) return "#9932CC";
      if (rarityValue.includes("rare")) return "#1E90FF";
      if (rarityValue.includes("uncommon")) return "#32CD32";
      return "#808080"; // Default for common
    }
    
    // If no rarity attribute is found
    if (nft.rarity?.score && nft.rarity.score > 800) return "#FF8C00";
    if (nft.rarity?.score && nft.rarity.score > 500) return "#9932CC";
    if (nft.rarity?.score && nft.rarity.score > 200) return "#1E90FF";
    if (nft.rarity?.score && nft.rarity.score > 50) return "#32CD32";
    
    return "#808080"; // Default gray
  };
  
  return (
    <>
      <Helmet>
        <title>My NFT Collection - DevCred</title>
        <meta name="description" content="View your NFT collection powered by Alchemy" />
      </Helmet>
      
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">My NFT Collection</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse your NFT collection powered by Alchemy
              </p>
            </div>
            
            {!isConnected ? (
              <Card className="text-center p-8">
                <CardContent>
                  <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-500 mb-4">
                    Please connect your wallet to view your NFT collection
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-8">
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="all" onClick={() => fetchUserNFTs()}>All NFTs</TabsTrigger>
                        <TabsTrigger value="collection">By Collection</TabsTrigger>
                      </TabsList>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          fetchUserNFTs();
                          fetchUserCollections();
                        }}
                      >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Refresh
                      </Button>
                    </div>
                    
                    <TabsContent value="all">
                      {isLoading ? (
                        <div className="flex justify-center p-12">
                          <Spinner size="lg" />
                        </div>
                      ) : nfts.length === 0 ? (
                        <Card className="text-center p-8">
                          <CardContent>
                            <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                            <p className="text-gray-500 mb-4">
                              You don't seem to have any NFTs in your wallet yet
                            </p>
                            <Button onClick={() => window.location.href = "/mint-nft"}>
                              Mint Your First NFT
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {nfts.map((nft) => (
                            <NFTCard 
                              key={`${nft.contractAddress}-${nft.tokenId}`}
                              nft={nft}
                              rarityColor={getRarityColor(nft)}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="collection">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">Your Collections</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {collections.map((collection) => (
                            <Card 
                              key={collection.contractAddress}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedCollection === collection.contractAddress ? 'border-primary' : ''
                              }`}
                              onClick={() => fetchCollectionNFTs(collection.contractAddress)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  {collection.imageUrl ? (
                                    <img 
                                      src={collection.imageUrl} 
                                      alt={collection.name}
                                      className="w-12 h-12 rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                      <i className="fas fa-image text-gray-400"></i>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium text-sm">{collection.name}</h4>
                                    <p className="text-xs text-gray-500">{collection.totalSupply} items</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {selectedCollection ? (
                        isLoading ? (
                          <div className="flex justify-center p-12">
                            <Spinner size="lg" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {nfts.map((nft) => (
                              <NFTCard 
                                key={`${nft.contractAddress}-${nft.tokenId}`}
                                nft={nft}
                                rarityColor={getRarityColor(nft)}
                              />
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-500">Select a collection to view its NFTs</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

// NFT Card Component
interface NFTCardProps {
  nft: NFTItem;
  rarityColor: string;
}

function NFTCard({ nft, rarityColor }: NFTCardProps) {
  const getRarityName = () => {
    const rarityAttribute = nft.attributes.find(attr => 
      attr.trait_type === "Rarity" || attr.trait_type === "rarityTier" || attr.trait_type === "rarity_tier"
    );
    
    if (rarityAttribute) return rarityAttribute.value;
    
    if (nft.rarity?.score) {
      if (nft.rarity.score > 800) return "Legendary";
      if (nft.rarity.score > 500) return "Epic";
      if (nft.rarity.score > 200) return "Rare";
      if (nft.rarity.score > 50) return "Uncommon";
    }
    
    return "Common";
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <div className="relative">
        {nft.imageUrl ? (
          <img 
            src={nft.imageUrl} 
            alt={nft.name}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <i className="fas fa-image text-4xl text-gray-400"></i>
          </div>
        )}
        <Badge 
          className="absolute top-2 right-2"
          style={{ backgroundColor: rarityColor, color: "#fff" }}
        >
          {getRarityName()}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-1">{nft.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 h-10">
          {nft.description || "No description available"}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-xs">
          <span className="text-gray-500">Token ID:</span> 
          <span className="font-mono ml-1">
            {nft.tokenId.length > 8 
              ? `${nft.tokenId.substring(0, 4)}...${nft.tokenId.substring(nft.tokenId.length - 4)}` 
              : nft.tokenId
            }
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          asChild
        >
          <a 
            href={`https://basescan.org/token/${nft.contractAddress}?a=${nft.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt mr-1"></i>
            View
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 