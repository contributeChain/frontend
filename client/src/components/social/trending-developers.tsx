import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TrendingDevelopers() {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/developers/trending');
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending developers');
        }
        
        const data = await response.json();
        setDevelopers(data);
      } catch (error) {
        console.error("Error fetching trending developers:", error);
        // Use placeholder data
        setDevelopers([
          {
            id: 1,
            username: "Sarah Chen",
            githubUsername: "sarahcodes",
            avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            reputation: 876,
            password: "",
          },
          {
            id: 2,
            username: "Alex Rivera",
            githubUsername: "alexdev",
            avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            reputation: 742,
            password: "",
          },
          {
            id: 3,
            username: "Michael Thompson",
            githubUsername: "mthompson",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            reputation: 685,
            password: "",
          },
          {
            id: 4,
            username: "Maya Johnson",
            githubUsername: "mayacodes",
            avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            reputation: 524,
            password: "",
          },
          {
            id: 5,
            username: "David Kim",
            githubUsername: "davidkim",
            avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
            reputation: 489,
            password: "",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevelopers();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-display font-bold text-lg">Trending Developers</h3>
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
        <h3 className="font-display font-bold text-lg">Trending Developers</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {developers.map((developer) => (
            <div key={developer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${developer.githubUsername}`}>
                  <img 
                    src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}`} 
                    alt={`${developer.username} profile picture`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div>
                  <Link href={`/profile/${developer.githubUsername}`}>
                    <div className="font-medium text-sm">{developer.username}</div>
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{developer.reputation} reputation</div>
                </div>
              </div>
              <Button 
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                variant="ghost"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/explore">
            <Button variant="link" className="text-primary hover:text-primary/90 text-sm font-medium">
              View All Developers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
