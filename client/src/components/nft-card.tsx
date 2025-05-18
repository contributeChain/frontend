import { NFT } from "@/lib/web3-utils";
import { formatDate, shortenAddress } from "@/lib/utils";

interface NFTCardProps {
  nft: NFT;
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
}

export default function NFTCard({ nft, size = "medium", className = "", onClick }: NFTCardProps) {
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
    switch (nft.rarity) {
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
    switch (nft.rarity) {
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
    switch (nft.rarity) {
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
  
  const cardClasses = `${getBackgroundGradient()} border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300 nft-card ${className}`;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="aspect-square relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-accent opacity-20"></div>
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-lg">
            <i className={`fas ${getIcon()} ${getRarityColor()}`}></i>
          </div>
          <div className="text-center">
            <div className="font-mono text-xs font-bold mb-1">{nft.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{nft.description}</div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Minted: {formatDate(nft.mintedAt)}
          </div>
          <div className={`flex items-center text-xs font-medium ${getRarityColor()}`}>
            <i className={`fas ${getRarityIcon()} mr-1`}></i>
            <span className="capitalize">{nft.rarity}</span>
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
  );
}
