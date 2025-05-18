import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PopularNFT {
  id: number;
  name: string;
  count: number;
  rarity: string;
  icon: string;
}

export default function PopularNFTs() {
  const [nfts, setNfts] = useState<PopularNFT[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPopularNFTs = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/nfts/popular');
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular NFTs');
        }
        
        const data = await response.json();
        setNfts(data);
      } catch (error) {
        console.error("Error fetching popular NFTs:", error);
        // Use placeholder data
        setNfts([
          {
            id: 1,
            name: "100 Day Contribution Streak",
            count: 12,
            rarity: "Legendary",
            icon: "fa-trophy"
          },
          {
            id: 2,
            name: "Open Source Maintainer",
            count: 28,
            rarity: "Epic",
            icon: "fa-star"
          },
          {
            id: 3,
            name: "Pull Request Champion",
            count: 47,
            rarity: "Rare",
            icon: "fa-code-branch"
          },
          {
            id: 4,
            name: "Bug Hunter",
            count: 65,
            rarity: "Common",
            icon: "fa-bug"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularNFTs();
  }, []);
  
  // Function to get appropriate color class based on rarity
  const getRarityColorClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "text-accent";
      case "epic":
        return "text-secondary";
      case "rare":
        return "text-primary";
      case "common":
      default:
        return "text-primary";
    }
  };
  
  // Function to get appropriate gradient class based on rarity
  const getGradientClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "bg-gradient-to-br from-primary to-accent";
      case "epic":
        return "bg-gradient-to-br from-secondary to-primary";
      case "rare":
        return "bg-gradient-to-br from-accent to-secondary";
      case "common":
      default:
        return "bg-gradient-to-br from-primary to-secondary";
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display font-bold text-lg">Popular NFTs</h3>
        </div>
        <div className="p-4 flex justify-center items-center h-48">
          <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-display font-bold text-lg">Popular NFTs</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${getGradientClass(nft.rarity)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${nft.icon} text-white`}></i>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{nft.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Owned by {nft.count} developers</div>
              </div>
              <div className={`${getRarityColorClass(nft.rarity)} font-medium text-sm`}>{nft.rarity}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/explore">
            <Button variant="link" className="text-primary hover:text-primary/90 text-sm font-medium">
              View All NFTs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
