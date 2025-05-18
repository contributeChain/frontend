import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertNftSchema,
  insertRepositorySchema,
  insertActivitySchema,
  insertContributionSchema
} from "@shared/schema";
import { setupGitHubRoutes } from "./api/github";
import { setupBlockchainRoutes } from "./api/blockchain";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub API routes
  setupGitHubRoutes(app);
  
  // Blockchain API routes
  setupBlockchainRoutes(app);
  
  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.get("/api/users/github/:username", async (req: Request, res: Response) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByGitHubUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user by GitHub username:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.get("/api/users/wallet/:address", async (req: Request, res: Response) => {
    try {
      const address = req.params.address;
      const user = await storage.getUserByWalletAddress(address);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user by wallet address:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userInput);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // NFT routes
  app.get("/api/nfts", async (req: Request, res: Response) => {
    try {
      const nfts = await storage.getNfts();
      res.json(nfts);
    } catch (error) {
      console.error("Error getting NFTs:", error);
      res.status(500).json({ message: "Failed to get NFTs" });
    }
  });
  
  app.get("/api/nfts/featured", async (req: Request, res: Response) => {
    try {
      const nfts = await storage.getFeaturedNfts();
      res.json(nfts);
    } catch (error) {
      console.error("Error getting featured NFTs:", error);
      res.status(500).json({ message: "Failed to get featured NFTs" });
    }
  });
  
  app.get("/api/nfts/popular", async (req: Request, res: Response) => {
    try {
      const nfts = await storage.getPopularNfts();
      res.json(nfts);
    } catch (error) {
      console.error("Error getting popular NFTs:", error);
      res.status(500).json({ message: "Failed to get popular NFTs" });
    }
  });
  
  app.get("/api/nfts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const nft = await storage.getNft(id);
      
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      
      res.json(nft);
    } catch (error) {
      console.error("Error getting NFT:", error);
      res.status(500).json({ message: "Failed to get NFT" });
    }
  });
  
  app.get("/api/nfts/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const nfts = await storage.getNftsByUserId(userId);
      res.json(nfts);
    } catch (error) {
      console.error("Error getting user NFTs:", error);
      res.status(500).json({ message: "Failed to get user NFTs" });
    }
  });
  
  app.post("/api/nfts", async (req: Request, res: Response) => {
    try {
      const nftInput = insertNftSchema.parse(req.body);
      const newNft = await storage.createNft(nftInput);
      res.status(201).json(newNft);
    } catch (error) {
      console.error("Error creating NFT:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid NFT data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create NFT" });
    }
  });
  
  // Repository routes
  app.get("/api/repositories", async (req: Request, res: Response) => {
    try {
      const repositories = await storage.getRepositories();
      res.json(repositories);
    } catch (error) {
      console.error("Error getting repositories:", error);
      res.status(500).json({ message: "Failed to get repositories" });
    }
  });
  
  app.get("/api/repositories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const repository = await storage.getRepository(id);
      
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }
      
      res.json(repository);
    } catch (error) {
      console.error("Error getting repository:", error);
      res.status(500).json({ message: "Failed to get repository" });
    }
  });
  
  app.get("/api/repositories/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const repositories = await storage.getRepositoriesByUserId(userId);
      res.json(repositories);
    } catch (error) {
      console.error("Error getting user repositories:", error);
      res.status(500).json({ message: "Failed to get user repositories" });
    }
  });
  
  app.post("/api/repositories", async (req: Request, res: Response) => {
    try {
      const repositoryInput = insertRepositorySchema.parse(req.body);
      const newRepository = await storage.createRepository(repositoryInput);
      res.status(201).json(newRepository);
    } catch (error) {
      console.error("Error creating repository:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid repository data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create repository" });
    }
  });
  
  // Activity routes
  app.get("/api/activities/feed", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivitiesWithUsers();
      res.json(activities);
    } catch (error) {
      console.error("Error getting activity feed:", error);
      res.status(500).json({ message: "Failed to get activity feed" });
    }
  });
  
  app.get("/api/activities/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const activities = await storage.getActivitiesByUserId(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error getting user activities:", error);
      res.status(500).json({ message: "Failed to get user activities" });
    }
  });
  
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityInput = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityInput);
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Error creating activity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });
  
  // Contribution routes
  app.get("/api/contributions/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const contributions = await storage.getContributionsByUserId(userId);
      res.json(contributions);
    } catch (error) {
      console.error("Error getting user contributions:", error);
      res.status(500).json({ message: "Failed to get user contributions" });
    }
  });
  
  app.post("/api/contributions", async (req: Request, res: Response) => {
    try {
      const contributionInput = insertContributionSchema.parse(req.body);
      const newContribution = await storage.createContribution(contributionInput);
      res.status(201).json(newContribution);
    } catch (error) {
      console.error("Error creating contribution:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contribution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contribution" });
    }
  });
  
  // Developer routes
  app.get("/api/developers", async (req: Request, res: Response) => {
    try {
      const developers = await storage.getUsers();
      res.json(developers);
    } catch (error) {
      console.error("Error getting developers:", error);
      res.status(500).json({ message: "Failed to get developers" });
    }
  });
  
  app.get("/api/developers/trending", async (req: Request, res: Response) => {
    try {
      const developers = await storage.getTrendingDevelopers();
      res.json(developers);
    } catch (error) {
      console.error("Error getting trending developers:", error);
      res.status(500).json({ message: "Failed to get trending developers" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
