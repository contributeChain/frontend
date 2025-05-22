import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "../ui/skeleton";
import { ContributionStatsData } from "./ContributionStats";
import NftBackgroundChanger from "./NftBackgroundChanger";

export interface NftPreviewCardProps {
  repositoryName: string;
  repositoryUrl: string;
  contributor: any;
  contributionStats: ContributionStatsData;
  contributionScore: number;
  imageUrl?: string;
  isMinting: boolean;
  onMint: (customImageUrl?: string) => void;
  rarityTier?: { name: string; color: string } | null;
  mintingSuccess?: boolean;
  onViewNft?: () => void;
  accountAddress: `0x${string}`;
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
  rarityTier,
  mintingSuccess = false,
  onViewNft,
  accountAddress
}: NftPreviewCardProps) {
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(undefined);
  
  // Handle image generation from background changer
  const handleImageGenerated = (imageUrl: string, imageBlob: Blob) => {
    setCustomImageUrl(imageUrl);
    setIsChangingBackground(false);
  };
  
  // Handle mint with custom image
  const handleMint = () => {
    onMint(customImageUrl);
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
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
      
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="relative w-full">
          {(customImageUrl || imageUrl) ? (
            <div className="aspect-square w-full relative overflow-hidden">
              <img 
                src={customImageUrl || imageUrl} 
                alt={`${repositoryName} contribution NFT`}
                className="w-full h-full object-cover"
              />
              
              {!mintingSuccess && !isMinting && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsChangingBackground(true)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span className="ml-1">Change BG</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="aspect-square w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Skeleton className="w-4/5 h-4/5" />
            </div>
          )}
          
          {isChangingBackground && (
            <NftBackgroundChanger
              repositoryName={repositoryName}
              contributorName={contributor.name || contributor.login}
              contributionScore={contributionScore}
              rarityTier={rarityTier || { name: "Common", color: "#718096" }}
              onImageGenerated={handleImageGenerated}
              accountAddress={accountAddress}
              contributionStats={contributionStats}
              onCancel={() => setIsChangingBackground(false)}
            />
          )}
        </div>
        
        <div className="p-4 space-y-4 mt-auto">
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
          
          <div className="flex gap-2">
            {mintingSuccess ? (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onViewNft}
              >
                <i className="fas fa-eye mr-2"></i>
                View NFT
              </Button>
            ) : (
              <Button 
                className="flex-1"
                disabled={isMinting}
                onClick={handleMint}
                variant={customImageUrl ? "default" : "outline"}
              >
                {isMinting ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> 
                    Processing...
                  </>
                ) : (
                  customImageUrl ? 'Mint NFT' : 'Mint Default NFT'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 