import { lensClient, authenticateWithLens } from './client/src/lib/lensClient';
import { evmAddress, postId, uri, testnet } from '@lens-protocol/client';
import { textOnly } from '@lens-protocol/metadata';
import { 
  fetchPosts, 
  post, 
  fetchPost,
  addReaction,
} from '@lens-protocol/client/actions';
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from 'viem';

// Create wallet client from private key
const privateKey = 'dfe9a1d1c29b40417ee15201f33240236c1750f4ce60fe32ba809a673ab24f99';
const account = privateKeyToAccount(`0x${privateKey}`);

// const walletClient = createWalletClient({
//   account,
//   transport: http()
// });

/**
 * Test Lens Protocol API functions
 * This is just for demonstration and testing purposes
 */
async function testLensAPI() {
  console.log('Starting Lens API test...');
  
  try {
    // 1. Authenticate with Lens
    console.log('Authenticating with Lens...');
    const authResult = await authenticateWithLens(
      account.address,
      account
    );
    
    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }
    
    const sessionClient = authResult.sessionClient;
    if (!sessionClient) {
      throw new Error('Session client is undefined');
    }
    
    console.log('Authentication successful!');
    
    // 2. Fetch posts
    console.log('Fetching posts...');
    const postsResult = await fetchPosts(lensClient, {
      filter: {
        searchQuery: 'Hello World',
      },
    });
    
    if (postsResult.isErr()) {
      throw new Error(`Failed to fetch posts: ${postsResult.error}`);
    }
    
    console.log(`Found ${postsResult.value.items.length} posts`);
    
    // 3. Create a post
    console.log('Creating a post...');
    
    // Create metadata
    const metadata = textOnly({
      content: 'Hello from Lens Alchemy test!',
    });
    
    // For a real implementation, you would upload this metadata
    // For this test, we'll mock the URI
    const contentUri = uri('lens://mockuri123');
    
    // Create post
    const createPostResult = await post(sessionClient, {
      contentUri: contentUri,
    });
    
    if (createPostResult.isErr()) {
      throw new Error(`Failed to create post: ${createPostResult.error}`);
    }
    
    console.log('Post created successfully!', createPostResult.value);
    
    // 4. Fetch a specific post by ID
    const mockPostId = postId('0x01-0x01'); 
    
    console.log('Fetching a post...');
    const postResult = await fetchPost(lensClient, {
      post: mockPostId
    });
    
    if (postResult.isErr()) {
      throw new Error(`Failed to fetch post: ${postResult.error}`);
    }
    
    console.log('Post fetched successfully!');
    
    // 5. Add a reaction to a post
    console.log('Adding reaction to post...');
    const addReactionResult = await addReaction(sessionClient, {
      post: mockPostId,
      reaction: 'UPVOTE'
    });
    
    if (addReactionResult.isErr()) {
      throw new Error(`Failed to add reaction: ${addReactionResult.error}`);
    }
    
    console.log('Reaction added successfully!');
    
    console.log('Lens API test completed successfully!');
  } catch (error) {
    console.error('Error during Lens API test:', error);
  }
}

// Run the test
testLensAPI()
  .then(() => console.log('Test finished'))
  .catch(error => console.error('Test failed:', error)); 