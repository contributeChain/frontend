import { RainbowKitButton, CustomRainbowKitButton } from "./RainbowKitButton";

interface WalletConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WalletConnectButton({ size = 'md', className }: WalletConnectButtonProps = {}) {
  // Apply responsive size classes based on the size prop
  const sizeClasses = {
    sm: "text-xs py-1 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-5"
  };

  const combinedClasses = `${sizeClasses[size]} ${className || ''}`;
  
  // Now using RainbowKit instead of the temporary placeholder
  return <CustomRainbowKitButton className={combinedClasses} />;
}
