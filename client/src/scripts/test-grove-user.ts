import { addUserToCollection } from '../lib/grove-service';

/**
 * Test script to add a user to the Grove users collection
 */
async function testAddUser() {
  console.log('Testing addUserToCollection function...');
  
  // Sample user data
  const userData = {
    id: Date.now(),
    username: 'testuser',
    githubUsername: 'testuser',
    avatarUrl: 'https://github.com/identicons/testuser.png',
    reputation: 100,
    password: '',
    walletAddress: '0x1234567890123456789012345678901234567890',
    bio: 'Test user for Grove storage',
    location: 'Internet',
    website: 'https://github.com/testuser',
    createdAt: new Date()
  };
  
  try {
    // Test wallet address - replace with your own for testing
    const testWalletAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;
    
    const result = await addUserToCollection(userData, testWalletAddress);
    
    if (result) {
      console.log('✅ Successfully added user to collection!');
    } else {
      console.log('❌ Failed to add user to collection');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testAddUser().catch(console.error); 