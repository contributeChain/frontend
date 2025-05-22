import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/container";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { getNFTsByRepoName, NFT, getRepositoryById, Repository, hasUserMintedNFTForRepo } from "@/lib/grove-service";
import NFTCard from "@/components/nft-card";

interface RepositoryNFTsPageProps {
  params: {
    id: string;
  };
}

export default function RepositoryNFTsPage({ params }: RepositoryNFTsPageProps) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { address } = useAccount();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasUserMinted, setHasUserMinted] = useState(false);

  // Fetch repository data
  useEffect(() => {
    const fetchRepositoryData = async () => {
      setIsLoading(true);
      setNotFound(false);
      
      try {
        // Parse the ID to a number
        const repoId = parseInt(id);
        
        if (isNaN(repoId)) {
          console.error(`Invalid repository ID: ${id}`);
          setNotFound(true);
          toast({
            title: "Invalid repository ID",
            description: `"${id}" is not a valid repository ID.`,
            variant: "destructive"
          });
          return;
        }
        
        // Fetch repository from Grove
        const repoData = await getRepositoryById(repoId);
        
        if (repoData) {
          setRepository(repoData);
          
          // Fetch NFTs associated with this repository
          const repoNfts = await getNFTsByRepoName(repoData.name);
          setNfts(repoNfts);
        } else {
          console.error(`Repository not found: ${id}`);
          setNotFound(true);
          toast({
            title: "Repository not found",
            description: `The repository with ID ${id} could not be found.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching repository data:", error);
        setNotFound(true);
        toast({
          title: "Error",
          description: "Failed to load repository details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepositoryData();
  }, [id, toast]);

  // Check if the current user has already minted an NFT for this repository
  useEffect(() => {
    const checkUserMinted = async () => {
      if (!repository || !address) return;
      
      try {
        const hasMinted = await hasUserMintedNFTForRepo(address, repository.name);
        setHasUserMinted(hasMinted);
      } catch (error) {
        console.error("Error checking if user has minted:", error);
      }
    };
    
    checkUserMinted();
  }, [repository, address]);

  // Extract owner and repo name
  const getOwnerAndRepo = (fullName: string): { owner: string | null, repo: string | null } => {
    const parts = fullName.split('/');
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return { owner: null, repo: null };
  };

  // Get repository owner and name
  const { owner: repoOwner, repo: repoName } = repository ? getOwnerAndRepo(repository.name) : { owner: null, repo: null };

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

  if (notFound || !repository) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h2 className="text-xl font-display font-bold mb-2">Repository Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The repository with ID <span className="font-semibold">{id}</span> doesn't exist or you don't have permission to view it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/repositories")} variant="outline">
                  <i className="fas fa-list mr-2"></i> Browse Repositories
                </Button>
                <Button onClick={() => navigate("/add-repository")}>
                  <i className="fas fa-plus mr-2"></i> Add Repository
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
        <title>NFTs for {repository.name} - Lens Alchemy</title>
        <meta name="description" content={`View all NFTs associated with ${repository.name}`} />
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
                  onClick={() => navigate(`/repositories/${id}`)}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Repository
                </Button>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  NFTs for {repoName || repository.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {repoOwner && <span className="font-medium">{repoOwner}</span>}
                  {repoOwner && " • "}
                  {nfts.length} on-chain credential{nfts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <Button 
                onClick={() => navigate(`/mint-nft?repo=${repoOwner || ''}/${repoName || repository.name}`)}
                disabled={!repoOwner || !repoName || hasUserMinted}
                title={hasUserMinted ? "You have already minted an NFT for this repository" : ""}
              >
                <i className="fas fa-plus mr-2"></i>
                {hasUserMinted ? "Already Minted" : "Mint New NFT"}
              </Button>
            </div>
            
            {nfts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <div 
                    key={nft.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/repositories/${id}/nfts/${nft.id}`)}
                  >
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md text-center">
                <i className="fas fa-award text-4xl text-gray-400 mb-4"></i>
                <h2 className="text-xl font-display font-bold mb-2">No NFTs Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This repository doesn't have any NFTs or on-chain credentials yet.
                </p>
                <Button 
                  onClick={() => navigate(`/mint-nft?repo=${repoOwner || ''}/${repoName || repository.name}`)}
                  disabled={hasUserMinted}
                  title={hasUserMinted ? "You have already minted an NFT for this repository" : ""}
                >
                  <i className="fas fa-plus mr-2"></i>
                  {hasUserMinted ? "Already Minted" : "Mint First NFT"}
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
} 