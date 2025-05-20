import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { getRepository, getRepositoryContributions, GitHubRepository } from "@/lib/githubClient";
import { getRepositoryById, Repository } from "@/lib/grove-service";

// Define a type for GitHub contributions based on the actual structure
interface GithubContributor {
  author: {
    login: string;
    id: number;
    avatar_url: string;
    [key: string]: any;
  };
  total: number;
  weeks: any[];
}

interface RepositoryDetailPageProps {
  params: {
    id: string;
  };
}

export default function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [githubRepo, setGithubRepo] = useState<GitHubRepository | null>(null);
  const [contributions, setContributions] = useState<GithubContributor[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch repository data
  useEffect(() => {
    const fetchRepositoryData = async () => {
      setIsLoading(true);
      setNotFound(false);
      setErrorMessage(null);
      
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
          
          // Extract owner and repo name from the repository name (assuming format: "owner/repo")
          const [owner, repo] = repoData.name.split('/');
          
          if (owner && repo) {
            try {
              // Fetch additional GitHub data
              const githubRepoData = await getRepository(owner, repo);
              setGithubRepo(githubRepoData as GitHubRepository);
              
              const contributionsData = await getRepositoryContributions(owner, repo);
              setContributions(contributionsData as GithubContributor[]);
            } catch (error) {
              console.error("Error fetching GitHub data:", error);
              setErrorMessage("Could not fetch additional GitHub data for this repository.");
              // Don't set notFound here, as we still have the basic repository data
            }
          } else {
            setErrorMessage("Repository name format is not valid for fetching GitHub data. Expected format: 'owner/repo'.");
          }
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
        console.error("Error fetching repository:", error);
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

  // Format date for display
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 my-4" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
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
        <title>{repository.name} - Repository Details - DevCred</title>
        <meta name="description" content={repository.description || `Details and credentials for ${repository.name}`} />
      </Helmet>

      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          {errorMessage && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="fas fa-exclamation-circle mr-3 mt-0.5"></i>
                <div>
                  <p className="font-medium">Note</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  onClick={() => navigate("/repositories")}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Repositories
                </Button>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {repoName || repository.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {repoOwner && <span className="font-medium">{repoOwner}</span>}
                  {repoOwner && " • "}
                  Added on {formatDate(repository.lastUpdated)}
                </p>
              </div>
              
              {repository.language && (
                <div className="px-4 py-2 text-sm rounded-full bg-primary/10 text-primary font-medium">
                  {repository.language}
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Repository Overview */}
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-display font-bold mb-3">Repository Overview</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {repository.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary mb-1">{repository.stars || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stars</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-500 mb-1">{repository.forks || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Forks</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-secondary mb-1">{repository.nftCount || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">NFTs</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-accent mb-1">
                        {githubRepo?.topics?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Topics</p>
                    </div>
                  </div>
                  
                  {githubRepo?.topics && githubRepo.topics.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {githubRepo.topics.map((topic) => (
                          <span 
                            key={topic} 
                            className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* On-chain Credentials */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold">On-Chain Credentials</h2>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/mint-nft?repo=${repoOwner || ''}/${repoName || repository.name}`)}
                        disabled={!repoOwner || !repoName}
                      >
                        <i className="fas fa-award mr-2"></i>
                        Mint NFT
                      </Button>
                      <Button size="sm">
                        <i className="fas fa-certificate mr-2"></i>
                        View NFTs
                      </Button>
                    </div>
                  </div>
                  
                  {(repository.nftCount || 0) > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* NFT cards would go here */}
                      <p className="col-span-2 text-gray-600 dark:text-gray-400">
                        This repository has {repository.nftCount} on-chain credentials.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-award text-3xl text-gray-400 mb-2"></i>
                      <h3 className="text-lg font-display font-medium mb-2">No On-Chain Credentials Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        This repository doesn't have any on-chain credentials yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Contributors Section */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-display font-bold mb-6">Top Contributors</h2>
                  
                  {contributions && contributions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {contributions.slice(0, 5).map((contribution, index) => (
                        <div key={contribution.author.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-gray-400 w-6 text-center">{index + 1}</div>
                            <img
                              src={`https://github.com/${contribution.author.login}.png`}
                              alt={contribution.author.login}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{contribution.author.login}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {contribution.total} contributions
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-users text-3xl text-gray-400 mb-2"></i>
                      <h3 className="text-lg font-display font-medium mb-2">No Contributors Data</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Contributor data is not available for this repository.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
} 