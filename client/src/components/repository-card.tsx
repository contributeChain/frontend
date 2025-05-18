import { Link } from "wouter";
import { Repository } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";

interface RepositoryCardProps {
  repository: Repository;
  username: string;
}

export default function RepositoryCard({ repository, username }: RepositoryCardProps) {
  // Get repository icon based on the repository language or name
  const getRepositoryIcon = () => {
    const language = repository.language?.toLowerCase() || '';
    
    if (language.includes('react') || repository.name.toLowerCase().includes('react')) {
      return 'fa-react';
    } else if (language.includes('node') || repository.name.toLowerCase().includes('node')) {
      return 'fa-node-js';
    } else if (language.includes('javascript') || language.includes('js')) {
      return 'fa-js';
    } else if (language.includes('typescript') || language.includes('ts')) {
      return 'fa-code';
    } else if (language.includes('python') || language.includes('py')) {
      return 'fa-python';
    } else if (language.includes('blockchain') || repository.name.toLowerCase().includes('blockchain')) {
      return 'fa-code';
    } else if (language.includes('web3') || repository.name.toLowerCase().includes('web3')) {
      return 'fa-layer-group';
    } else if (language.includes('defi') || repository.name.toLowerCase().includes('defi')) {
      return 'fa-layer-group';
    } else {
      return 'fa-code';
    }
  };

  // Get repository tag based on the repository language or name
  const getRepositoryTag = () => {
    const language = repository.language?.toLowerCase() || '';
    
    if (language.includes('react') || repository.name.toLowerCase().includes('react')) {
      return 'React';
    } else if (language.includes('web3') || repository.name.toLowerCase().includes('web3')) {
      return 'Web3';
    } else if (language.includes('blockchain') || repository.name.toLowerCase().includes('blockchain')) {
      return 'Blockchain';
    } else if (language.includes('defi') || repository.name.toLowerCase().includes('defi')) {
      return 'DeFi';
    } else if (language) {
      return repository.language;
    } else {
      return 'Other';
    }
  };

  // Get tag color class based on tag
  const getTagColorClass = () => {
    const tag = getRepositoryTag().toLowerCase();
    
    if (tag === 'react') {
      return 'bg-secondary/10 text-secondary';
    } else if (tag === 'web3') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'blockchain') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'defi') {
      return 'bg-accent/10 text-accent';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  // Get icon color class based on tag
  const getIconColorClass = () => {
    const tag = getRepositoryTag().toLowerCase();
    
    if (tag === 'react') {
      return 'bg-secondary/10 text-secondary';
    } else if (tag === 'web3' || tag === 'blockchain') {
      return 'bg-primary/10 text-primary';
    } else if (tag === 'defi') {
      return 'bg-accent/10 text-accent';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/20">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${getIconColorClass()} rounded-full flex items-center justify-center`}>
              <i className={`fas ${getRepositoryIcon()}`}></i>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{repository.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">by {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`text-xs px-2 py-1 ${getTagColorClass()} rounded-full`}>
              {getRepositoryTag()}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {repository.description || "No description provided."}
        </p>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <i className="fas fa-star"></i>
              <span>{repository.stars}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <i className="fas fa-code-branch"></i>
              <span>{repository.forks}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-medium">
            <i className="fas fa-certificate text-xs"></i>
            <span>{repository.nftCount} NFTs</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Updated {formatTimeAgo(repository.lastUpdated)}</span>
          </div>
          <Link href={`/repositories/${repository.id}`}>
            <a className="text-primary hover:text-primary/90 text-sm font-medium">View Details</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
