import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around py-3">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === "/" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-home"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/explore">
          <a className={`flex flex-col items-center ${location === "/explore" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-search"></i>
            <span className="text-xs mt-1">Explore</span>
          </a>
        </Link>
        <Link href="/repositories">
          <a className={`flex flex-col items-center ${location === "/repositories" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-code-branch"></i>
            <span className="text-xs mt-1">Repos</span>
          </a>
        </Link>
        <Link href="/mint-nft">
          <a className={`flex flex-col items-center ${location === "/mint-nft" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-award"></i>
            <span className="text-xs mt-1">Mint</span>
          </a>
        </Link>
        <Link href="/social">
          <a className={`flex flex-col items-center ${location === "/social" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-users"></i>
            <span className="text-xs mt-1">Social</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center ${location.startsWith("/profile") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <i className="fas fa-user"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
