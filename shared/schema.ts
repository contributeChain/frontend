import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
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

// NFT model
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

// Repository model
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

// Activity model
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

// Contribution model
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  count: integer("count").default(0)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  githubUsername: true,
  avatarUrl: true,
  walletAddress: true,
  bio: true,
  location: true,
  website: true
});

export const insertNftSchema = createInsertSchema(nfts).pick({
  userId: true,
  name: true,
  description: true,
  imageUrl: true,
  rarity: true,
  repoName: true,
  tokenId: true,
  transactionHash: true,
  metadata: true
});

export const insertRepositorySchema = createInsertSchema(repositories).pick({
  userId: true,
  name: true,
  description: true,
  stars: true,
  forks: true,
  language: true
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  repoName: true,
  description: true,
  nftId: true,
  metadata: true
});

export const insertContributionSchema = createInsertSchema(contributions).pick({
  userId: true,
  date: true,
  count: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Nft = typeof nfts.$inferSelect;
export type InsertNft = z.infer<typeof insertNftSchema>;

export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
