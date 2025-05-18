import { Link } from "wouter";

interface TagInfo {
  name: string;
  colorClass: string;
}

export default function PopularTags() {
  // Popular tags with appropriate color classes
  const tags: TagInfo[] = [
    { name: "react", colorClass: "bg-primary/10 text-primary" },
    { name: "blockchain", colorClass: "bg-secondary/10 text-secondary" },
    { name: "web3", colorClass: "bg-accent/10 text-accent" },
    { name: "javascript", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "typescript", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "solidity", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "defi", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "nft", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "opensource", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "nodejs", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "python", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    { name: "golang", colorClass: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-display font-bold text-lg">Popular Tags</h3>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Link key={index} href={`/explore?tag=${tag.name}`}>
              <a className={`px-3 py-1 ${tag.colorClass} rounded-full text-sm hover:opacity-80 transition-opacity`}>
                {tag.name}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
