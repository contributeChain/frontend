import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "../ui/skeleton";
import { ContributionStatsData } from "./ContributionStats";
import NftCanvasEditor from "./NftCanvasEditor";

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
  const [customizing, setCustomizing] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(undefined);
  const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob | null>(null);
  
  // Handle image generation from canvas editor
  const handleImageGenerated = (imageUrl: string, imageBlob: Blob) => {
    setCustomImageUrl(imageUrl);
    setGeneratedImageBlob(imageBlob);
    setCustomizing(false);
  };
  
  // Handle mint with custom image
  const handleMint = () => {
    onMint(customImageUrl);
  };
  
  // Toggle between preview and customization
  const toggleCustomizing = () => {
    setCustomizing(!customizing);
  };
  
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
      
      {customizing ? (
        <CardContent className="p-4">
          <NftCanvasEditor
            repositoryName={repositoryName}
            contributorName={contributor.name || contributor.login}
            contributionScore={contributionScore}
            rarityTier={rarityTier || { name: "Common", color: "#718096" }}
            onImageGenerated={handleImageGenerated}
            accountAddress={accountAddress}
          />
        </CardContent>
      ) : (
        <>
          <CardContent className="p-0">
            <div className="relative">
              {(customImageUrl || imageUrl) ? (
                <img 
                  src={customImageUrl || imageUrl} 
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
                  <>
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
                        customImageUrl ? 'Mint Custom NFT' : 'Mint Default NFT'
                      )}
                    </Button>
                    
                    <Button
                      variant={customImageUrl ? "outline" : "default"}
                      className="flex-1"
                      onClick={toggleCustomizing}
                      disabled={isMinting}
                    >
                      <i className="fas fa-palette mr-2"></i>
                      Customize NFT
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
} 