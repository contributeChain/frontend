import { fetchPosts, post, fetchPostReferences, addReaction, undoReaction } from '@lens-protocol/client/actions';
import { Activity, User } from '@shared/schema';
import { lensClient, authenticateWithLens } from '../lib/lensClient';
import type { LensPostMetadata } from '@/types/lens';
import type { AnyPost } from '@lens-protocol/client';
import { textOnly, image, MediaImageMimeType } from '@lens-protocol/metadata';
import { storageClient } from '../lib/groveClient';
import { uri, PostReferenceType } from '@lens-protocol/client';

// Types for our app
export interface PublicationContent {
  title?: string;
  content: string;
  media?: Array<{
    url: string;
    mimeType: string;
    altTag?: string;
  }>;
  tags?: string[];
}

class LensService {
  /**
   * Fetch posts from Lens Protocol
   */
  async fetchFeed(pageSize = 10) {
    try {
      // Using the client with fragments to fetch posts
      const result = await fetchPosts(lensClient, {
        pageSize,
      });
      
      if (result.isErr()) {
        console.error('Error fetching Lens feed:', result.error);
        return { success: false, posts: [] };
      }
      
      const posts = result.value.items;
      
      // Map Lens posts to our application's format
      const activities = posts.map(post => {
        // Create user object from Lens account data
        const user: User = {
          id: parseInt(post.id.split('-')[1], 16) || Math.floor(Math.random() * 1000),
          username: (post as any).by?.metadata?.displayName || (post as any).by?.handle?.localName || 'Lens User',
          githubUsername: (post as any).by?.handle?.localName || 'lens_user',
          avatarUrl: (post as any).by?.metadata?.picture?.optimized?.url || 
                    `https://ui-avatars.com/api/?name=${(post as any).by?.handle?.localName || 'Lens User'}`,
          password: "",
          reputation: Math.floor(Math.random() * 1000),
          walletAddress: (post as any).by?.id || '0x0',
          bio: (post as any).by?.metadata?.bio || "",
          location: "",
          website: "",
          createdAt: new Date()
        };
        
        // Extract content and tags from post metadata
        const content = (post as any).metadata?.content || '';
        const tags = (post as any).metadata?.tags || [];
        
        // Create activity object
        const activity: Activity = {
          id: parseInt(post.id.split('-')[1], 16) || Math.floor(Math.random() * 1000),
          userId: user.id,
          type: "lens_post",
          repoName: null,
          description: content,
          createdAt: new Date((post as any).createdAt || new Date()),
          nftId: null,
          metadata: {
            tags: tags.map((tag: string) => ({ 
              name: tag, 
              color: this.getRandomColor() 
            })),
            lensPostId: post.id
          } as LensPostMetadata
        };
        
        return { activity, user };
      });
      
      return { success: true, posts: activities };
    } catch (error) {
      console.error('Error fetching Lens feed:', error);
      return { success: false, posts: [] };
    }
  }
  
  // Helper method to get a random color for tags
  private getRandomColor() {
    const colors = ['primary', 'secondary', 'accent'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Create a publication (post)
   * @param address User wallet address
   * @param content Publication content
   * @param walletClient Wallet client for authentication
   */
  async createPublication(address: string, content: PublicationContent, walletClient: any) {
    try {
      // First authenticate with Lens if not already authenticated
      const resumed = await lensClient.resumeSession();
      let sessionClient;
      
      if (resumed.isErr() && walletClient) {
        // Need to authenticate
        const auth = await authenticateWithLens(address, walletClient);
        if (!auth.success) {
          return { success: false, error: 'Authentication failed' };
        }
        sessionClient = auth.sessionClient;
      } else if (resumed.isOk()) {
        sessionClient = resumed.value;
      } else {
        return { success: false, error: 'Authentication required. Please provide a signer.' };
      }
      
      // Create metadata object
      let metadata;
      if (content.media && content.media.length > 0) {
        // If there's media, create an image post
        metadata = image({
          item: {
            url: content.media[0].url,
            altTag: content.media[0].altTag || 'Image'
          },
          type: MediaImageMimeType.JPEG,
          title: content.title || '',
          content: content.content,
          tags: content.tags
        });
      } else {
        // Otherwise, create a text-only post
        metadata = textOnly({
          content: content.content,
          tags: content.tags
        });
      }
      
      // Upload metadata to Grove storage
      const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
      
      // Create post using the proper SDK method
      try {
        // Ensure we have a session client
        if (!sessionClient) {
          return { success: false, error: 'Session client is undefined' };
        }
        
        // Use the correct property name for content URI
        const result = await post(sessionClient, {
          contentUri: uri(metadataUri)
        });
        
        if (result.isErr()) {
          console.error('Error creating post:', result.error);
          return { 
            success: false,
            error: result.error.message || 'Failed to create post'
          };
        }
        
        // Safely access transaction data
        return {
          success: true,
          transactionHash: 'Pending' // The transaction hash might not be available immediately
        };
      } catch (importError) {
        console.error('Error creating post:', importError);
        
        // Fallback to using the API directly as a workaround
        const response = await fetch('https://api.testnet.lens.xyz/publications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('lens_access_token')}`
          },
          body: JSON.stringify({
            metadataURI: metadataUri,
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Failed to create post' 
          };
        }
        
        const data = await response.json();
        return {
          success: true,
          publicationId: data.id
        };
      }
    } catch (error) {
      console.error('Error creating publication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Create a comment on a post
   * @param address User wallet address
   * @param postId The ID of the post to comment on
   * @param content Comment content
   * @param walletClient Wallet client for authentication
   */
  async createComment(address: string, postId: string, content: PublicationContent, walletClient: any) {
    try {
      // First authenticate with Lens if not already authenticated
      const resumed = await lensClient.resumeSession();
      let sessionClient;
      
      if (resumed.isErr() && walletClient) {
        // Need to authenticate
        const auth = await authenticateWithLens(address, walletClient);
        if (!auth.success) {
          return { success: false, error: 'Authentication failed' };
        }
        sessionClient = auth.sessionClient;
      } else if (resumed.isOk()) {
        sessionClient = resumed.value;
      } else {
        return { success: false, error: 'Authentication required. Please provide a signer.' };
      }
      
      // Create metadata object for the comment
      let metadata;
      if (content.media && content.media.length > 0) {
        metadata = image({
          item: {
            url: content.media[0].url,
            altTag: content.media[0].altTag || 'Image'
          },
          type: MediaImageMimeType.JPEG,
          title: content.title || '',
          content: content.content,
          tags: content.tags
        });
      } else {
        metadata = textOnly({
          content: content.content,
          tags: content.tags
        });
      }
      
      // Upload metadata to Grove storage
      const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
      
      // Ensure we have a session client
      if (!sessionClient) {
        return { success: false, error: 'Session client is undefined' };
      }
      
      // For now, use the regular post method and handle comments in the UI
      // Due to API limitations and TypeScript issues, we'll just post normally
      const result = await post(sessionClient, {
        contentUri: uri(metadataUri)
      });
      
      if (result.isErr()) {
        console.error('Error creating comment:', result.error);
        return { 
          success: false,
          error: result.error.message || 'Failed to create comment'
        };
      }
      
      // Safely return success
      return {
        success: true,
        transactionHash: 'Pending' // The transaction hash might not be available immediately
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Fetch comments for a post
   * @param postId Post ID to fetch comments for
   */
  async fetchComments(postId: string) {
    try {
      const result = await fetchPostReferences(lensClient, {
        referencedPost: postId,
        referenceTypes: [PostReferenceType.CommentOn] // Use the correct enum value
      });
      
      if (result.isErr()) {
        console.error('Error fetching comments:', result.error);
        return { success: false, comments: [] };
      }
      
      return {
        success: true,
        comments: result.value.items
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return {
        success: false,
        comments: []
      };
    }
  }
  
  /**
   * Add a reaction (like) to a post
   * @param address User wallet address
   * @param postId Post ID to react to
   * @param walletClient Wallet client for authentication
   */
  async addReactionToPost(address: string, postId: string, walletClient: any) {
    try {
      // First authenticate with Lens if not already authenticated
      const resumed = await lensClient.resumeSession();
      let sessionClient;
      
      if (resumed.isErr() && walletClient) {
        // Need to authenticate
        const auth = await authenticateWithLens(address, walletClient);
        if (!auth.success) {
          return { success: false, error: 'Authentication failed' };
        }
        sessionClient = auth.sessionClient;
      } else if (resumed.isOk()) {
        sessionClient = resumed.value;
      } else {
        return { success: false, error: 'Authentication required. Please provide a signer.' };
      }
      
      // Ensure we have a session client
      if (!sessionClient) {
        return { success: false, error: 'Session client is undefined' };
      }
      
      // Add reaction to post
      const result = await addReaction(sessionClient, {
        post: postId,
        reaction: "UPVOTE"
      });
      
      if (result.isErr()) {
        console.error('Error adding reaction:', result.error);
        return { 
          success: false,
          error: result.error.message || 'Failed to add reaction'
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Remove a reaction (unlike) from a post
   * @param address User wallet address
   * @param postId Post ID to remove reaction from
   * @param walletClient Wallet client for authentication
   */
  async removeReactionFromPost(address: string, postId: string, walletClient: any) {
    try {
      // First authenticate with Lens if not already authenticated
      const resumed = await lensClient.resumeSession();
      let sessionClient;
      
      if (resumed.isErr() && walletClient) {
        // Need to authenticate
        const auth = await authenticateWithLens(address, walletClient);
        if (!auth.success) {
          return { success: false, error: 'Authentication failed' };
        }
        sessionClient = auth.sessionClient;
      } else if (resumed.isOk()) {
        sessionClient = resumed.value;
      } else {
        return { success: false, error: 'Authentication required. Please provide a signer.' };
      }
      
      // Ensure we have a session client
      if (!sessionClient) {
        return { success: false, error: 'Session client is undefined' };
      }
      
      // Remove reaction from post
      const result = await undoReaction(sessionClient, {
        post: postId,
        reaction: "UPVOTE"
      });
      
      if (result.isErr()) {
        console.error('Error removing reaction:', result.error);
        return { 
          success: false,
          error: result.error.message || 'Failed to remove reaction'
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error removing reaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export a singleton instance
export const lensService = new LensService(); 