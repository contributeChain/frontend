# Grove Integration for Lens Alchemy

This directory contains scripts for integrating with Grove, a decentralized storage solution from Lens Protocol.

## Overview

The integration consists of two main parts:

1. **Grove Uploader Script**: A CLI tool to upload mock data to Grove storage
2. **Grove Service**: A service module to fetch data from Grove in the application

## Using the Grove Uploader

The uploader script (`grove-uploader.ts`) uploads mock data to Grove and saves the resulting URIs to a configuration file.

### Prerequisites

1. Make sure you have a Lens Protocol wallet with a private key
2. Set your private key in the environment variables:

```bash
export PRIVATE_KEY=your_private_key_here
```

### Running the Script

You can run the uploader script in two ways:

#### Option 1: Using the shell script

```bash
cd /Users/apple/dev/hackathon/lens_alchemy/frontend
./client/src/scripts/run-grove-uploader.sh
```

#### Option 2: Running the TypeScript file directly

```bash
cd /Users/apple/dev/hackathon/lens_alchemy/frontend/client
npx ts-node src/scripts/grove-uploader.ts
```

This will:
1. Upload mock users, repositories, NFTs, and activities to Grove
2. Save the Grove URIs to `src/config/grove-uris.json`

## Grove Service

The Grove service (`src/lib/grove-service.ts`) provides functions to fetch data from Grove storage based on the URIs saved by the uploader script.

### Available Functions

- `fetchUsers()`: Fetches all users
- `fetchTrendingDevelopers(limit)`: Fetches top users by reputation
- `fetchRepositories()`: Fetches all repositories
- `fetchNFTs()`: Fetches all NFTs
- `fetchActivities()`: Fetches all activities
- `searchUsers(query)`: Searches users by username or GitHub username
- `getUserById(id)`: Gets a user by ID
- `getUserByGitHubUsername(username)`: Gets a user by GitHub username
- `getRepositoriesByUserId(userId)`: Gets repositories by user ID
- `getNFTsByUserId(userId)`: Gets NFTs by user ID
- `getActivitiesByUserId(userId)`: Gets activities by user ID

### Using the Service in Components

```tsx
import { fetchTrendingDevelopers } from "@/lib/grove-service";
import type { User } from "@/lib/grove-service";

// In a React component:
const [developers, setDevelopers] = useState<User[]>([]);

useEffect(() => {
  const loadDevelopers = async () => {
    try {
      const trendingDevs = await fetchTrendingDevelopers(5);
      setDevelopers(trendingDevs);
    } catch (error) {
      console.error("Error fetching trending developers:", error);
      setDevelopers([]);
    }
  };
  
  loadDevelopers();
}, []);
```

## Troubleshooting

### Grove URIs Not Found

If the application can't find the Grove URIs, make sure:

1. You've run the uploader script successfully
2. The `src/config/grove-uris.json` file exists and contains valid URIs
3. The application can access the file

### API Errors

If you encounter errors when fetching data from Grove:

1. Check that the URIs in `grove-uris.json` are valid
2. Ensure you have the correct permissions to access the data
3. Check the browser console for specific error messages

## Notes on Implementation

The current implementation includes:

- A complete service layer for fetching from Grove
- Type definitions for all data models
- Error handling and fallbacks
- Caching to improve performance

The mock data includes:
- 5 users with detailed profiles
- 5 repositories with stats
- 5 NFTs with metadata
- 5 activities with user associations 