# DevCred: Web3 Platform for GitHub Contribution NFTs

DevCred transforms GitHub contributions into NFTs on Lens Chain, allowing developers to showcase their work, build reputation, and connect with other developers in the blockchain ecosystem.

## Table of Contents

- [Overview](#overview)
- [GitHub Integration](#github-integration)
- [Contribution Visualization](#contribution-visualization)
- [NFT Minting Process](#nft-minting-process)
- [Getting Started](#getting-started)
- [Lens Alchemy Frontend](#lens-alchemy-frontend)
- [Grove Integration](#grove-integration)

## Overview

DevCred bridges the gap between traditional open-source development and the Web3 world by creating a unique developer profile that showcases both GitHub statistics and minted NFTs representing your coding achievements.

### Key Features

- Connect your GitHub account to showcase contributions
- Mint NFTs from significant GitHub activity
- View a beautiful visualization of your contribution history
- Discover trending developers and popular repositories
- Build your developer reputation on the blockchain

## GitHub Integration

### How to Connect Your GitHub Account

1. **Sign up/Login**: Create an account on DevCred or login to your existing account
2. **Connect GitHub**: Click the "Connect GitHub" button in your profile
3. **Authorize DevCred**: You'll be redirected to GitHub where you can authorize DevCred to access your public data
4. **Return to DevCred**: After authorization, you'll be redirected back to DevCred with your GitHub data integrated

### What Data We Access

DevCred only accesses your public GitHub data:

- Public profile information (username, avatar, bio)
- Public repositories
- Contribution history (commit counts)
- Public activity (commits, PRs, issues)

### Authentication Process

Behind the scenes, DevCred uses the GitHub OAuth flow to securely authenticate users:

1. DevCred redirects to the GitHub OAuth page
2. User authorizes the application
3. GitHub sends an authorization code to DevCred
4. DevCred exchanges this code for an access token
5. DevCred uses this token to access the GitHub API on the user's behalf

The access token is securely stored and is never exposed to the client-side application.

## Contribution Visualization

### How Contributions Are Displayed

DevCred creates beautiful visualizations of your GitHub contributions:

1. **Contribution Grid**: A heatmap calendar showing your activity over time
2. **Activity Feed**: A chronological list of your most significant contributions
3. **Repository Cards**: Visual cards showing your most popular repositories

### Contribution Grid Transformation

Your GitHub contribution calendar is transformed into an interactive, color-coded grid:

- **Data Collection**: We fetch your contribution data using the GitHub API
- **Processing**: The data is processed to extract contribution counts per day
- **Visualization**: The counts are mapped to a color scale based on activity levels:
  - No contributions: Light background
  - 1-2 contributions: Light primary color
  - 3-5 contributions: Medium primary color
  - 6-10 contributions: Bright primary color
  - 10+ contributions: Glowing primary color

This visual representation makes your contribution patterns immediately apparent and highlights your most productive periods.

## NFT Minting Process

### How Contributions Become NFTs

DevCred allows you to mint NFTs from significant GitHub contributions:

1. **Select Contribution**: Choose a contribution achievement (e.g., 100 commits, a significant PR, or a streak)
2. **Create Metadata**: The system generates metadata including:
   - Contribution type
   - Repository information
   - Timestamp
   - Rarity level based on significance
3. **Mint NFT**: The metadata is sent to the Lens Chain blockchain and an NFT is minted
4. **Receive NFT**: The NFT is sent to your connected wallet
5. **Display in Profile**: The NFT automatically appears in your DevCred profile

### NFT Metadata Structure

Each NFT contains rich metadata about your contribution:

```json
{
  "name": "COMMIT-7834",
  "description": "100 Commits to blockchain-auth-system",
  "image": "https://devcred.io/nft-images/commit-7834.png",
  "properties": {
    "rarity": "rare",
    "type": "commit_milestone",
    "repository": "blockchain-auth-system",
    "contributor": "sarah_chen",
    "date": "2023-09-15T14:30:00Z"
  }
}
```

### Rarity Levels

DevCred assigns rarity levels to NFTs based on the significance of the contribution:

- **Common**: Regular contributions, small PRs, issue creation
- **Rare**: Significant milestones, large feature additions
- **Epic**: Major project contributions, extended contribution streaks
- **Legendary**: Exceptional achievements, project-defining contributions

### Technical Implementation

The NFT minting process uses smart contracts on Lens Chain:

1. **Smart Contract Interaction**: DevCred's backend initiates a transaction to the NFT minting contract
2. **On-chain Verification**: The contract verifies the request and mints the NFT
3. **IPFS Storage**: NFT metadata and images are stored on IPFS for decentralization
4. **Blockchain Confirmation**: Upon successful minting, the transaction hash is recorded
5. **Events**: Smart contract events are emitted and captured by the DevCred backend

## Getting Started

### Prerequisites

- GitHub account
- Web3 wallet (MetaMask recommended)
- Basic understanding of blockchain transactions

### Quick Start

1. Create an account on DevCred
2. Connect your GitHub account
3. Connect your Web3 wallet
4. Explore your contribution history
5. Mint your first NFT from a significant contribution

### Best Practices

- Connect multiple repositories for a comprehensive profile
- Mint NFTs for truly significant contributions to maintain their value
- Keep your wallet secure with best security practices
- Regularly update your profile to reflect new achievements

## Lens Alchemy Frontend

This is the frontend for Lens Alchemy, a platform for Web3 developers to showcase their work and connect with others in the ecosystem.

## Grove Integration

The application uses Grove (Lens Protocol's decentralized storage solution) to store and retrieve data. This replaces the hardcoded mock data previously used in the application.

### Setting up Grove

1. Make sure you have a Lens Protocol wallet with a private key
2. Set your private key in the environment variables:

```bash
export PRIVATE_KEY=your_private_key_here
```

### Uploading Mock Data to Grove

Before running the application, you need to upload the mock data to Grove:

```bash
cd client
npx ts-node src/scripts/grove-uploader.ts
```

This will:
1. Upload mock users, repositories, NFTs, and activities to Grove
2. Save the Grove URIs to `src/config/grove-uris.json`

### How it Works

The application uses the Grove service (`src/lib/grove-service.ts`) to fetch data from Grove storage. The service provides functions to:

- Fetch trending developers
- Search users
- Get user profiles
- Get repositories, NFTs, and activities

All components that previously used hardcoded data now use these service functions to fetch data from Grove.

---

For more information, visit our [documentation](https://docs.devcred.io) or contact our [support team](mailto:support@devcred.io).