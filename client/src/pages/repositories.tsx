import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RepositoryCard from "@/components/repository-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchRepositories, fetchUsers, type Repository, type User } from "@/lib/grove-service";

export default function Repositories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch repositories and users from Grove
        const [reposData, usersData] = await Promise.all([
          fetchRepositories(),
          fetchUsers()
        ]);
        
        setRepositories(reposData);
        setFilteredRepositories(reposData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        toast({
          title: "Error",
          description: "Failed to load data from Grove. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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

  const handleAddRepository = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to add a repository",
        variant: "destructive"
      });
      return;
    }
    
    navigate("/add-repository");
  };

  // Find the username for a repository based on userId
  const getUsernameForRepository = (userId: number): string => {
    const user = users.find(user => user.id === userId);
    return user ? user.username : `User ${userId}`;
  };

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
              <Button 
                onClick={handleAddRepository}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Repository
              </Button>
              
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
              {filteredRepositories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRepositories.map((repository) => (
                    <RepositoryCard 
                      key={repository.id} 
                      repository={repository} 
                      username={getUsernameForRepository(repository.userId)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                  <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-display font-bold mb-2">No repositories found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No repositories match your current search and filter criteria. Try adjusting your search.
                  </p>
                </div>
              )}
              
              {filteredRepositories.length > 9 && (
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
