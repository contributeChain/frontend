import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { getRepository } from "@/lib/githubClient";

interface RepoUrlInputProps {
  onValidRepo: (owner: string, repo: string, repoData: any) => void;
  className?: string;
}

export default function RepoUrlInput({ onValidRepo, className = "" }: RepoUrlInputProps) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Parse GitHub repo URL to extract owner and repo name
  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    // Try to match GitHub URL patterns
    let match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    
    // If not a match, try to see if they just provided owner/repo format
    if (!match) {
      match = url.match(/^([^\/]+)\/([^\/]+)$/);
    }
    
    if (match && match.length === 3) {
      // Clean up repo name (remove .git if present)
      const repo = match[2].replace(/\.git$/, "");
      return { owner: match[1], repo };
    }
    
    return null;
  };

  const validateRepo = async () => {
    // Reset states
    setIsValidating(true);
    setError(null);
    setIsValid(false);
    
    try {
      const parsed = parseRepoUrl(url);
      
      if (!parsed) {
        setError("Invalid repository URL format. Please use owner/repo or https://github.com/owner/repo");
        return;
      }
      
      // Validate that the repo exists by making a GitHub API call
      const repoData = await getRepository(parsed.owner, parsed.repo);
      
      // If successful, mark as valid and call the callback
      setIsValid(true);
      onValidRepo(parsed.owner, parsed.repo, repoData);
    } catch (error: any) {
      if (error.status === 404) {
        setError("Repository not found. Please check the URL and try again.");
      } else {
        setError(`Error validating repository: ${error.message}`);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateRepo();
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="repo-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub Repository URL
          </label>
          <div className="flex gap-2">
            <Input
              id="repo-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="flex-1"
              disabled={isValidating}
            />
            <Button 
              type="submit" 
              disabled={!url || isValidating || isValid}
            >
              {isValidating ? <Spinner size="sm" /> : "Validate"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter a GitHub repository URL or owner/repo format
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isValid && (
          <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
            <AlertDescription>Repository validated successfully!</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
} 