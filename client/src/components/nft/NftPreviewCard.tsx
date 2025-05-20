import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getRarityLevel } from "@/lib/nft-service";

interface NftPreviewCardProps {
  repositoryName: string;
  repositoryUrl: string;
  contributor: {
    name?: string;
    login: string;
    avatar_url: string;
  };
  contributionStats: {
    commits: number;
    additions: number;
    deletions: number;
    pullRequests: number;
    issues: number;
  };
  contributionScore: number;
  imageUrl: string;
  isMinting: boolean;
  onMint: () => void;
}

export function NftPreviewCard({
  repositoryName,
  repositoryUrl,
  contributor,
  contributionStats,
  contributionScore,
  imageUrl,
  isMinting,
  onMint
}: NftPreviewCardProps) {
  const rarity = getRarityLevel(contributionScore);
  const displayName = contributor.name || contributor.login;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {repositoryName} Contribution NFT
          </CardTitle>
          <Badge
            style={{ backgroundColor: rarity.color, color: "#fff" }}
            className="px-3 py-1 text-xs font-bold uppercase tracking-wide"
          >
            {rarity.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={contributor.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-md font-semibold">{displayName}</h3>
              <p className="text-sm text-gray-500">@{contributor.login}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="aspect-square max-h-72 w-full overflow-hidden rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`NFT for ${displayName}'s contributions to ${repositoryName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <Spinner size="lg" className="mx-auto mb-2" />
                <p className="text-sm text-gray-500">Generating preview...</p>
              </div>
            )}
          </div>

          <h4 className="font-medium text-sm mb-2">Contribution Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-500">Commits</span>
              <span className="font-medium">{contributionStats.commits}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-500">PRs</span>
              <span className="font-medium">{contributionStats.pullRequests}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-500">Issues</span>
              <span className="font-medium">{contributionStats.issues}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-500">Lines</span>
              <span className="font-medium">+{contributionStats.additions} / -{contributionStats.deletions}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 flex justify-between items-center">
          <div>
            <span className="block text-xs text-gray-500">Score</span>
            <span className="font-bold text-lg" style={{ color: rarity.color }}>
              {contributionScore}
            </span>
          </div>
          <div className="flex items-center">
            <div className="mr-2">
              <span className="block text-xs text-gray-500">Rarity</span>
              <span className="font-medium">{rarity.name}</span>
            </div>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: rarity.color }}></div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 dark:border-gray-700 p-4">
        <Button 
          onClick={onMint} 
          disabled={isMinting} 
          className="w-full bg-primary hover:bg-primary/90"
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
      </CardFooter>
    </Card>
  );
} 