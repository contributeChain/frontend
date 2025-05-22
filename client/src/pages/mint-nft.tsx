import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useWalletClient } from "wagmi";
import { useConnections } from "@/hooks/use-connections";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { ContributionStats, ContributionStatsData } from "@/components/nft/ContributionStats";
import { NftPreviewCard } from "@/components/nft/NftPreviewCard";
import { getUserProfile } from "@/lib/githubClient";
import { 
  createNftMetadata, 
  mintContributionNft 
} from "@/lib/nft-service";
import { 
  addNFTToCollection, 
  updateRepositoryNftCount, 
  updateUserAfterMinting, 
  addActivityToCollection, 
  getUserByWalletAddress,
  hasUserMintedNFTForRepo
} from "@/lib/grove-service";
import { alchemyService } from "@/lib/alchemyService";
import { useGrove } from "@/hooks/use-grove";
import confetti from "canvas-confetti";


// Define the steps of the NFT minting process
enum MintStep {
  REPOSITORY_INFO = 0,
  CONTRIBUTOR_INFO = 1,
  CONTRIBUTION_STATS = 2,
  GENERATE_METADATA = 3,
  MINT_NFT = 4,
  COMPLETE = 5
}

export default function MintNftPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { address, isConnected, isGitHubAuthenticated, user } = useConnections();
  const { data: walletClient } = useWalletClient();
  const { refreshGroveDataWithFetch } = useGrove();
  
  // Current step in the minting process
  const [currentStep, setCurrentStep] = useState<MintStep>(MintStep.REPOSITORY_INFO);
  
  // Repository info
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isValidRepo, setIsValidRepo] = useState(false);
  const [hasAlreadyMinted, setHasAlreadyMinted] = useState(false);
  
  // GitHub user info
  const [contributor, setContributor] = useState<string | undefined>(
    user?.githubUser?.login || undefined
  );
  const [contributorData, setContributorData] = useState<any>(null);
  const [isLoadingContributor, setIsLoadingContributor] = useState(false);
  const [contributorError, setContributorError] = useState<string | null>(null);
  
  // Contribution stats
  const [contributionStats, setContributionStats] = useState<ContributionStatsData | null>(null);
  
  // NFT metadata
  const [nftImageUrl, setNftImageUrl] = useState<string>("");
  const [metadataUri, setMetadataUri] = useState<string>("");
  const [rarityTier, setRarityTier] = useState<{ name: string; color: string } | null>(null);
  
  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isAddingToGrove, setIsAddingToGrove] = useState(false);
  const [mintingSuccess, setMintingSuccess] = useState(false);
  const [mintingError, setMintingError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  // Add a ref to ensure confetti only fires once
  const [confettiFired, setConfettiFired] = useState(false);

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
  const handleRepositoryUrlChange = async (url: string) => {
    setRepoUrl(url);
    setIsValidRepo(false);
    setHasAlreadyMinted(false);
    
    // Extract owner and repo from URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    let ownerVal = "";
    let repoVal = "";
    
    if (match && match.length === 3) {
      ownerVal = match[1];
      repoVal = match[2].replace(/\.git$/, "");
      setOwner(ownerVal);
      setRepo(repoVal);
      setIsValidRepo(true);
    } else {
      // Try owner/repo format
      const simpleMatch = url.match(/^([^\/]+)\/([^\/]+)$/);
      if (simpleMatch && simpleMatch.length === 3) {
        ownerVal = simpleMatch[1];
        repoVal = simpleMatch[2].replace(/\.git$/, "");
        setOwner(ownerVal);
        setRepo(repoVal);
        setIsValidRepo(true);
      } else {
        setOwner("");
        setRepo("");
        return;
      }
    }
    
    // Check if user has already minted for this repo
    if (address && isValidRepo && ownerVal && repoVal) {
      try {
        const fullRepoName = `${ownerVal}/${repoVal}`;
        const hasMinted = await hasUserMintedNFTForRepo(address, fullRepoName);
        setHasAlreadyMinted(hasMinted);
        
        if (hasMinted) {
          toast({
            title: "Already Minted",
            description: `You have already minted an NFT for the repository ${fullRepoName}`,
            variant: "destructive"
          });
        } else if (currentStep === MintStep.REPOSITORY_INFO) {
          setCurrentStep(MintStep.CONTRIBUTOR_INFO);
        }
      } catch (error) {
        console.error("Error checking if user has minted:", error);
      }
    } else if (isValidRepo && currentStep === MintStep.REPOSITORY_INFO) {
      setCurrentStep(MintStep.CONTRIBUTOR_INFO);
    }
  };
  
  // Fetch contributor data when contributor changes
  useEffect(() => {
    const fetchContributorData = async () => {
      if (!contributor) return;
      
      setIsLoadingContributor(true);
      setContributorError(null);
      
      try {
        const userData = await getUserProfile(contributor);
        setContributorData(userData);
        
        if (currentStep === MintStep.CONTRIBUTOR_INFO) {
          setCurrentStep(MintStep.CONTRIBUTION_STATS);
        }
      } catch (error: any) {
        console.error("Error fetching contributor data:", error);
        setContributorError(error.message || "Failed to fetch contributor data");
      } finally {
        setIsLoadingContributor(false);
      }
    };
    
    if (contributor) {
      fetchContributorData();
    }
  }, [contributor, currentStep]);
  
  // Handle contribution stats loaded
  const handleStatsLoaded = (stats: ContributionStatsData) => {
    setContributionStats(stats);
    
    // Calculate rarity tier and generate NFT image URL using alchemy service
    if (contributorData && owner && repo) {
      // Calculate rarity tier based on score
      const tier = alchemyService.calculateRarityTier(stats.score);
      setRarityTier(tier);
      
      // Generate enhanced NFT image URL with new service
      const imageUrl = alchemyService.generateEnhancedNftImage(
        repo,
        contributorData.name || contributorData.login,
        stats.score,
        tier
      );
      setNftImageUrl(imageUrl);
      
      if (currentStep === MintStep.CONTRIBUTION_STATS) {
        setCurrentStep(MintStep.GENERATE_METADATA);
      }
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
      // Create enhanced metadata with additional attributes
      const enhancedAttributes = [
        { trait_type: "Repository", value: `${owner}/${repo}` },
        { trait_type: "Contributor", value: contributorData.login },
        { trait_type: "Contribution Score", value: contributionStats.score.toString() },
        { trait_type: "Commits", value: contributionStats.commits.toString() },
        { trait_type: "Pull Requests", value: contributionStats.pullRequests.toString() },
        { trait_type: "Additions", value: contributionStats.additions.toString() },
        { trait_type: "Deletions", value: contributionStats.deletions.toString() },
        { trait_type: "Issues", value: contributionStats.issues.toString() },
        { trait_type: "Rarity", value: rarityTier?.name || "Common" }
      ];
      
      const result = await createNftMetadata(
        repo,
        `https://github.com/${owner}/${repo}`,
        {
          name: contributorData.name || "",
          login: contributorData.login,
          avatar_url: contributorData.avatar_url
        },
        contributionStats,
        address as `0x${string}`,
        JSON.stringify(enhancedAttributes)
      );
      
      setMetadataUri(result.uploadResult.uri);
      
      toast({
        title: "NFT Metadata Generated",
        description: "Your NFT metadata has been created and stored on Grove"
      });
      
      setCurrentStep(MintStep.MINT_NFT);
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
    if (!walletClient || !address || !metadataUri || !contributionStats) {
      toast({
        title: "Missing Information",
        description: !walletClient 
          ? "Please connect your wallet first" 
          : "Please generate NFT metadata first",
        variant: "destructive"
      });
      return;
    }
    
    setIsMinting(true);
    setMintingError(null);
    
    try {
      const result = await mintContributionNft(
        walletClient,
        address,
        `https://github.com/${owner}/${repo}`,
        contributionStats.score,
        metadataUri
      );
      
      if (result.success && result.transactionHash) {
        setTransactionHash(result.transactionHash);
        
        // Create NFT object to add to collection
        const nftData = {
          id: Date.now(),
          userId: 1, // Default user ID
          tokenId: result.transactionHash.substring(0, 10),
          name: `${repo} Contribution`,
          description: `Contribution to ${owner}/${repo} by ${contributor}`,
          imageUrl: nftImageUrl,
          rarity: (rarityTier?.name || 'common').toLowerCase(),
          repoName: `${owner}/${repo}`,
          mintedAt: new Date(),
          transactionHash: result.transactionHash,
          metadata: {
            contributionScore: contributionStats.score,
            commits: contributionStats.commits,
            additions: contributionStats.additions,
            deletions: contributionStats.deletions,
            pullRequests: contributionStats.pullRequests,
            issues: contributionStats.issues,
            rarityTier: rarityTier?.name || "Common",
            rarityColor: rarityTier?.color || "#808080"
          }
        };
        
        // Add NFT to Grove collection
        setIsAddingToGrove(true);
        try {
          const addedToGrove = await addNFTToCollection(nftData, address);
          if (addedToGrove) {
            console.log('NFT added to Grove collection successfully');
            
            // Update repository NFT count
            const repoFullName = `${owner}/${repo}`;
            const updatedRepo = await updateRepositoryNftCount(repoFullName, address);
            if (updatedRepo) {
              console.log(`Repository ${repoFullName} NFT count updated successfully`);
            } else {
              console.warn(`Failed to update NFT count for repository ${repoFullName}`);
            }
            
            // Update user information after minting
            const updatedUser = await updateUserAfterMinting(address);
            if (updatedUser) {
              console.log('User information updated successfully after minting');
            } else {
              console.warn('Failed to update user information after minting');
            }
            
            // Add activity entry for NFT minting
            const user = await getUserByWalletAddress(address);
            if (user) {
              const activityData = {
                type: 'nft_mint',
                repoName: repoFullName,
                description: `Minted a ${rarityTier?.name || 'Common'} NFT for contributions to ${repoFullName}`,
                metadata: {
                  name: `${repo} Contribution`,
                  description: `Contribution to ${owner}/${repo} by ${contributor}`,
                  rarity: rarityTier?.name || 'Common',
                  transactionHash: result.transactionHash,
                  contributionScore: contributionStats.score,
                  tags: [
                    { name: rarityTier?.name || 'Common', color: rarityTier?.color || '#808080' },
                    { name: 'NFT', color: '#3B82F6' }
                  ]
                }
              };
              
              const activityAdded = await addActivityToCollection(activityData, user, address);
              if (activityAdded) {
                console.log('Activity added to Grove collection successfully');
              } else {
                console.warn('Failed to add activity to Grove collection');
              }
            }
            
            // Refresh all Grove data to ensure the UI is updated everywhere
            await refreshGroveDataWithFetch();
            
            toast({
              title: "NFT Added to Collection",
              description: "Your NFT has been added to the Grove collection"
            });
          } else {
            console.warn('Failed to add NFT to Grove collection');
            toast({
              title: "Warning",
              description: "NFT was minted but couldn't be added to the Grove collection",
              variant: "destructive"
            });
          }
        } catch (error: any) {
          console.error("Error adding NFT to Grove collection:", error);
          toast({
            title: "Warning",
            description: "NFT was minted but couldn't be added to the Grove collection: " + (error.message || "Unknown error"),
            variant: "destructive"
          });
        } finally {
          setIsAddingToGrove(false);
        }
        
        setMintingSuccess(true);
        setCurrentStep(MintStep.COMPLETE);
        
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
  
  // Get progress percentage for the stepper
  const getProgressPercentage = () => {
    return (currentStep / MintStep.COMPLETE) * 100;
  };

  useEffect(() => {
    if (mintingSuccess && !confettiFired) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
      setConfettiFired(true);
    }
    if (!mintingSuccess) {
      setConfettiFired(false);
    }
  }, [mintingSuccess, confettiFired]);

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
              
              {/* Progress bar */}
              <div className="mt-6 mb-8">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-in-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Repository</span>
                  <span>Contributor</span>
                  <span>Stats</span>
                  <span>Generate</span>
                  <span>Mint</span>
                </div>
              </div>
            </div>
            
            {!isConnected && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription className="flex items-center justify-between">
                  <span>Please connect your wallet to mint NFTs.</span>
                  <ConnectWalletButton size="sm" />
                </AlertDescription>
              </Alert>
            )}
            
            {isConnected && !isGitHubAuthenticated && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>You need to link your GitHub account before minting NFTs.</span>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate("/link-github")}
                    className="whitespace-nowrap"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Connect GitHub
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success Modal/Section with Confetti */}
            {mintingSuccess && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center relative animate-fade-in">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-4">
                      <span role="img" aria-label="party">🎉</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-primary">NFT Minted Successfully!</h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">Your contribution NFT has been minted and added to your collection. Celebrate your achievement!</p>
                    {transactionHash && (
                      <div className="mb-4">
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
                    <div className="flex gap-4 mt-6">
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
                </div>
              </div>
            )}
            
            {/* Main Minting UI (hidden when success modal is open) */}
            {!mintingSuccess && (
              <div className="space-y-8">
                {/* Step 1: Repository Information */}
                <Card className={currentStep >= MintStep.REPOSITORY_INFO ? "border-primary/50" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-2">1</span>
                      Repository Information
                      {isValidRepo && <span className="ml-2 text-green-500"><i className="fas fa-check"></i></span>}
                    </CardTitle>
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
                      
                      {!isValidRepo && repoUrl && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            Invalid repository format. Please use "owner/repo" or "https://github.com/owner/repo"
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Step 2: Contributor Information */}
                <Card 
                  className={currentStep >= MintStep.CONTRIBUTOR_INFO ? "border-primary/50" : "opacity-70"}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-2">2</span>
                      Contributor Information
                      {contributorData && <span className="ml-2 text-green-500"><i className="fas fa-check"></i></span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contributor">GitHub Username</Label>
                        <div className="flex gap-2">
                          <Input
                            id="contributor"
                            placeholder="GitHub username"
                            value={contributor || ""}
                            onChange={(e) => setContributor(e.target.value || undefined)}
                            disabled={!isValidRepo || isLoadingContributor}
                          />
                          {isLoadingContributor && <Spinner size="sm" />}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter the GitHub username of the contributor (defaults to your linked GitHub account)
                        </p>
                      </div>
                      
                      {contributorError && (
                        <Alert variant="destructive">
                          <AlertDescription>{contributorError}</AlertDescription>
                        </Alert>
                      )}
                      
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
                  <Card className={currentStep >= MintStep.CONTRIBUTION_STATS ? "border-primary/50" : "opacity-70"}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-2">3</span>
                        Contribution Statistics
                        {contributionStats && <span className="ml-2 text-green-500"><i className="fas fa-check"></i></span>}
                      </CardTitle>
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
                  <Card className={currentStep >= MintStep.GENERATE_METADATA ? "border-primary/50" : "opacity-70"}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-2">4</span>
                        Generate and Mint NFT
                        {mintingSuccess && <span className="ml-2 text-green-500"><i className="fas fa-check"></i></span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex justify-center">
                          <NftPreviewCard
                            repositoryName={`${owner}/${repo}`}
                            repositoryUrl={`https://github.com/${owner}/${repo}`}
                            contributor={contributorData}
                            contributionStats={contributionStats}
                            contributionScore={contributionStats.score}
                            imageUrl={nftImageUrl}
                            isMinting={isGenerating || isMinting || isAddingToGrove}
                            onMint={metadataUri ? handleMintNft : handleGenerateNft}
                            rarityTier={rarityTier}
                            mintingSuccess={mintingSuccess}
                            onViewNft={() => navigate("/profile")}
                            accountAddress={address as `0x${string}`}
                          />
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">NFT Details</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              This NFT represents your contributions to the {owner}/{repo} repository.
                              It will be permanently stored on the blockchain as proof of your work.
                            </p>
                            
                            {/* Display rarity information */}
                            {rarityTier && (
                              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${rarityTier.color}20` }}>
                                <h4 className="text-md font-semibold mb-1" style={{ color: rarityTier.color }}>
                                  {rarityTier.name} Rarity
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  This contribution NFT has a score of {contributionStats.score}, qualifying it as a {rarityTier.name.toLowerCase()} level NFT.
                                </p>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              {!metadataUri && (
                                <Button 
                                  onClick={handleGenerateNft} 
                                  disabled={isGenerating || !contributionStats || !address || currentStep < MintStep.GENERATE_METADATA}
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
                                  disabled={isMinting || isAddingToGrove || !address || currentStep < MintStep.MINT_NFT}
                                  className="w-full"
                                >
                                  {isMinting ? (
                                    <>
                                      <Spinner size="sm" className="mr-2" />
                                      Minting NFT...
                                    </>
                                  ) : isAddingToGrove ? (
                                    <>
                                      <Spinner size="sm" className="mr-2" />
                                      Adding to Grove Collection...
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
} 