import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "../ui/skeleton";
import { ContributionStatsData } from "./ContributionStats";

export interface NftPreviewCardProps {
  repositoryName: string;
  repositoryUrl: string;
  contributor: any;
  contributionStats: ContributionStatsData;
  contributionScore: number;
  imageUrl: string;
  isMinting: boolean;
  onMint: () => void;
  rarityTier?: { name: string; color: string } | null;
}

export function NftPreviewCard({
  repositoryName,
  repositoryUrl,
  contributor,
  contributionStats,
  contributionScore,
  imageUrl,
  isMinting,
  onMint,
  rarityTier
}: NftPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">
            {repositoryName} Contribution NFT
          </CardTitle>
          {rarityTier && (
            <Badge
              style={{ backgroundColor: rarityTier.color, color: "#fff" }}
              className="px-3 py-1 text-xs font-bold uppercase tracking-wide"
            >
              {rarityTier.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`${repositoryName} contribution NFT`}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <Skeleton className="w-full aspect-square" />
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <img 
              src={contributor.avatar_url} 
              alt={contributor.login}
              className="w-6 h-6 rounded-full"
            />
            <a 
              href={`https://github.com/${contributor.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              @{contributor.login}
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
              <div className="font-medium">{contributionScore}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Commits</div>
              <div className="font-medium">{contributionStats.commits}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">PRs</div>
              <div className="font-medium">{contributionStats.pullRequests}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Issues</div>
              <div className="font-medium">{contributionStats.issues}</div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            disabled={isMinting}
            onClick={onMint}
          >
            {isMinting ? (
              <>
                <Spinner size="sm" className="mr-2" /> 
                Processing...
              </>
            ) : (
              'Generate & Mint NFT'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 