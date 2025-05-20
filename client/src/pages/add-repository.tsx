import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { Container } from "@/components/layout/container";
import RepoUrlInput from "@/components/repository/RepoUrlInput";
import RepoPreviewCard from "@/components/repository/RepoPreviewCard";
import { GitHubRepository } from "@/lib/githubClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddRepositoryPage() {
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
    data: GitHubRepository;
  } | null>(null);
  const [savedGroveResponse, setSavedGroveResponse] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const handleValidRepo = (owner: string, repo: string, repoData: GitHubRepository) => {
    setRepoInfo({ owner, repo, data: repoData });
  };

  const handleRepositorySaved = (groveResponse: any) => {
    setSavedGroveResponse(groveResponse);
    
    toast({
      title: "Repository added successfully",
      description: "Your repository has been added to the platform.",
    });
    
    // Navigate to repositories page after a short delay
    setTimeout(() => {
      navigate("/repositories");
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Add Repository - DevCred</title>
        <meta name="description" content="Add a GitHub repository to the DevCred platform" />
      </Helmet>

      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-darkBg min-h-screen">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Add Repository</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a GitHub repository to DevCred and connect it with your on-chain credentials.
              </p>
            </div>

            {!isAuthenticated && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  You must be connected with your wallet to add a repository. 
                  Please connect your wallet first.
                </AlertDescription>
              </Alert>
            )}

            {!user?.githubUser && isAuthenticated && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  You must link your GitHub account to add a repository. 
                  Please <a href="/link-github" className="underline font-medium">link your GitHub account</a> first.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-display font-bold mb-4">Enter Repository URL</h2>
                <RepoUrlInput 
                  onValidRepo={handleValidRepo} 
                  className="mb-4"
                />
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  <p>Enter the URL of the GitHub repository you'd like to add to DevCred.</p>
                  <p className="mt-2">Examples:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                    <li>https://github.com/username/repository</li>
                    <li>github.com/username/repository</li>
                    <li>username/repository</li>
                  </ul>
                </div>
              </div>

              {repoInfo && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-display font-bold mb-4">Repository Preview</h2>
                  <RepoPreviewCard
                    owner={repoInfo.owner}
                    repo={repoInfo.repo}
                    repoData={repoInfo.data}
                    onSaved={handleRepositorySaved}
                  />
                </div>
              )}

              {savedGroveResponse && (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
                  <AlertDescription>
                    Repository added successfully! Redirecting to repositories page...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
} 