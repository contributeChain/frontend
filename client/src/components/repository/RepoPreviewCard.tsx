import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { uploadJson } from "@/lib/groveClient";
import { GitHubRepository } from "@/lib/githubClient";

interface RepoPreviewCardProps {
  owner: string;
  repo: string;
  repoData: GitHubRepository;
  onSaved?: (groveResponse: any) => void;
}

export default function RepoPreviewCard({ owner, repo, repoData, onSaved }: RepoPreviewCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveRepository = async () => {
    if (!user?.walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to save this repository",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Format the data for storing in Grove
      const repoForStorage = {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        owner: {
          login: repoData.owner.login,
          avatarUrl: repoData.owner.avatar_url,
        },
        description: repoData.description,
        htmlUrl: repoData.html_url,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        topics: repoData.topics,
        submittedBy: {
          walletAddress: user.walletAddress,
          githubUsername: user.githubUser?.login || null,
        },
        submittedAt: new Date().toISOString(),
      };

      // Upload to Grove using the connected wallet address
      const uploadResult = await uploadJson(
        repoForStorage,
        user.walletAddress as `0x${string}`
      );

      toast({
        title: "Repository saved",
        description: "Repository has been saved to Grove successfully",
      });

      // Call the onSaved callback with the Grove response
      if (onSaved) {
        onSaved(uploadResult);
      }
    } catch (error: any) {
      console.error("Error saving repository to Grove:", error);
      toast({
        title: "Error saving repository",
        description: error.message || "Failed to save repository to Grove",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{repoData.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              by {repoData.owner.login}
            </CardDescription>
          </div>
          {repoData.language && (
            <div className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
              {repoData.language}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {repoData.description || "No description provided."}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-star text-yellow-500"></i>
            <span>{repoData.stargazers_count} Stars</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-code-branch text-blue-500"></i>
            <span>{repoData.forks_count} Forks</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-calendar text-gray-500"></i>
            <span>Created: {formatDate(repoData.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-sync text-gray-500"></i>
            <span>Updated: {formatDate(repoData.updated_at)}</span>
          </div>
        </div>
        
        {repoData.topics && repoData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repoData.topics.map((topic) => (
              <span 
                key={topic} 
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href={repoData.html_url} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </Button>
        <Button onClick={handleSaveRepository} disabled={isSaving}>
          {isSaving ? <Spinner size="sm" className="mr-2" /> : <i className="fas fa-save mr-2"></i>}
          Save Repository
        </Button>
      </CardFooter>
    </Card>
  );
} 