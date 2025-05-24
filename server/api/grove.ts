import { Express, Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from "zod";

const groveUriSchema = z.object({
  key: z.string(),
  uri: z.string().startsWith("lens://")
});

export function setupGroveRoutes(app: Express) {
  // Get the current file's directory using import.meta.url
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Define possible paths to the grove-uris.json file
  const clientPath = path.resolve(__dirname, '../../client/src/config/grove-uris.json');
  const frontendClientPath = path.resolve(__dirname, '../../frontend/client/src/config/grove-uris.json');
  const frontendPath = path.resolve(__dirname, '../../frontend/src/config/grove-uris.json');
  
  // Get the appropriate path based on what exists
  const getGroveUrisPath = () => {
    // Check all possible paths
    if (fs.existsSync(clientPath)) {
      return clientPath;
    } else if (fs.existsSync(frontendClientPath)) {
      return frontendClientPath;
    } else if (fs.existsSync(frontendPath)) {
      return frontendPath;
    }
    
    // If none exists, create the directory structure and file in the frontend/client path
    const configDir = path.dirname(frontendClientPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Initialize with empty structure
    const initialData = {
      users: "",
      repositories: "",
      nfts: "",
      activities: "",
      posts: "",
      uploadedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(frontendClientPath, JSON.stringify(initialData, null, 2), 'utf8');
    return frontendClientPath;
  };

  /**
   * Update a Grove URI in the configuration file
   * POST /api/grove/uri
   * Body: { key: string, uri: string }
   */
  app.post("/api/grove/uri", async (req: Request, res: Response) => {
    try {
      // Validate input
      const { key, uri } = groveUriSchema.parse(req.body);
      
      // Get the appropriate path
      const groveUrisPath = getGroveUrisPath();
      
      // Read the current file
      let groveUris;
      try {
        const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
        groveUris = JSON.parse(groveUrisContent);
      } catch (error) {
        // If file doesn't exist or is invalid, initialize with empty data
        groveUris = {
          users: "",
          repositories: "",
          nfts: "",
          activities: "",
          posts: "",
          uploadedAt: new Date().toISOString()
        };
      }
      
      // Check if the key exists
      if (!(key in groveUris)) {
        return res.status(400).json({ 
          message: `Invalid key: ${key}. Valid keys are: ${Object.keys(groveUris).join(', ')}` 
        });
      }
      
      // Update the URI
      groveUris[key] = uri;
      
      // Update the timestamp
      groveUris.uploadedAt = new Date().toISOString();
      
      // Write the updated file
      const configDir = path.dirname(groveUrisPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(groveUrisPath, JSON.stringify(groveUris, null, 2), 'utf8');
      
      console.log(`Updated Grove URI for ${key} to ${uri} at ${groveUrisPath}`);
      
      return res.status(200).json({ 
        message: `Successfully updated Grove URI for ${key}`,
        key,
        uri
      });
    } catch (error) {
      console.error("Error updating Grove URI:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to update Grove URI" 
      });
    }
  });

  /**
   * Get all Grove URIs
   * GET /api/grove/uris
   */
  app.get("/api/grove/uris", async (_req: Request, res: Response) => {
    try {
      // Get the appropriate path
      const groveUrisPath = getGroveUrisPath();
      
      // Read the current file
      let groveUris;
      try {
        const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
        groveUris = JSON.parse(groveUrisContent);
      } catch (error) {
        // If file doesn't exist or is invalid, initialize with empty data
        groveUris = {
          users: "",
          repositories: "",
          nfts: "",
          activities: "",
          posts: "",
          uploadedAt: new Date().toISOString()
        };
        
        // Create the file
        const configDir = path.dirname(groveUrisPath);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(groveUrisPath, JSON.stringify(groveUris, null, 2), 'utf8');
      }
      
      return res.status(200).json(groveUris);
    } catch (error) {
      console.error("Error getting Grove URIs:", error);
      return res.status(500).json({ 
        message: "Failed to get Grove URIs" 
      });
    }
  });
} 