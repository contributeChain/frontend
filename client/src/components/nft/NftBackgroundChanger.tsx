import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/lib/groveClient';

// Background templates for NFTs
const BACKGROUND_TEMPLATES = [
  { 
    name: 'Gradient Blue', 
    colors: ['#1a365d', '#2a4365', '#2c5282', '#2b6cb0'],
    type: 'gradient'
  },
  { 
    name: 'Gradient Purple', 
    colors: ['#44337a', '#553c9a', '#6b46c1', '#805ad5'],
    type: 'gradient'
  },
  { 
    name: 'Gradient Green', 
    colors: ['#22543d', '#276749', '#2f855a', '#38a169'],
    type: 'gradient'
  },
  { 
    name: 'Neon Gradient', 
    colors: ['#4a00e0', '#8e2de2'],
    type: 'gradient'
  },
  { 
    name: 'Abstract Code', 
    colors: ['#1a202c', '#2d3748'],
    type: 'pattern',
    patternType: 'code'
  },
  { 
    name: 'Circuit Board', 
    colors: ['#1a202c', '#4a5568'],
    type: 'pattern',
    patternType: 'circuit'
  },
  { 
    name: 'Space Particles', 
    colors: ['#1a1a2e', '#16213e'],
    type: 'pattern',
    patternType: 'particles'
  }
];

interface NftBackgroundChangerProps {
  repositoryName: string;
  contributorName: string;
  contributionScore: number;
  rarityTier: { name: string; color: string };
  onImageGenerated: (imageUrl: string, imageBlob: Blob) => void;
  accountAddress: `0x${string}`;
  contributionStats: any;
  onCancel: () => void;
}

export default function NftBackgroundChanger({
  repositoryName,
  contributorName,
  contributionScore,
  rarityTier,
  onImageGenerated,
  accountAddress,
  contributionStats,
  onCancel
}: NftBackgroundChangerProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Update canvas size based on container size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const size = Math.min(containerWidth, 500); // Max size of 500
        setCanvasSize({ width: size, height: size });
      }
    };

    // Initial size
    updateCanvasSize();
    
    // Update on resize
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // Draw the canvas when inputs change
  useEffect(() => {
    drawCanvas();
  }, [
    selectedBackground,
    canvasSize
  ]);
  
  // Draw pattern based on pattern type
  const drawPattern = (ctx: CanvasRenderingContext2D, patternType: string | undefined, colors: string[]) => {
    const { width, height } = canvasSize;
    const primary = colors[0];
    const secondary = colors[1];
    
    if (patternType === 'code') {
      // Draw code-like pattern
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = secondary;
      ctx.font = `${width/50}px monospace`;
      
      for (let i = 0; i < 50; i++) {
        const y = i * (height/25);
        const length = Math.floor(Math.random() * 10) + 5;
        let line = '';
        
        for (let j = 0; j < length; j++) {
          line += Math.random() > 0.5 ? '1' : '0';
        }
        
        ctx.fillText(line, width/25, y + height/25);
      }
    } else if (patternType === 'circuit') {
      // Draw circuit-like pattern
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = secondary;
      ctx.lineWidth = width/250;
      
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Create random paths
        for (let j = 0; j < 5; j++) {
          const newX = x + (Math.random() * width/2.5 - width/5);
          const newY = y + (Math.random() * height/2.5 - height/5);
          ctx.lineTo(newX, newY);
        }
        
        ctx.stroke();
      }
      
      // Add circuit nodes
      ctx.fillStyle = secondary;
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = width/100 + Math.random() * width/100;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (patternType === 'particles') {
      // Create particle pattern with depth illusion
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(1, secondary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add floating particles
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = width/500 + Math.random() * width/125;
        const opacity = 0.2 + Math.random() * 0.6;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Default pattern if type is undefined
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, width, height);
      
      // Add a subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      const tileSize = width/50;
      for (let i = 0; i < width; i += tileSize*2) {
        for (let j = 0; j < height; j += tileSize*2) {
          if ((i + j) % (tileSize*4) === 0) {
            ctx.fillRect(i, j, tileSize, tileSize);
          }
        }
      }
    }
  };
  
  // Draw gradient background
  const drawGradient = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    const { width, height } = canvasSize;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };
  
  // Draw text information
  const drawText = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize;
    const fontSize = width / 25;
    const smallFontSize = width / 31.25;
    
    // Repository name
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(repositoryName, width / 2, height / 10);
    
    // Contributor name
    ctx.font = `${smallFontSize}px sans-serif`;
    ctx.fillText(`Contributor: ${contributorName}`, width / 2, height / 6);
    
    // Stats
    const statY = height - height / 4;
    const statSpacing = width / 5;
    
    ctx.font = `${smallFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    
    // Score
    ctx.fillText(`Score: ${contributionScore}`, width / 2, statY);
    
    // Commits & PRs
    ctx.fillText(`Commits: ${contributionStats.commits}`, width / 2 - statSpacing, statY + smallFontSize * 1.5);
    ctx.fillText(`PRs: ${contributionStats.pullRequests}`, width / 2 + statSpacing, statY + smallFontSize * 1.5);
    
    // Additions & Deletions
    ctx.fillText(`+${contributionStats.additions}`, width / 2 - statSpacing, statY + smallFontSize * 3);
    ctx.fillText(`-${contributionStats.deletions}`, width / 2 + statSpacing, statY + smallFontSize * 3);
    
    // Rarity badge
    const badgeWidth = width / 4;
    const badgeHeight = height / 16;
    const badgeX = width - badgeWidth - width / 50;
    const badgeY = height / 50;
    
    ctx.fillStyle = rarityTier.color;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${smallFontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(rarityTier.name, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + smallFontSize / 3);
  };
  
  // Main function to draw the entire canvas
  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw background
    const bgTemplate = BACKGROUND_TEMPLATES[selectedBackground];
    if (bgTemplate.type === 'gradient') {
      drawGradient(ctx, bgTemplate.colors);
    } else if (bgTemplate.type === 'pattern') {
      drawPattern(ctx, bgTemplate.patternType, bgTemplate.colors);
    }
    
    // Draw text information with stats
    drawText(ctx);
  };
  
  // Generate final image and pass to parent component
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Upload to Grove storage
            const file = new File([blob], `nft-${repositoryName}-${Date.now()}.png`, { type: 'image/png' });
            const uploadResult = await uploadFile(file, accountAddress);
            
            console.log('Uploaded NFT image:', uploadResult);
            
            // Pass the image URL and blob back to parent
            onImageGenerated(uploadResult.uri, blob);
          } catch (error) {
            console.error('Error uploading NFT image:', error);
          } finally {
            setIsGenerating(false);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Change Background</h3>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div 
            ref={canvasContainerRef}
            className="border border-gray-300 rounded-lg overflow-hidden mb-4 w-full flex items-center justify-center"
          >
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto aspect-square"
            />
          </div>
          
          <div>
            <Label>Background Style</Label>
            <Select 
              value={selectedBackground.toString()} 
              onValueChange={(value) => setSelectedBackground(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUND_TEMPLATES.map((bg, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {bg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateImage} 
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Apply Background'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 