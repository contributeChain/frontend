import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fetchNFTs } from "@/lib/grove-service";
import type { NFT } from "@/lib/grove-service";

interface PopularNFT {
  id: number;
  name: string;
  count: number;
  rarity: string;
  icon: string;
}

export default function PopularNFTs() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPopularNFTs = async () => {
      setLoading(true);
      
      try {
        // Fetch NFTs from Grove
        const allNfts = await fetchNFTs();
        // Sort by most recent first (assuming newer NFTs are more popular)
        const sortedNfts = allNfts.sort((a, b) => 
          b.mintedAt.getTime() - a.mintedAt.getTime()
        ).slice(0, 5); // Take top 5
        
        setNfts(sortedNfts);
      } catch (error) {
        console.error("Error fetching popular NFTs from Grove:", error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularNFTs();
  }, []);
  
  // Function to get appropriate color class based on NFT ID (as a substitute for rarity)
  const getRarityColorClass = (id: number) => {
    const rarities = ["legendary", "epic", "rare", "common", "common"];
    const rarity = rarities[id % rarities.length];
    
    switch (rarity) {
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
  
  // Function to get appropriate gradient class based on NFT ID
  const getGradientClass = (id: number) => {
    const rarities = ["legendary", "epic", "rare", "common", "common"];
    const rarity = rarities[id % rarities.length];
    
    switch (rarity) {
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
  
  // Function to get icon based on NFT ID
  const getIcon = (id: number) => {
    const icons = ["fa-trophy", "fa-star", "fa-code-branch", "fa-bug", "fa-code"];
    return icons[id % icons.length];
  };
  
  // Function to get rarity based on NFT ID
  const getRarity = (id: number) => {
    const rarities = ["Legendary", "Epic", "Rare", "Common", "Common"];
    return rarities[id % rarities.length];
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
  
  // If there are no NFTs to display, show a message
  if (nfts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display font-bold text-lg">Popular NFTs</h3>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No NFTs found.</p>
          <p className="text-sm mt-2">Check back soon!</p>
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
              <div className={`w-10 h-10 ${getGradientClass(nft.id)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${getIcon(nft.id)} text-white`}></i>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{nft.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Token ID: {nft.tokenId}
                </div>
              </div>
              <div className={`${getRarityColorClass(nft.id)} font-medium text-sm`}>
                {nft.rarity || getRarity(nft.id)}
              </div>
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
