import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "wouter";
import { getActivitiesByUserId } from "@/lib/grove-service";
import type { Activity, User } from "@/lib/grove-service";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  user: User;
}

export default function RecentActivity({ user }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 5;
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user.id) return;
      
      setLoading(true);
      
      try {
        // Fetch activities from Grove
        const userActivities = await getActivitiesByUserId(user.id);
        setActivities(userActivities);
      } catch (error) {
        console.error("Error fetching activities from Grove:", error);
        toast({
          title: "Error",
          description: "Failed to load recent activities. Please try again later.",
          variant: "destructive",
        });
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [user, toast]);
  
  // Get current activities for pagination
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(activities.length / activitiesPerPage);
  
  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-6 gap-2">
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="h-8 w-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Button>
        
        <div className="flex items-center text-sm">
          Page {currentPage} of {totalPages}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="h-8 w-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Button>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
      </div>
    );
  }
  
  // If no activities, show empty state
  if (activities.length === 0) {
    return (
      <>
        <h4 className="font-display font-bold text-lg mb-4">Recent Activity</h4>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
        </div>
      </>
    );
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commit":
        return "fa-code-commit";
      case "mint":
        return "fa-award";
      case "fork":
        return "fa-code-branch";
      case "star":
        return "fa-star";
      case "follow":
        return "fa-user-plus";
      default:
        return "fa-check-circle";
    }
  };
  
  const getIconClass = (type: string) => {
    switch (type) {
      case "commit":
        return "bg-primary/10 text-primary";
      case "mint":
        return "bg-accent/10 text-accent";
      case "fork":
        return "bg-secondary/10 text-secondary";
      case "star":
        return "bg-yellow-500/10 text-yellow-500";
      case "follow":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-500";
    }
  };
  
  return (
    <>
      <h4 className="font-display font-bold text-lg mb-4">Recent Activity</h4>
      <div className="space-y-3">
        {currentActivities.map((activityItem) => (
          <div key={activityItem.activity.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-3 items-start">
            <div className={`w-8 h-8 ${getIconClass(activityItem.activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${getActivityIcon(activityItem.activity.type)} text-sm`}></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium">
                  {activityItem.activity.repoName && (
                    <>Activity in <Link href={`/repositories/${activityItem.activity.repoName}`} className="text-primary">{activityItem.activity.repoName}</Link></>
                  )}
                  {!activityItem.activity.repoName && (
                    <>{activityItem.activity.description}</>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activityItem.activity.createdAt)}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activityItem.activity.description}</p>
              
              {activityItem.activity.metadata?.tags && (
                <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                  {activityItem.activity.metadata.tags.map((tag, idx) => (
                    <span key={idx} className={`px-2 py-1 bg-${tag.color || 'gray'}-100 dark:bg-${tag.color || 'gray'}-800 text-${tag.color || 'gray'}-500 rounded-full`}>{tag.name}</span>
                  ))}
                </div>
              )}
              
              {activityItem.activity.metadata?.transactionHash && (
                <div className="mt-2 flex items-center">
                  <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-1">
                    <i className="fas fa-link text-gray-500"></i>
                    <span className="font-mono">{activityItem.activity.metadata.transactionHash}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination controls */}
      <Pagination />
    </>
  );
}
