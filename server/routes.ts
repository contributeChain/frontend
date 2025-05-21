import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupGitHubOAuthRoutes } from "./api/githubOAuth";
import { setupGroveRoutes } from "./api/grove";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - must be registered BEFORE any catch-all routes
  
  // GitHub OAuth routes
  setupGitHubOAuthRoutes(app);
  
  // Grove API routes
  setupGroveRoutes(app);
  
  // Note: Lens routes are registered directly in index.ts
  
  // Generic API 404 handler for any unhandled API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
  });
  
  // Note: All data storage and retrieval has been moved to Grove storage
  // Client-side code now fetches data directly from Grove using the grove-service.ts
  // These routes have been removed or replaced with Grove API endpoints
  
  const httpServer = createServer(app);

  return httpServer;
}

export default express.Router();
