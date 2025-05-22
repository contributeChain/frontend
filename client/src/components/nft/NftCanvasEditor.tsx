import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadFile } from '@/lib/groveClient';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

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
  },
  { 
    name: 'Neon Gradient', 
    colors: ['#4a00e0', '#8e2de2'],
    type: 'gradient'
  }
];

// Icons for NFTs
const ICON_TEMPLATES = [
  { name: 'Code', icon: 'fa-code' },
  { name: 'Git Branch', icon: 'fa-code-branch' },
  { name: 'Commit', icon: 'fa-code-commit' },
  { name: 'Merge', icon: 'fa-code-merge' },
  { name: 'Pull Request', icon: 'fa-pull-request' },
  { name: 'Bug', icon: 'fa-bug' },
  { name: 'Star', icon: 'fa-star' },
  { name: 'Trophy', icon: 'fa-trophy' },
  { name: 'Fire', icon: 'fa-fire' },
  { name: 'Lightning', icon: 'fa-bolt' },
];

// Badge templates based on rarity
const BADGE_TEMPLATES = [
  { name: 'Common', color: '#718096' },
  { name: 'Uncommon', color: '#38A169' },
  { name: 'Rare', color: '#3182CE' },
  { name: 'Epic', color: '#9F7AEA' },
  { name: 'Legendary', color: '#ED8936' },
];

// Special effect types
const SPECIAL_EFFECTS = [
  { name: 'None', effect: 'none' },
  { name: 'Glow', effect: 'glow' },
  { name: 'Pixel', effect: 'pixel' },
  { name: 'Noise', effect: 'noise' },
  { name: 'Vignette', effect: 'vignette' }
];

interface NftCanvasEditorProps {
  repositoryName: string;
  contributorName: string;
  contributionScore: number;
  rarityTier: { name: string; color: string };
  onImageGenerated: (imageUrl: string, imageBlob: Blob) => void;
  accountAddress: `0x${string}`;
}

export default function NftCanvasEditor({
  repositoryName,
  contributorName,
  contributionScore,
  rarityTier,
  onImageGenerated,
  accountAddress
}: NftCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [iconColor, setIconColor] = useState('#ffffff');
  const [iconSize, setIconSize] = useState(100);
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [effectIntensity, setEffectIntensity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Draw the canvas when inputs change
  useEffect(() => {
    drawCanvas();
  }, [
    selectedBackground,
    selectedIcon,
    iconColor,
    iconSize,
    customText,
    customImage
  ]);
  
  // Initialize canvas on component mount
  useEffect(() => {
    drawCanvas();
  }, []);
  
  // Draw pattern based on pattern type
  const drawPattern = (ctx: CanvasRenderingContext2D, patternType: string | undefined, colors: string[]) => {
    const primary = colors[0];
    const secondary = colors[1];
    
    if (patternType === 'code') {
      // Draw code-like pattern
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = secondary;
      ctx.font = '10px monospace';
      
      for (let i = 0; i < 50; i++) {
        const y = i * 20;
        const length = Math.floor(Math.random() * 10) + 5;
        let line = '';
        
        for (let j = 0; j < length; j++) {
          line += Math.random() > 0.5 ? '1' : '0';
        }
        
        ctx.fillText(line, 20, y + 20);
      }
    } else if (patternType === 'circuit') {
      // Draw circuit-like pattern
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Create random paths
        for (let j = 0; j < 5; j++) {
          const newX = x + (Math.random() * 200 - 100);
          const newY = y + (Math.random() * 200 - 100);
          ctx.lineTo(newX, newY);
        }
        
        ctx.stroke();
      }
      
      // Add circuit nodes
      ctx.fillStyle = secondary;
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = 3 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (patternType === 'particles') {
      // Create particle pattern with depth illusion
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(1, secondary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Add floating particles
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = 1 + Math.random() * 4;
        const opacity = 0.2 + Math.random() * 0.6;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Default pattern if type is undefined
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Add a subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < CANVAS_WIDTH; i += 20) {
        for (let j = 0; j < CANVAS_HEIGHT; j += 20) {
          if ((i + j) % 40 === 0) {
            ctx.fillRect(i, j, 10, 10);
          }
        }
      }
    }
  };
  
  // Draw gradient background
  const drawGradient = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };
  
  // Draw the selected icon
  const drawIcon = (ctx: CanvasRenderingContext2D) => {
    const icon = ICON_TEMPLATES[selectedIcon];
    
    // Draw icon placeholder (in a real implementation, would use FontAwesome or similar)
    ctx.fillStyle = iconColor;
    ctx.font = `${iconSize}px FontAwesome`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add icon character (this is a placeholder, in real implementation would use actual FontAwesome icons)
    ctx.fillText(`[${icon.name}]`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  };
  
  // Draw text information
  const drawText = (ctx: CanvasRenderingContext2D) => {
    // Repository name
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(repositoryName, CANVAS_WIDTH / 2, 50);
    
    // Contributor name
    ctx.font = '16px sans-serif';
    ctx.fillText(`Contributor: ${contributorName}`, CANVAS_WIDTH / 2, 80);
    
    // Score
    ctx.font = '16px sans-serif';
    ctx.fillText(`Score: ${contributionScore}`, CANVAS_WIDTH / 2, 110);
    
    // Custom text (if any)
    if (customText) {
      ctx.font = '16px sans-serif';
      ctx.fillText(customText, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
    }
    
    // Rarity badge
    const badgeWidth = 120;
    const badgeHeight = 30;
    const badgeX = CANVAS_WIDTH - badgeWidth - 10;
    const badgeY = 10;
    
    ctx.fillStyle = rarityTier.color;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rarityTier.name, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 5);
  };
  
  // Draw custom image if uploaded
  const drawCustomImage = async (ctx: CanvasRenderingContext2D) => {
    if (customImage) {
      const img = new Image();
      img.src = URL.createObjectURL(customImage);
      
      return new Promise<void>((resolve) => {
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight;
          
          if (aspectRatio > 1) {
            drawWidth = 200;
            drawHeight = 200 / aspectRatio;
          } else {
            drawHeight = 200;
            drawWidth = 200 * aspectRatio;
          }
          
          const x = (CANVAS_WIDTH - drawWidth) / 2;
          const y = (CANVAS_HEIGHT - drawHeight) / 2;
          
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          URL.revokeObjectURL(img.src);
          resolve();
        };
      });
    }
  };
  
  // Apply special effects to canvas
  const applySpecialEffects = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const intensity = effectIntensity / 100; // Convert to 0-1 range
    
    switch (selectedEffect) {
      case 'glow':
        // Add glow effect
        ctx.shadowBlur = 20 * intensity;
        ctx.shadowColor = rarityTier.color;
        // Draw a semi-transparent overlay to enhance the glow
        ctx.fillStyle = `rgba(${parseInt(rarityTier.color.substring(1, 3), 16)}, ${parseInt(rarityTier.color.substring(3, 5), 16)}, ${parseInt(rarityTier.color.substring(5, 7), 16)}, ${0.1 * intensity})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
        
      case 'pixel':
        // Pixelate the canvas
        const pixelSize = Math.max(2, Math.floor(20 * intensity));
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        tempCanvas.width = CANVAS_WIDTH;
        tempCanvas.height = CANVAS_HEIGHT;
        
        // Draw original content to temp canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // Clear original canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw pixelated version
        for (let y = 0; y < CANVAS_HEIGHT; y += pixelSize) {
          for (let x = 0; x < CANVAS_WIDTH; x += pixelSize) {
            // Get the pixel data from the original image
            const imgData = tempCtx.getImageData(x, y, 1, 1);
            const r = imgData.data[0];
            const g = imgData.data[1];
            const b = imgData.data[2];
            const a = imgData.data[3];
            
            // Draw a rectangle with that color
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
        break;
        
      case 'noise':
        // Add noise overlay
        for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
          for (let x = 0; x < CANVAS_WIDTH; x += 2) {
            if (Math.random() < 0.5 * intensity) {
              const brightness = Math.random() * 255;
              ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.05)`;
              ctx.fillRect(x, y, 2, 2);
            }
          }
        }
        break;
        
      case 'vignette':
        // Add vignette effect
        const gradient = ctx.createRadialGradient(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.7 * intensity})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
        
      default:
        // No effect
        break;
    }
  };
  
  // Main function to draw the entire canvas
  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.shadowBlur = 0; // Reset shadow effects
    
    // Draw background
    const bgTemplate = BACKGROUND_TEMPLATES[selectedBackground];
    if (bgTemplate.type === 'gradient') {
      drawGradient(ctx, bgTemplate.colors);
    } else if (bgTemplate.type === 'pattern') {
      drawPattern(ctx, bgTemplate.patternType, bgTemplate.colors);
    }
    
    // Draw custom image if available
    await drawCustomImage(ctx);
    
    // Draw icon
    drawIcon(ctx);
    
    // Draw text information
    drawText(ctx);
    
    // Apply special effects
    applySpecialEffects(ctx);
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomImage(e.target.files[0]);
    }
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customize Your NFT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Canvas preview */}
          <div className="flex flex-col items-center">
            <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
              <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT}
                className="w-full h-auto"
              />
            </div>
            <Button 
              onClick={handleGenerateImage} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate NFT Image'}
            </Button>
          </div>
          
          {/* Customization controls */}
          <div>
            <Tabs defaultValue="background">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="icon">Icon</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="background" className="space-y-4">
                <div>
                  <Label>Background Template</Label>
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
              </TabsContent>
              
              <TabsContent value="icon" className="space-y-4">
                <div>
                  <Label>Icon Template</Label>
                  <Select 
                    value={selectedIcon.toString()} 
                    onValueChange={(value) => setSelectedIcon(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_TEMPLATES.map((icon, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {icon.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Icon Color</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Icon Size: {iconSize}px</Label>
                  <Slider
                    value={[iconSize]}
                    min={50}
                    max={200}
                    step={1}
                    onValueChange={(values) => setIconSize(values[0])}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label>Custom Text</Label>
                  <Input 
                    type="text" 
                    placeholder="Add your custom text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="space-y-4">
                <div>
                  <Label>Upload Custom Image</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>
                {customImage && (
                  <div className="text-sm text-gray-500">
                    Image uploaded: {customImage.name}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="effects" className="space-y-4">
                <div>
                  <Label>Special Effect</Label>
                  <Select 
                    value={selectedEffect} 
                    onValueChange={(value) => setSelectedEffect(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select effect" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIAL_EFFECTS.map((effect) => (
                        <SelectItem key={effect.effect} value={effect.effect}>
                          {effect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEffect !== 'none' && (
                  <div>
                    <Label>Effect Intensity: {effectIntensity}%</Label>
                    <Slider
                      value={[effectIntensity]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={(values) => setEffectIntensity(values[0])}
                      className="mt-2"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 