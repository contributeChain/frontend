import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupGitHubOAuthRoutes } from "./api/githubOAuth";
import { setupGroveRoutes } from "./api/grove";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub OAuth routes
  setupGitHubOAuthRoutes(app);
  
  // Grove API routes
  setupGroveRoutes(app);
  
  // Note: All data storage and retrieval has been moved to Grove storage
  // Client-side code now fetches data directly from Grove using the grove-service.ts
  // These routes have been removed or replaced with Grove API endpoints
  
  const httpServer = createServer(app);

  return httpServer;
}
