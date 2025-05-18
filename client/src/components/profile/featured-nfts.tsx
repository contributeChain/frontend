import { useState, useEffect } from "react";
import { fetchNFTsForWallet, NFT } from "@/lib/web3-utils";
import NFTCard from "@/components/nft-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface FeaturedNFTsProps {
  walletAddress?: string;
}

export default function FeaturedNFTs({ walletAddress }: FeaturedNFTsProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedNfts = await fetchNFTsForWallet(walletAddress);
        setNfts(fetchedNfts.slice(0, 4)); // Just take the first 4 for featured display
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
  }, [walletAddress]);
  
  // Generate placeholder NFTs if none are found or if we're still loading
  const getDisplayNFTs = () => {
    if (loading) {
      return Array(4).fill(null).map((_, index) => ({
        id: index,
        tokenId: "",
        name: "Loading...",
        description: "Please wait",
        imageUrl: "",
        rarity: "common" as const,
        mintedAt: new Date(),
      }));
    }
    
    if (nfts.length === 0) {
      return [
        {
          id: 1,
          tokenId: "COMMIT-7834",
          name: "COMMIT-7834",
          description: "React Component Library",
          imageUrl: "",
          rarity: "rare" as const,
          mintedAt: new Date(2023, 4), // May 2023
        },
        {
          id: 2,
          tokenId: "STREAK-30",
          name: "STREAK-30",
          description: "30 Day Commit Streak",
          imageUrl: "",
          rarity: "epic" as const,
          mintedAt: new Date(2023, 5), // June 2023
        },
        {
          id: 3,
          tokenId: "PR-MERGE-42",
          name: "PR-MERGE-42",
          description: "Major Feature Merge",
          imageUrl: "",
          rarity: "common" as const,
          mintedAt: new Date(2023, 6), // July 2023
        },
        {
          id: 4,
          tokenId: "",
          name: "NEW NFT",
          description: "Keep contributing!",
          imageUrl: "",
          rarity: "common" as const,
          mintedAt: new Date(),
        }
      ];
    }
    
    return nfts;
  };
  
  return (
    <div>
      <h4 className="font-display font-bold text-lg mb-4">Featured NFTs</h4>
      <div className="grid grid-cols-2 gap-4">
        {getDisplayNFTs().map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Link href={walletAddress ? `/nfts/${walletAddress}` : "/explore"}>
          <Button variant="link" className="text-primary hover:text-primary/90 text-sm font-medium flex items-center gap-1">
            <span>View all {nfts.length > 0 ? nfts.length : "NFTs"}</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Button>
        </Link>
      </div>
    </div>
  );
}
