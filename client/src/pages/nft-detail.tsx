import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useToast } from "@/hooks/use-toast";
import { formatDate, shortenAddress } from "@/lib/utils";
import { fetchNFTs, NFT } from "@/lib/grove-service";
import { getRepositoryById, Repository } from "@/lib/grove-service";
import { Badge } from "@/components/ui/badge";

interface NFTDetailPageProps {
  params: {
    id: string;
    repoId?: string;
  };
}

export default function NFTDetailPage({ params }: NFTDetailPageProps) {
  const { id, repoId } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [nft, setNft] = useState<NFT | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Get related repository if repoId is provided
  useEffect(() => {
    const fetchRepositoryData = async () => {
      if (!repoId) return;
      
      try {
        const repoData = await getRepositoryById(parseInt(repoId));
        if (repoData) {
          setRepository(repoData);
        }
      } catch (error) {
        console.error("Error fetching repository:", error);
      }
    };
    
    fetchRepositoryData();
  }, [repoId]);

  // Fetch NFT data
  useEffect(() => {
    const fetchNFTData = async () => {
      setIsLoading(true);
      setNotFound(false);
      
      try {
        // Fetch all NFTs and find the one with matching ID
        const allNfts = await fetchNFTs();
        const nftId = parseInt(id);
        
        if (isNaN(nftId)) {
          setNotFound(true);
          return;
        }
        
        const foundNft = allNfts.find(nft => nft.id === nftId);
        
        if (foundNft) {
          setNft(foundNft);
        } else {
          setNotFound(true);
          toast({
            title: "NFT not found",
            description: `The NFT with ID ${id} could not be found.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching NFT:", error);
        toast({
          title: "Error",
          description: "Failed to load NFT details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFTData();
  }, [id, toast]);

  // Get appropriate color class based on rarity
  const getRarityColor = () => {
    if (!nft) return "text-primary";
    
    const rarityLower = nft.rarity.toLowerCase();
    
    switch (rarityLower) {
      case "common":
        return "text-primary";
      case "rare":
        return "text-secondary";
      case "epic":
        return "text-accent";
      case "legendary":
        return "text-amber-500";
      default:
        return "text-primary";
    }
  };
  
  // Get appropriate icon based on rarity
  const getRarityIcon = () => {
    if (!nft) return "fa-check-circle";
    
    const rarityLower = nft.rarity.toLowerCase();
    
    switch (rarityLower) {
      case "common":
        return "fa-check-circle";
      case "rare":
        return "fa-gem";
      case "epic":
        return "fa-trophy";
      case "legendary":
        return "fa-crown";
      default:
        return "fa-check-circle";
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        </Container>
      </section>
    );
  }

  if (notFound || !nft) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h2 className="text-xl font-display font-bold mb-2">NFT Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The NFT with ID <span className="font-semibold">{id}</span> doesn't exist or you don't have permission to view it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/nft-collection")} variant="outline">
                  <i className="fas fa-images mr-2"></i> Browse NFTs
                </Button>
                <Button onClick={() => navigate("/mint-nft")}>
                  <i className="fas fa-plus mr-2"></i> Mint NFT
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{nft.name} - NFT Details - Lens Alchemy</title>
        <meta name="description" content={nft.description} />
      </Helmet>

      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  onClick={() => navigate(repoId ? `/repositories/${repoId}` : "/nft-collection")}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  {repoId ? "Back to Repository" : "Back to Collection"}
                </Button>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {nft.name}
                </h1>
                {nft.repoName && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    From repository: <span className="font-medium">{nft.repoName}</span>
                  </p>
                )}
              </div>
              
              <div className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 ${getRarityColor()} bg-opacity-10`}>
                <i className={`fas ${getRarityIcon()}`}></i>
                <span className="capitalize font-medium">{nft.rarity}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md mb-6">
                  {nft.imageUrl ? (
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name}
                      className="w-full aspect-square object-contain"
                    />
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <div className="text-6xl text-primary">
                        <i className="fas fa-code"></i>
                      </div>
                    </div>
                  )}
                </div>
                
                {nft.transactionHash && (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-display font-bold mb-4">Blockchain Details</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Minted On</p>
                          <p>{formatDate(nft.mintedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                          <a 
                            href={`https://explorer.lens.xyz/tx/${nft.transactionHash}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all flex items-center gap-2"
                          >
                            {shortenAddress(nft.transactionHash)}
                            <i className="fas fa-external-link-alt text-xs"></i>
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Token ID</p>
                          <p className="font-mono">{nft.tokenId}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-display font-bold mb-4">NFT Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p>{nft.description}</p>
                      </div>
                      
                      {repository && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Repository</p>
                          <div className="flex items-center">
                            <a 
                              href={`/repositories/${repository.id}`}
                              className="text-primary hover:underline flex items-center gap-2"
                            >
                              <i className="fas fa-code-branch"></i>
                              {repository.name}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {nft.metadata && Object.keys(nft.metadata).length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Attributes</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(nft.metadata).map(([key, value]) => {
                              if (key === 'tags' || Array.isArray(value)) return null;
                              return (
                                <Badge key={key} variant="outline" className="px-3 py-1">
                                  <span className="text-gray-500 mr-1">{key}:</span> {value.toString()}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {nft.metadata?.tags && Array.isArray(nft.metadata.tags) && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {nft.metadata.tags.map((tag: any, index: number) => (
                              <Badge 
                                key={index} 
                                style={{
                                  backgroundColor: tag.color || 'var(--primary)',
                                  color: 'white'
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex flex-col gap-4">
                  <Button className="w-full" size="lg">
                    <i className="fab fa-twitter mr-2"></i>
                    Share on Twitter
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <i className="fas fa-share-alt mr-2"></i>
                      Share
                    </Button>
                    <Button variant="secondary">
                      <i className="fas fa-ellipsis-h mr-2"></i>
                      More Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
} 