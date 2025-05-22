import { Router } from 'express';
import axios from 'axios';
import { LRUCache } from 'lru-cache';

// Create a cache for metadata with max of 1000 items that expire after 1 hour
const metadataCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

const router = Router();

/**
 * API endpoint to resolve and serve NFT metadata
 * This acts as a resolver for metadata URIs from the blockchain
 */
router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { uri } = req.query;
    
    if (!uri) {
      return res.status(400).json({ error: 'Missing URI parameter' });
    }
    
    // Check cache first
    const cacheKey = `metadata_${uri}`;
    const cachedMetadata = metadataCache.get(cacheKey);
    
    if (cachedMetadata) {
      console.log(`[NFT Metadata] Cache hit for token ID ${tokenId}`);
      return res.json(cachedMetadata);
    }
    
    // Parse URI
    const uriStr = uri.toString();
    let fetchUrl: string;
    
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
    
    // Fetch metadata
    const { data } = await axios.get(fetchUrl);
    
    // Process image URL if it's IPFS 
    if (data.image && typeof data.image === 'string' && data.image.startsWith('ipfs://')) {
      const imageIpfsHash = data.image.replace('ipfs://', '');
      data.image = `https://cloudflare-ipfs.com/ipfs/${imageIpfsHash}`;
    }
    
    // Cache the result
    metadataCache.set(cacheKey, data);
    
    // Return the metadata
    return res.json(data);
  } catch (error) {
    console.error('[NFT Metadata] Error:', error);
    return res.status(500).json({ error: 'Failed to resolve metadata' });
  }
});

// Endpoint to clear metadata cache (admin only)
router.post('/clear-cache', (req, res) => {
  metadataCache.clear();
  return res.json({ success: true, message: 'Metadata cache cleared' });
});

export default router; 