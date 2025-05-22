import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNetworkStore, NetworkType } from "@/config/network";
import { Network } from "lucide-react";

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetworkStore();
  const [open, setOpen] = useState(false);
  
  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    setOpen(false);
  };
  
  // Display colors based on network
  const getNetworkColor = () => {
    return network === "mainnet" ? "text-green-500" : "text-orange-500";
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Network className={`h-4 w-4 ${getNetworkColor()}`} />
          <span className="capitalize font-medium">
            {network === "mainnet" ? "Mainnet" : "Testnet"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className={network === "mainnet" ? "bg-secondary/10" : ""}
          onClick={() => handleNetworkChange("mainnet")}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Mainnet</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={network === "testnet" ? "bg-secondary/10" : ""}
          onClick={() => handleNetworkChange("testnet")}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Testnet</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 