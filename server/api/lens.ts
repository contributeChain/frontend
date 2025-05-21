import { Router } from 'express';
import { PublicClient, testnet } from '@lens-protocol/client';
import { signMessageWith } from '@lens-protocol/client/viem';
import { 
  fetchPosts, 
  post, 
  fetchPost,
  addReaction,
} from '@lens-protocol/client/actions';
import { evmAddress, postId, uri } from '@lens-protocol/client';
import { textOnly } from '@lens-protocol/metadata';
import { privateKeyToAccount } from "viem/accounts";

const router = Router();
const privateKey = 'dfe9a1d1c29b40417ee15201f33240236c1750f4ce60fe32ba809a673ab24f99';
const account = privateKeyToAccount(`0x${privateKey}`);

// Server-side storage implementation
const serverStorage: Record<string, string> = {};

// Server-side Lens client implementation with proper configuration
const serverSideLensClient = PublicClient.create({
  environment: testnet,
  storage: {
    // Simple in-memory storage implementation for server-side
    getItem: (key: string) => serverStorage[key] || null,
    setItem: (key: string, value: string) => { serverStorage[key] = value; },
    removeItem: (key: string) => { delete serverStorage[key]; }
  },
  origin: 'http://localhost:5173'
});



// Initialize Lens session
let sessionClient: any = null;

// Authentication endpoint
router.post('/auth', async (req, res) => {
  try {
    console.log('Attempting Lens authentication with address:', account.address);
    
    // Authenticate with Lens Protocol using the account
    const authenticated = await serverSideLensClient.login({
      onboardingUser: {
        app: "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7",
        wallet: account.address,
      },
      signMessage: signMessageWith(account),
    });
    
    if (authenticated.isErr()) {
      console.error('Authentication error:', authenticated.error);
      return res.status(401).json({ 
        success: false, 
        error: authenticated.error 
      });
    }
    
    // Store the authenticated session client
    sessionClient = authenticated.value;
    console.log('Authentication successful for address:', account.address);
    console.log('Session client:', sessionClient.value);
    res.json({ 
      success: true, 
      address: account.address 
    });
  } catch (error) {
    console.error("Error authenticating with Lens:", error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Fetch posts endpoint
router.get('/posts', async (req, res) => {
  try {
    const { query } = req.query;
    const postsResult = await fetchPosts(serverSideLensClient, {
      filter: {
        searchQuery: query as string || 'Hello World',
      },
    });
    
    if (postsResult.isErr()) {
      return res.status(400).json({ error: postsResult.error });
    }
    
    res.json(postsResult.value);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error });
  }
});

// Create post endpoint
router.post('/posts', async (req, res) => {
  try {
    if (!sessionClient) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { content } = req.body;
    
    // Create metadata
    const metadata = textOnly({
      content: content || 'Hello from Lens Alchemy test!',
    });
    
    // Mock URI for testing
    const contentUri = uri('lens://mockuri123');
    
    const createPostResult = await post(sessionClient, {
      contentUri: contentUri,
    });
    
    if (createPostResult.isErr()) {
      return res.status(400).json({ error: createPostResult.error });
    }
    
    res.json(createPostResult.value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post', details: error });
  }
});

// Fetch specific post endpoint
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId: postIdParam } = req.params;
    const targetPostId = postId(postIdParam);
    
    const postResult = await fetchPost(serverSideLensClient, {
      post: targetPostId
    });
    
    if (postResult.isErr()) {
      return res.status(400).json({ error: postResult.error });
    }
    
    res.json(postResult.value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post', details: error });
  }
});

// Add reaction to post endpoint
router.post('/posts/:postId/react', async (req, res) => {
  try {
    if (!sessionClient) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { postId: postIdParam } = req.params;
    const { reaction = 'UPVOTE' } = req.body;
    
    const targetPostId = postId(postIdParam);
    
    const addReactionResult = await addReaction(sessionClient, {
      post: targetPostId,
      reaction
    });
    
    if (addReactionResult.isErr()) {
      return res.status(400).json({ error: addReactionResult.error });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reaction', details: error });
  }
});

export default router; 