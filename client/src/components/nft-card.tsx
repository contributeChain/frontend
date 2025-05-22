import { useState } from "react";
import { NFT } from "@/lib/web3-utils";
import { formatDate, shortenAddress } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NFTCardProps {
  nft: NFT;
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
}

export default function NFTCard({ nft, size = "medium", className = "", onClick }: NFTCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Determine the appropriate icon based on NFT type or name
  const getIcon = () => {
    if (nft.name.includes("Commit") || nft.name.includes("COMMIT")) {
      return "fa-code";
    } else if (nft.name.includes("Streak") || nft.name.includes("STREAK")) {
      return "fa-fire";
    } else if (nft.name.includes("PR") || nft.name.includes("Merge")) {
      return "fa-star";
    } else if (nft.name.includes("Bug") || nft.name.includes("Fix")) {
      return "fa-bug";
    } else {
      return "fa-code-branch";
    }
  };
  
  // Get appropriate color class based on rarity
  const getRarityColor = () => {
    const rarityLower = nft.rarity.toLowerCase();
    
    switch (rarityLower) {
      case "common":
        return "text-primary";
      case "rare":
        return "text-secondary";
      case "epic":
        return "text-accent";
      case "legendary":
        return "text-amber-500";
      default:
        return "text-primary";
    }
  };
  
  // Get appropriate icon based on rarity
  const getRarityIcon = () => {
    const rarityLower = nft.rarity.toLowerCase();
    
    switch (rarityLower) {
      case "common":
        return "fa-check-circle";
      case "rare":
        return "fa-gem";
      case "epic":
        return "fa-trophy";
      case "legendary":
        return "fa-crown";
      default:
        return "fa-check-circle";
    }
  };
  
  // Get background gradient based on rarity
  const getBackgroundGradient = () => {
    const rarityLower = nft.rarity.toLowerCase();
    
    switch (rarityLower) {
      case "common":
        return "bg-gradient-to-br from-primary/5 to-secondary/5";
      case "rare":
        return "bg-gradient-to-br from-secondary/5 to-primary/5";
      case "epic":
        return "bg-gradient-to-br from-accent/5 to-secondary/5";
      case "legendary":
        return "bg-gradient-to-br from-amber-500/5 to-accent/5";
      default:
        return "bg-gradient-to-br from-primary/5 to-accent/5";
    }
  };
  
  const cardClasses = `${getBackgroundGradient()} border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer nft-card ${className}`;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setDialogOpen(true);
    }
  };
  
  // Helper function to get the image source
  const getImageSrc = () => {
    return nft.image || nft.imageUrl || '';
  };
  
  return (
    <>
      <div className={cardClasses} onClick={handleClick}>
        <div className="aspect-square relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-accent opacity-20"></div>
          {getImageSrc() ? (
            <img 
              src={getImageSrc()}
              alt={nft.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="p-4 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <i className={`fas ${getIcon()} ${getRarityColor()}`}></i>
              </div>
              <div className="text-center">
                <div className="font-mono text-xs font-bold mb-1">{nft.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{nft.description}</div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 right-0 p-1.5">
            <div className={`px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm flex items-center text-xs font-medium ${getRarityColor()}`}>
              <i className={`fas ${getRarityIcon()} mr-1`}></i>
              <span className="capitalize">{nft.rarity}</span>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Minted: {formatDate(nft.mintedAt)}
            </div>
          </div>
          {nft.transactionHash && (
            <div className="mt-1 flex items-center text-xs">
              <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-1">
                <i className="fas fa-link text-gray-500"></i>
                <span className="font-mono">{shortenAddress(nft.transactionHash)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* NFT Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{nft.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              {getImageSrc() ? (
                <img 
                  src={getImageSrc()}
                  alt={nft.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <i className={`fas ${getIcon()} ${getRarityColor()} text-4xl`}></i>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-1">{nft.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Rarity</h3>
                  <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRarityColor()}`}>
                    <i className={`fas ${getRarityIcon()} mr-2`}></i>
                    {nft.rarity}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Minted</h3>
                  <p className="mt-1">{formatDate(nft.mintedAt)}</p>
                </div>
                
                {nft.transactionHash && (
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Transaction</h3>
                    <a 
                      href={`https://explorer.lens.xyz/tx/${nft.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center text-sm hover:underline"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      {shortenAddress(nft.transactionHash)}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
