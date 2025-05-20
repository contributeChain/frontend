import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { ContributionStats, ContributionStatsData } from "@/components/nft/ContributionStats";
import { NftPreviewCard } from "@/components/nft/NftPreviewCard";
import { getUserProfile } from "@/lib/githubClient";
import { 
  createNftMetadata, 
  generateNftImageUrl, 
  mintContributionNft 
} from "@/lib/nft-service";

export default function MintNftPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  
  // Repository info
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  
  // GitHub user info
  const [contributor, setContributor] = useState<string | undefined>(
    user?.githubUser?.login || undefined
  );
  const [contributorData, setContributorData] = useState<any>(null);
  
  // Contribution stats
  const [contributionStats, setContributionStats] = useState<ContributionStatsData | null>(null);
  
  // NFT metadata
  const [nftImageUrl, setNftImageUrl] = useState<string>("");
  const [metadataUri, setMetadataUri] = useState<string>("");
  
  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingSuccess, setMintingSuccess] = useState(false);
  const [mintingError, setMintingError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get('repo');
    
    if (repoParam) {
      setRepoUrl(repoParam);
      handleRepositoryUrlChange(repoParam);
    }
  }, []);
  
  // Parse repository URL into owner and repo
  const handleRepositoryUrlChange = (url: string) => {
    setRepoUrl(url);
    
    // Extract owner and repo from URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match && match.length === 3) {
      setOwner(match[1]);
      setRepo(match[2].replace(/\.git$/, ""));
    } else {
      // Try owner/repo format
      const simpleMatch = url.match(/^([^\/]+)\/([^\/]+)$/);
      if (simpleMatch && simpleMatch.length === 3) {
        setOwner(simpleMatch[1]);
        setRepo(simpleMatch[2].replace(/\.git$/, ""));
      }
    }
  };
  
  // Fetch contributor data when contributor changes
  useEffect(() => {
    const fetchContributorData = async () => {
      if (!contributor) return;
      
      try {
        const userData = await getUserProfile(contributor);
        setContributorData(userData);
      } catch (error) {
        console.error("Error fetching contributor data:", error);
      }
    };
    
    fetchContributorData();
  }, [contributor]);
  
  // Handle contribution stats loaded
  const handleStatsLoaded = (stats: ContributionStatsData) => {
    setContributionStats(stats);
    
    // Generate NFT image URL
    if (contributorData && owner && repo) {
      const imageUrl = generateNftImageUrl(
        repo,
        contributorData.name || contributorData.login,
        stats.score,
        { 
          name: stats.score >= 1000 ? "Legendary" :
                stats.score >= 500 ? "Epic" :
                stats.score >= 200 ? "Rare" :
                stats.score >= 50 ? "Uncommon" : "Common",
          color: stats.score >= 1000 ? "#FF8C00" :
                 stats.score >= 500 ? "#9932CC" :
                 stats.score >= 200 ? "#1E90FF" :
                 stats.score >= 50 ? "#32CD32" : "#808080"
        }
      );
      setNftImageUrl(imageUrl);
    }
  };
  
  // Generate NFT metadata
  const handleGenerateNft = async () => {
    if (!contributorData || !contributionStats || !address || !owner || !repo) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required information is provided",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setMintingError(null);
    
    try {
      const result = await createNftMetadata(
        repo,
        `https://github.com/${owner}/${repo}`,
        {
          name: contributorData.name || "",
          login: contributorData.login,
          avatar_url: contributorData.avatar_url
        },
        contributionStats,
        address as `0x${string}`
      );
      
      setMetadataUri(result.uploadResult.uri);
      
      toast({
        title: "NFT Metadata Generated",
        description: "Your NFT metadata has been created and stored on Grove"
      });
    } catch (error: any) {
      console.error("Error generating NFT metadata:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate NFT metadata",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Mint NFT
  const handleMintNft = async () => {
    if (!address || !metadataUri || !contributionStats) {
      toast({
        title: "Missing Information",
        description: "Please generate NFT metadata first",
        variant: "destructive"
      });
      return;
    }
    
    setIsMinting(true);
    setMintingError(null);
    
    try {
      const result = await mintContributionNft(
        null, // We don't need provider, using wagmi hooks internally
        address as `0x${string}`,
        `https://github.com/${owner}/${repo}`,
        contributionStats.score,
        metadataUri
      );
      
      if (result.success) {
        setMintingSuccess(true);
        if (result.transactionHash) {
          setTransactionHash(result.transactionHash);
        }
        
        toast({
          title: "NFT Minted Successfully",
          description: "Your contribution NFT has been minted!"
        });
      } else {
        setMintingError(result.error || "Failed to mint NFT");
        
        toast({
          title: "Minting Failed",
          description: result.error || "Failed to mint NFT",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      setMintingError(error.message || "Failed to mint NFT");
      
      toast({
        title: "Minting Error",
        description: error.message || "An error occurred while minting your NFT",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  // Check if can proceed to minting
  const canMint = contributorData && contributionStats && metadataUri && address && !isMinting && !mintingSuccess;
  
  // Check if all required information is available
  const hasRequiredInfo = owner && repo && contributorData;
  
  return (
    <>
      <Helmet>
        <title>Mint Contribution NFT - DevCred</title>
        <meta name="description" content="Mint an NFT for your GitHub contributions" />
      </Helmet>
      
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Mint Contribution NFT</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create an on-chain credential for your GitHub contributions
              </p>
            </div>
            
            {!isConnected && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Please connect your wallet to mint NFTs.
                </AlertDescription>
              </Alert>
            )}
            
            {isConnected && !user?.githubUser && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  You need to link your GitHub account before minting NFTs.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-2"
                    onClick={() => navigate("/link-github")}
                  >
                    Link GitHub Account
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-8">
              {/* Step 1: Repository Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Repository Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="repo-url">GitHub Repository URL</Label>
                      <Input
                        id="repo-url"
                        placeholder="https://github.com/owner/repo or owner/repo"
                        value={repoUrl}
                        onChange={(e) => handleRepositoryUrlChange(e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the URL of the GitHub repository you contributed to
                      </p>
                    </div>
                    
                    {owner && repo && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium">Repository: {owner}/{repo}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Step 2: Contributor Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Contributor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contributor">GitHub Username</Label>
                      <Input
                        id="contributor"
                        placeholder="GitHub username"
                        value={contributor || ""}
                        onChange={(e) => setContributor(e.target.value || undefined)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the GitHub username of the contributor (defaults to your linked GitHub account)
                      </p>
                    </div>
                    
                    {contributorData && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                        <img 
                          src={contributorData.avatar_url} 
                          alt={contributorData.login}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{contributorData.name || contributorData.login}</p>
                          <p className="text-sm text-gray-500">@{contributorData.login}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Step 3: Contribution Statistics */}
              {hasRequiredInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Contribution Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContributionStats 
                      owner={owner}
                      repo={repo}
                      contributor={contributor}
                      onStatsLoaded={handleStatsLoaded}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Step 4: Generate and Mint NFT */}
              {contributionStats && contributorData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Generate and Mint NFT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <NftPreviewCard
                          repositoryName={`${owner}/${repo}`}
                          repositoryUrl={`https://github.com/${owner}/${repo}`}
                          contributor={contributorData}
                          contributionStats={contributionStats}
                          contributionScore={contributionStats.score}
                          imageUrl={nftImageUrl}
                          isMinting={isMinting}
                          onMint={metadataUri ? handleMintNft : handleGenerateNft}
                        />
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">NFT Details</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            This NFT represents your contributions to the {owner}/{repo} repository.
                            It will be permanently stored on the blockchain as proof of your work.
                          </p>
                          
                          <div className="space-y-4">
                            {!metadataUri && (
                              <Button 
                                onClick={handleGenerateNft} 
                                disabled={isGenerating || !contributionStats || !address}
                                className="w-full"
                              >
                                {isGenerating ? (
                                  <>
                                    <Spinner size="sm" className="mr-2" />
                                    Generating NFT Metadata...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-file-code mr-2"></i>
                                    Generate NFT Metadata
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {metadataUri && !mintingSuccess && (
                              <Button 
                                onClick={handleMintNft} 
                                disabled={isMinting || !address}
                                className="w-full"
                              >
                                {isMinting ? (
                                  <>
                                    <Spinner size="sm" className="mr-2" />
                                    Minting NFT...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-award mr-2"></i>
                                    Mint NFT
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {mintingError && (
                              <Alert variant="destructive">
                                <AlertDescription>{mintingError}</AlertDescription>
                              </Alert>
                            )}
                            
                            {mintingSuccess && (
                              <div className="space-y-4">
                                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
                                  <AlertDescription>
                                    NFT minted successfully! Your contribution is now permanently recorded on the blockchain.
                                  </AlertDescription>
                                </Alert>
                                
                                {transactionHash && (
                                  <div className="text-sm">
                                    <p className="font-medium mb-1">Transaction Hash:</p>
                                    <a 
                                      href={`https://basescan.org/tx/${transactionHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline break-all"
                                    >
                                      {transactionHash}
                                    </a>
                                  </div>
                                )}
                                
                                <div className="flex gap-4">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => navigate("/repositories")}
                                    className="flex-1"
                                  >
                                    View Repositories
                                  </Button>
                                  <Button 
                                    onClick={() => navigate("/profile")}
                                    className="flex-1"
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
} 