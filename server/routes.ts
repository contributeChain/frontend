import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupGitHubOAuthRoutes } from "./api/githubOAuth";
import { setupGroveRoutes } from "./api/grove";
import nftImageGenerator from "./api/nft-image-generator";

const router = express.Router();

// NFT metadata endpoint for resolving IPFS URIs
router.get('/nft-metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { uri } = req.query;
    
    if (!uri) {
      return res.status(400).json({ error: 'Missing URI parameter' });
    }
    
    // Parse URI
    const uriStr = uri.toString();
    let fetchUrl;
    
    // Handle IPFS URIs
    if (uriStr.startsWith('ipfs://')) {
      // Convert IPFS URI to HTTPS gateway URL
      const ipfsHash = uriStr.replace('ipfs://', '');
      fetchUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
    } else {
      // Use URI directly if HTTP/HTTPS
      fetchUrl = uriStr;
    }
    
    console.log(`[NFT Metadata] Fetching metadata from: ${fetchUrl}`);
    
    // Fetch metadata using node-fetch
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process image URL if it's IPFS 
    if (data.image && typeof data.image === 'string' && data.image.startsWith('ipfs://')) {
      const imageIpfsHash = data.image.replace('ipfs://', '');
      data.image = `https://cloudflare-ipfs.com/ipfs/${imageIpfsHash}`;
    }
    
    // Return the metadata
    return res.json(data);
  } catch (error) {
    console.error('[NFT Metadata] Error:', error);
    return res.status(500).json({ error: 'Failed to resolve metadata' });
  }
});

// Add NFT image generator routes
router.use('/nft-image', nftImageGenerator);

export async function registerRoutes(app: Express): Promise<Server> {
  setupGitHubOAuthRoutes(app);
  setupGroveRoutes(app);
  
  // Set up the API router
  app.use('/api', router);
  
  const httpServer = createServer(app);
  return httpServer;
}

export default router;
