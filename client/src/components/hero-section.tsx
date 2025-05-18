import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { connectGitHub } from "@/lib/github-utils";
import { Link } from "wouter";

export default function HeroSection() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      const result = await connectGitHub();
      
      if (result.success) {
        toast({
          title: "GitHub Connected!",
          description: `Successfully connected GitHub account: ${result.username}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect GitHub account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting GitHub:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to GitHub.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Transform</span> your GitHub contributions into NFTs
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300">
              Build your developer reputation on the blockchain. Connect your GitHub account and turn your code commits into valuable NFTs on Lens Chain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20"
                onClick={handleConnectGitHub}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <i className="fab fa-github"></i>
                    <span>Connect GitHub</span>
                  </>
                )}
              </Button>
              <Link href="/explore">
                <Button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-darkText dark:text-lightText font-medium py-3 px-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <span>Explore NFTs</span>
                  <i className="fas fa-arrow-right"></i>
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-2 text-secondary"></i> 
                Secure on-chain credentials
              </span>
              <span className="mx-4">•</span>
              <span className="flex items-center">
                <i className="fas fa-code-branch mr-2 text-secondary"></i>
                Web3 developer identity
              </span>
            </div>
          </div>
          <div className="relative">
            {/* Dashboard mockup */}
            <img 
              src="https://images.unsplash.com/photo-1613068687893-5e85b4638b56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="DevCred NFT Dashboard" 
              className="rounded-2xl shadow-2xl shadow-primary/20 border border-white/20 dark:border-gray-800/50" 
            />
            
            {/* Floating elements */}
            <div className="absolute -top-5 -right-5 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg rotate-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-xs font-bold">102 commits → 2 NFTs</span>
              </div>
            </div>
            
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg -rotate-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-xs font-bold">Reputation Score: 432</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
