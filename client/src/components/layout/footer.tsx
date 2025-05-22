import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <i className="fas fa-code text-white text-sm"></i>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">DevCred</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Transform your GitHub contributions into valuable NFTs and build your developer reputation on the blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-discord"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-telegram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-primary">Features</Link></li>
              <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-primary">Developers</Link></li>
              <li><Link href="/repositories" className="text-gray-600 dark:text-gray-400 hover:text-primary">Repositories</Link></li>
              <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-primary">NFT Gallery</Link></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Documentation</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">API Reference</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">GitHub Integration</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Lens Chain</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">About</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Team</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Careers</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DevCred. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
