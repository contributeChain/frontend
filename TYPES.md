# DevCred Type Documentation

This document provides a comprehensive overview of the data types used throughout the DevCred application. These types define the shape of our data and ensure type safety across the application.

## Table of Contents

- [Database Schema](#database-schema)
- [Type Definitions](#type-definitions)
- [Insert Types](#insert-types)
- [Utility Types](#utility-types)
- [JSON and API Response Types](#json-and-api-response-types)
- [Best Practices](#best-practices)

## Database Schema

DevCred uses a relational database schema with PostgreSQL. The core schema is defined using Drizzle ORM and includes the following tables:

### Users Table

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  githubUsername: text("github_username"),
  avatarUrl: text("avatar_url"),
  walletAddress: text("wallet_address"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  reputation: integer("reputation").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
```

### NFTs Table

```typescript
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenId: text("token_id"),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  rarity: text("rarity").default("common"),
  repoName: text("repo_name"),
  mintedAt: timestamp("minted_at").defaultNow(),
  transactionHash: text("transaction_hash"),
  metadata: jsonb("metadata")
});
```

### Repositories Table

```typescript
export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  language: text("language"),
  nftCount: integer("nft_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow()
});
```

### Activities Table

```typescript
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'commit', 'nft_mint', 'repo_create', etc.
  repoName: text("repo_name"),
  description: text("description"),
  nftId: integer("nft_id"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata")
});
```

### Contributions Table

```typescript
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  count: integer("count").default(0)
});
```

## Type Definitions

The application uses TypeScript to provide type safety. Here are the core type definitions:

### User Type

```typescript
export type User = {
  id: number;
  username: string;
  password: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  reputation: number | null;
  createdAt: Date | null;
};
```

The `User` type represents a registered user in the DevCred platform. Key properties include:

- `id`: A unique identifier for the user (auto-generated)
- `username`: The unique username for the user on DevCred
- `password`: Hashed password for authentication
- `githubUsername`: Optional GitHub username for the connected GitHub account
- `avatarUrl`: Optional URL to the user's profile picture
- `walletAddress`: Optional blockchain wallet address
- `bio`: Optional short biography or about section
- `location`: Optional geographical location information
- `website`: Optional personal website or portfolio URL
- `reputation`: Numeric value representing the user's reputation on the platform
- `createdAt`: Timestamp for when the user account was created

### NFT Type

```typescript
export type Nft = {
  id: number;
  userId: number;
  tokenId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  rarity: string | null;
  repoName: string | null;
  mintedAt: Date | null;
  transactionHash: string | null;
  metadata: unknown;
};
```

The `Nft` type represents a minted NFT on the Lens Chain. Key properties include:

- `id`: A unique identifier for the NFT in our database (auto-generated)
- `userId`: Reference to the user who owns this NFT
- `tokenId`: Unique identifier for the NFT on the blockchain
- `name`: Human-readable name for the NFT
- `description`: Detailed description of what the NFT represents
- `imageUrl`: URL to the image representation of the NFT
- `rarity`: Rarity level of the NFT (common, rare, epic, legendary)
- `repoName`: GitHub repository name associated with this NFT
- `mintedAt`: Timestamp of when the NFT was minted
- `transactionHash`: Blockchain transaction hash for verification
- `metadata`: JSON blob containing additional metadata about the NFT

### Repository Type

```typescript
export type Repository = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  nftCount: number | null;
  lastUpdated: Date | null;
};
```

The `Repository` type represents a GitHub repository connected to a user. Key properties include:

- `id`: A unique identifier for the repository record (auto-generated)
- `userId`: Reference to the user who owns this repository
- `name`: The name of the GitHub repository
- `description`: The repository description
- `stars`: Number of stars the repository has on GitHub
- `forks`: Number of forks the repository has on GitHub
- `language`: Primary programming language used in the repository
- `nftCount`: Number of NFTs minted from this repository
- `lastUpdated`: Timestamp of when the repository data was last updated

### Activity Type

```typescript
export type Activity = {
  id: number;
  userId: number;
  type: string;
  repoName: string | null;
  description: string | null;
  nftId: number | null;
  createdAt: Date | null;
  metadata: unknown;
};
```

The `Activity` type represents a user activity on the platform. Key properties include:

- `id`: A unique identifier for the activity (auto-generated)
- `userId`: Reference to the user who performed the activity
- `type`: Type of activity (commit, nft_mint, repo_create, etc.)
- `repoName`: Optional name of the repository related to this activity
- `description`: Optional description of the activity
- `nftId`: Optional reference to an NFT if the activity is related to an NFT
- `createdAt`: Timestamp of when the activity occurred
- `metadata`: JSON blob containing additional metadata about the activity

### Contribution Type

```typescript
export type Contribution = {
  id: number;
  userId: number;
  date: Date | null;
  count: number | null;
};
```

The `Contribution` type represents a GitHub contribution count for a specific day. Key properties include:

- `id`: A unique identifier for the contribution record (auto-generated)
- `userId`: Reference to the user who made the contributions
- `date`: The date when the contributions were made
- `count`: Number of contributions made on that date

## Insert Types

Insert types are used when creating new records in the database. They exclude auto-generated fields like `id` and default fields.

### InsertUser Type

```typescript
export type InsertUser = {
  username: string;
  password: string;
  githubUsername?: string | null;
  avatarUrl?: string | null;
  walletAddress?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
};
```

### InsertNft Type

```typescript
export type InsertNft = {
  userId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  rarity?: string | null;
  repoName?: string | null;
  tokenId?: string | null;
  transactionHash?: string | null;
  metadata?: unknown;
};
```

### InsertRepository Type

```typescript
export type InsertRepository = {
  userId: number;
  name: string;
  description?: string | null;
  stars?: number | null;
  forks?: number | null;
  language?: string | null;
};
```

### InsertActivity Type

```typescript
export type InsertActivity = {
  userId: number;
  type: string;
  repoName?: string | null;
  description?: string | null;
  nftId?: number | null;
  metadata?: unknown;
};
```

### InsertContribution Type

```typescript
export type InsertContribution = {
  userId: number;
  date?: Date | null;
  count?: number | null;
};
```

## Utility Types

In addition to the core data types, DevCred uses several utility types to enhance type safety:

### Activity with User

```typescript
export type ActivityWithUser = {
  activity: Activity;
  user: User;
};
```

This type combines an activity with its associated user, commonly used in the activity feed.

### GitHub Data Types

```typescript
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export interface GitHubContribution {
  date: string;
  count: number;
}

export interface GitHubActivity {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  created_at: string;
  payload: any;
}
```

These types are used to store and manipulate GitHub data fetched from the GitHub API.

### Blockchain Data Types

```typescript
export interface NFT {
  id: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  repoName?: string;
  mintedAt: Date;
  transactionHash?: string;
  metadata?: Record<string, any>;
}
```

This NFT interface is used specifically in the frontend components that display NFTs.

## JSON and API Response Types

When data is transferred between the frontend and backend, it's serialized as JSON. Here are some common response types:

### API Response Types

```typescript
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

### Specialized Response Types

```typescript
export type MintResponse = {
  success: boolean;
  nft?: Nft;
  transactionHash?: string;
  tokenId?: string;
};

export type GitHubConnectionResponse = {
  connected: boolean;
  username?: string;
};
```

## Best Practices

When working with these types in the DevCred application, follow these best practices:

1. **Always use the type definitions**: Avoid using `any` or loose types like `object`.

2. **Use Insert types for creation**: When creating new records, always use the appropriate Insert type.

3. **Null handling**: Many fields can be null, always handle these cases properly using conditional checks.

4. **Date handling**: When working with date fields, remember they are Date objects in TypeScript but will be serialized to strings when sent to the frontend.

5. **JSON fields**: The `metadata` fields are typed as `unknown`. Always validate and cast these fields before using them.

6. **Type guards**: Use type guards when working with union types or when you need to narrow down the type of a variable.

   ```typescript
   function isRepository(obj: any): obj is Repository {
     return obj && typeof obj === 'object' && 'name' in obj && 'userId' in obj;
   }
   ```

7. **Extending types**: When you need to extend a type, use intersection types:

   ```typescript
   type EnhancedUser = User & {
     totalContributions: number;
     topRepositories: Repository[];
   };
   ```

8. **Frontend validation**: When validating forms, use Zod schemas based on the Insert types, with additional validation rules as needed.

9. **Backend validation**: Always validate incoming request data against the Insert schemas before passing them to the storage layer.

10. **Immutability**: Treat all objects as immutable and use spread operators or libraries like Immer when you need to update them.

---

For any questions or suggestions regarding these types, please open an issue in the DevCred repository or contact the development team.