import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Repository } from "@shared/schema";
import RepositoryCard from "@/components/repository-card";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Repositories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/repositories');
        
        if (response.ok) {
          const data = await response.json();
          setRepositories(data);
          setFilteredRepositories(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load repositories",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
        toast({
          title: "Error",
          description: "Failed to load repositories. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepositories();
  }, [toast]);

  useEffect(() => {
    // Apply filtering based on search query and filter
    const applyFilters = () => {
      let filtered = repositories;
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(repo => 
          repo.name.toLowerCase().includes(query) || 
          repo.description?.toLowerCase().includes(query) ||
          repo.language?.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (filter !== "all") {
        filtered = filtered.filter(repo => 
          repo.language?.toLowerCase() === filter.toLowerCase() ||
          (filter === "web3" && (
            repo.name.toLowerCase().includes("web3") || 
            repo.name.toLowerCase().includes("blockchain") || 
            repo.name.toLowerCase().includes("defi")
          ))
        );
      }
      
      setFilteredRepositories(filtered);
    };
    
    applyFilters();
  }, [searchQuery, filter, repositories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by the useEffect dependency
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Placeholder data if API failed
  const ensureRepositories = filteredRepositories.length > 0 ? filteredRepositories : [
    {
      id: 1,
      userId: 1,
      name: "blockchain-auth-system",
      description: "An OAuth-compatible authentication system built on blockchain technology for secure, decentralized identity verification.",
      stars: 248,
      forks: 56,
      language: "JavaScript",
      nftCount: 24,
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: 2,
      userId: 1,
      name: "react-performance-toolkit",
      description: "A collection of performance optimization tools and components for React applications with a focus on rendering speed.",
      stars: 1200,
      forks: 184,
      language: "TypeScript",
      nftCount: 36,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 3,
      userId: 1,
      name: "defi-dashboard-components",
      description: "A suite of React components specifically designed for DeFi applications with real-time data visualization.",
      stars: 845,
      forks: 92,
      language: "TypeScript",
      nftCount: 18,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];

  return (
    <>
      <Helmet>
        <title>Repository Explorer - DevCred</title>
        <meta name="description" content="Discover repositories and their on-chain credentials. Explore contributions and associated NFTs." />
      </Helmet>
      
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Repository Explorer</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Discover repositories and their on-chain credentials</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <form onSubmit={handleSearch}>
                  <Input 
                    type="text"
                    placeholder="Search repositories..." 
                    className="w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                </form>
              </div>
              
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 text-sm flex items-center gap-2">
                      <span>Filter</span>
                      <i className="fas fa-filter text-gray-500"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                      All Repositories
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("javascript")}>
                      JavaScript
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("typescript")}>
                      TypeScript
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("web3")}>
                      Web3 / Blockchain
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("python")}>
                      Python
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ensureRepositories.map((repository) => (
                  <RepositoryCard 
                    key={repository.id} 
                    repository={repository} 
                    username={repository.userId === 1 ? "Sarah Chen" : `User ${repository.userId}`} 
                  />
                ))}
              </div>
              
              {ensureRepositories.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                  <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-display font-bold mb-2">No repositories found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No repositories match your current search and filter criteria. Try adjusting your search.
                  </p>
                </div>
              )}
              
              {ensureRepositories.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <Button 
                    variant="outline"
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-darkText dark:text-lightText font-medium py-2 px-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                  >
                    <span>Load More Repositories</span>
                    <i className="fas fa-arrow-down"></i>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
