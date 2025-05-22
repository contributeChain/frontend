import { useState, useEffect } from "react";
import { getContributionColorClass } from "@/lib/github-utils";
import { getUserStatistics } from "@/lib/githubClient";
import type { CommitsByDate } from "@/lib/githubClient";

interface ContributionGridProps {
  username: string;
  year?: number;
}

interface MonthLabel {
  name: string;
  index: number;
}

const MONTHS: MonthLabel[] = [
  { name: "Jan", index: 0 },
  { name: "Feb", index: 1 },
  { name: "Mar", index: 2 },
  { name: "Apr", index: 3 },
  { name: "May", index: 4 },
  { name: "Jun", index: 5 },
  { name: "Jul", index: 6 },
  { name: "Aug", index: 7 },
  { name: "Sep", index: 8 },
  { name: "Oct", index: 9 },
  { name: "Nov", index: 10 },
  { name: "Dec", index: 11 },
];

export default function ContributionGrid({ username, year = new Date().getFullYear() }: ContributionGridProps) {
  const [contributions, setContributions] = useState<CommitsByDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserStatistics(username);
        // Filter contributions for the selected year
        const filteredData = data.commitsByDate.filter((contribution: CommitsByDate) => {
          const contributionYear = new Date(contribution.date).getFullYear();
          return contributionYear === year;
        });
        
        setContributions(filteredData);
      } catch (err) {
        setError("Failed to load contribution data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchData();
    }
  }, [username, year]);
  
  const generateCalendarCells = () => {
    const cells = [];
    const today = new Date();
    
    // Generate a full year of data (52 weeks x 7 days)
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        // Find the contribution for this date if it exists
        const date = new Date(year, 0, 1);
        date.setDate(date.getDate() + (week * 7) + day);
        
        // Skip future dates
        if (date > today) {
          cells.push(
            <div 
              key={`${week}-${day}`} 
              className="contribution-cell bg-gray-100 dark:bg-gray-800/30"
              aria-label="No data"
            />
          );
          continue;
        }
        
        // Format date as ISO string and find matching contribution
        const dateString = date.toISOString().split('T')[0];
        const contribution = contributions.find(c => c.date === dateString);
        
        const count = contribution ? contribution.count : 0;
        const colorClass = getContributionColorClass(count);
        
        cells.push(
          <div 
            key={`${week}-${day}`} 
            className={`contribution-cell ${colorClass}`}
            aria-label={`${count} contributions on ${dateString}`}
            title={`${count} contributions on ${dateString}`}
          />
        );
      }
    }
    
    return cells;
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-32">
          <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-32 text-red-500">
          <i className="fas fa-exclamation-circle mr-2"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        {MONTHS.map(month => (
          <div key={month.name}>{month.name}</div>
        ))}
      </div>
      
      <div className="contribution-grid overflow-hidden">
        {generateCalendarCells()}
      </div>
      
      <div className="mt-3 flex justify-end items-center gap-2 text-xs">
        <div className="text-gray-500 dark:text-gray-400">Less</div>
        <div className="w-3 h-3 bg-primary/10 rounded-sm"></div>
        <div className="w-3 h-3 bg-primary/30 rounded-sm"></div>
        <div className="w-3 h-3 bg-primary/50 rounded-sm"></div>
        <div className="w-3 h-3 bg-primary/70 rounded-sm"></div>
        <div className="w-3 h-3 bg-primary rounded-sm"></div>
        <div className="text-gray-500 dark:text-gray-400">More</div>
      </div>
    </div>
  );
}
