import { Router } from 'express';

const router = Router();

// Define SVG size
const SVG_WIDTH = 500;
const SVG_HEIGHT = 500;

// Background templates based on rarity
const BACKGROUNDS = {
  common: {
    colors: ['#718096', '#4A5568'],
  },
  uncommon: {
    colors: ['#38A169', '#2F855A'],
  },
  rare: {
    colors: ['#3182CE', '#2B6CB0'],
  },
  epic: {
    colors: ['#805AD5', '#6B46C1'],
  },
  legendary: {
    colors: ['#DD6B20', '#C05621'],
  }
};

/**
 * Generate NFT image as SVG based on parameters
 */
router.get('/generate', async (req, res) => {
  try {
    const { 
      repo = 'Unknown Repo', 
      contributor = 'Unknown',
      score = '0',
      rarity = 'common',
      color = '718096'
    } = req.query;

    // Sanitize inputs to prevent XSS
    const safeRepo = String(repo).replace(/[<>]/g, '').substring(0, 20);
    const safeContributor = String(contributor).replace(/[<>]/g, '').substring(0, 20);
    const safeScore = String(score).replace(/[^0-9]/g, '');
    const safeRarity = String(rarity).toLowerCase().replace(/[^a-z]/g, '');
    const safeColor = String(color).replace(/[^a-zA-Z0-9]/g, '');
    
    // Get background colors based on rarity
    const rarityKey = safeRarity as keyof typeof BACKGROUNDS;
    const bgColors = BACKGROUNDS[rarityKey]?.colors || BACKGROUNDS.common.colors;
    
    // Generate random dots for the background pattern
    let dots = '';
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * SVG_WIDTH);
      const y = Math.floor(Math.random() * SVG_HEIGHT);
      const size = 2 + Math.floor(Math.random() * 3);
      dots += `<circle cx="${x}" cy="${y}" r="${size}" fill="rgba(255, 255, 255, 0.03)" />`;
    }
    
    // Create SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgColors[0]}" />
            <stop offset="100%" stop-color="${bgColors[1]}" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="url(#bgGradient)" />
        
        <!-- Pattern overlay -->
        ${dots}
        
        <!-- Central icon circle -->
        <circle cx="${SVG_WIDTH/2}" cy="${SVG_HEIGHT/2 - 30}" r="50" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2" />
        
        <!-- Repository name -->
        <text x="${SVG_WIDTH/2}" y="60" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeRepo}</text>
        
        <!-- Contributor -->
        <text x="${SVG_WIDTH/2}" y="${SVG_HEIGHT/2 + 70}" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF" text-anchor="middle">Contributor: ${safeContributor}</text>
        
        <!-- Score -->
        <text x="${SVG_WIDTH/2}" y="${SVG_HEIGHT/2 - 20}" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeScore}</text>
        
        <!-- Score label -->
        <text x="${SVG_WIDTH/2}" y="${SVG_HEIGHT/2 + 10}" font-family="Arial, sans-serif" font-size="14" fill="#FFFFFF" text-anchor="middle">SCORE</text>
        
        <!-- Rarity badge -->
        <rect x="${SVG_WIDTH/2 - 75}" y="${SVG_HEIGHT - 50}" width="150" height="30" fill="#${safeColor}" />
        <text x="${SVG_WIDTH/2}" y="${SVG_HEIGHT - 30}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeRarity.toUpperCase()}</text>
      </svg>
    `;
    
    // Set content type and send the SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error generating NFT image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

export default router; 