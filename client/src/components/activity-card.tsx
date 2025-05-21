import { formatTimeAgo } from "@/lib/utils";
import { Activity, User } from "@shared/schema";
import { Link } from "wouter";
import { shortenAddress } from "@/lib/utils";
import { useState } from "react";
import { lensService } from "@/services/lens";
import { useToast } from "@/hooks/use-toast";
import { LensPostMetadata } from "@/types/lens";

interface ActivityCardProps {
  activity: Activity;
  user: User;
}

export default function ActivityCard({ activity, user }: ActivityCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 20));
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 1);
  const { toast } = useToast();
  
  // Cast metadata to our type to help TypeScript
  const metadata = activity.metadata as LensPostMetadata;
  
  // Handle like action
  const handleLike = async () => {
    try {
      if (activity.type === "lens_post" && metadata.lensPostId) {
        const result = await lensService.likePost("0x1234", metadata.lensPostId);
        
        if (result.success) {
          setIsLiked(!isLiked);
          setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
          
          toast({
            title: isLiked ? "Post unliked" : "Post liked",
            description: isLiked ? "You've unliked this post" : "You've liked this post",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to like post",
            variant: "destructive"
          });
        }
      } else {
        // For non-Lens posts, just toggle the like state
        setIsLiked(!isLiked);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      if (activity.type === "lens_post" && metadata.lensPostId) {
        const result = await lensService.commentOnPost("0x1234", metadata.lensPostId, commentText);
        
        if (result.success) {
          setCommentText("");
          setIsCommenting(false);
          setCommentCount(prevCount => prevCount + 1);
          
          toast({
            title: "Comment posted",
            description: "Your comment has been posted successfully",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to post comment",
            variant: "destructive"
          });
        }
      } else {
        // For non-Lens posts, just update the UI
        setCommentText("");
        setIsCommenting(false);
        setCommentCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    }
  };
  
  // Handle share action
  const handleShare = async () => {
    try {
      if (activity.type === "lens_post" && metadata.lensPostId) {
        const result = await lensService.sharePost("0x1234", metadata.lensPostId);
        
        if (result.success) {
          toast({
            title: "Post shared",
            description: "You've shared this post on Lens",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to share post",
            variant: "destructive"
          });
        }
      } else {
        // For non-Lens posts, just show a toast
        toast({
          title: "Post shared",
          description: "Post link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };
  
  // Get activity icon based on activity type
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'commit':
        return 'fa-code-commit';
      case 'nft_mint':
        return metadata.rarity === 'legendary' ? 'fa-trophy' : 'fa-award';
      case 'repo_create':
        return 'fa-star';
      case 'pull_request':
        return 'fa-code-branch';
      case 'issue':
        return 'fa-exclamation-circle';
      case 'lens_post':
        return 'fa-pen-fancy';
      default:
        return 'fa-check-circle';
    }
  };
  
  // Get activity icon color class based on activity type
  const getActivityIconColorClass = () => {
    switch (activity.type) {
      case 'commit':
        return 'bg-primary/10 text-primary';
      case 'nft_mint':
        return 'bg-accent/10 text-accent';
      case 'repo_create':
        return 'bg-secondary/10 text-secondary';
      case 'pull_request':
        return 'bg-primary/10 text-primary';
      case 'issue':
        return 'bg-destructive/10 text-destructive';
      case 'lens_post':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };
  
  // Get activity title based on activity type
  const getActivityTitle = () => {
    switch (activity.type) {
      case 'commit':
        return `Contributed to <span class="text-primary">${activity.repoName}</span>`;
      case 'nft_mint':
        return `Earned NFT <span class="text-accent">${metadata.name || 'NFT'}</span>`;
      case 'repo_create':
        return `Created repository <span class="text-secondary">${activity.repoName}</span>`;
      case 'pull_request':
        return `Opened pull request in <span class="text-primary">${activity.repoName}</span>`;
      case 'issue':
        return `Opened issue in <span class="text-destructive">${activity.repoName}</span>`;
      case 'lens_post':
        return `Posted on Lens`;
      default:
        return activity.description || 'Unknown activity';
    }
  };
  
  // Generate appropriate activity content based on activity type
  const renderActivityContent = () => {
    switch (activity.type) {
      case 'commit':
        return (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-code-branch text-primary text-sm"></i>
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.repoName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</div>
              </div>
              {activity.repoName && (
                <Link href={`/repositories/${activity.repoName}`}>
                  <a className="text-primary hover:text-primary/90 text-sm font-medium">View</a>
                </Link>
              )}
            </div>
          </div>
        );
      case 'nft_mint':
        return (
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <i className={`fas ${metadata.icon || 'fa-award'} text-white text-xl`}></i>
            </div>
            <div>
              <div className="font-medium">{metadata.name || 'NFT Minted'}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</div>
              {metadata.transactionHash && (
                <div className="mt-1 flex items-center text-xs">
                  <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-1">
                    <i className="fas fa-link text-gray-500"></i>
                    <span className="font-mono">{shortenAddress(metadata.transactionHash || '0x0')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'lens_post':
        return (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-pen-fancy text-green-500 text-sm"></i>
              </div>
              <div className="flex-1">
                <div className="font-medium">Lens Post</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</div>
              </div>
              {metadata.lensPostId && (
                <a 
                  href={`https://testnet.lenster.xyz/posts/${metadata.lensPostId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-600 text-sm font-medium"
                >
                  View on Lens
                </a>
              )}
            </div>
          </div>
        );
      case 'repo_create':
      case 'pull_request':
      case 'issue':
      default:
        return null;
    }
  };
  
  // Get activity tags based on metadata
  const getActivityTags = () => {
    const tags = [];
    
    if (metadata.tags) {
      return metadata.tags;
    }
    
    // Generate some default tags based on activity type
    if (activity.type === 'commit') {
      tags.push({ name: metadata.language || 'code', color: 'primary' });
      if (metadata.type) {
        tags.push({ name: metadata.type, color: 'secondary' });
      }
    } else if (activity.type === 'nft_mint') {
      tags.push({ name: metadata.rarity || 'nft', color: 'accent' });
      tags.push({ name: 'blockchain', color: 'primary' });
    } else if (activity.type === 'repo_create') {
      tags.push({ name: metadata.language || 'repository', color: 'secondary' });
      if (metadata.topic) {
        tags.push({ name: metadata.topic, color: 'accent' });
      }
    } else if (activity.type === 'lens_post') {
      tags.push({ name: 'lens', color: 'accent' });
      tags.push({ name: 'social', color: 'primary' });
    }
    
    return tags;
  };
  
  // Get tag color class based on tag color
  const getTagColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'secondary':
        return 'bg-secondary/10 text-secondary';
      case 'accent':
        return 'bg-accent/10 text-accent';
      case 'destructive':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
            alt={`${user.username} profile picture`}
            className="w-10 h-10 rounded-full object-cover" 
          />
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between mb-2">
              <div>
                <span className="font-medium">{user.username}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">@{user.githubUsername || user.username}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activity.createdAt ? formatTimeAgo(activity.createdAt) : 'Recently'}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: activity.description || getActivityTitle() }}></p>
            
            {renderActivityContent()}
            
            {isCommenting && (
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-primary text-white rounded-lg"
                  >
                    Post
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCommenting(false)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:text-red-500`}
                  onClick={handleLike}
                >
                  <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
                  <span>{likeCount}</span>
                </button>
                <button 
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary"
                  onClick={() => setIsCommenting(!isCommenting)}
                >
                  <i className="far fa-comment"></i>
                  <span>{commentCount}</span>
                </button>
                <button 
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary"
                  onClick={handleShare}
                >
                  <i className="far fa-share-square"></i>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {getActivityTags().map((tag, index) => (
                  <div key={index} className={`px-2 py-1 ${getTagColorClass(tag.color)} rounded-full text-xs`}>
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
