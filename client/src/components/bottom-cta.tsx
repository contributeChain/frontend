import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { connectGitHub } from "@/lib/github-utils";

export default function BottomCTA() {
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
    <section className="py-16 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Ready to build your developer reputation?</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
          Connect your GitHub account today and start transforming your code contributions into valuable NFTs on Lens Chain.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg justify-center"
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
          <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-lg flex items-center gap-2 justify-center">
            <i className="fas fa-info-circle"></i>
            <span>Learn More</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
