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
  
  // Path to the grove-uris.json file
  const groveUrisPath = path.resolve(__dirname, '../../client/src/config/grove-uris.json');

  /**
   * Update a Grove URI in the configuration file
   * POST /api/grove/uri
   * Body: { key: string, uri: string }
   */
  app.post("/api/grove/uri", async (req: Request, res: Response) => {
    try {
      // Validate input
      const { key, uri } = groveUriSchema.parse(req.body);
      
      // Read the current file
      const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
      const groveUris = JSON.parse(groveUrisContent);
      
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
      fs.writeFileSync(groveUrisPath, JSON.stringify(groveUris, null, 2), 'utf8');
      
      console.log(`Updated Grove URI for ${key} to ${uri}`);
      
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
      // Read the current file
      const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
      const groveUris = JSON.parse(groveUrisContent);
      
      return res.status(200).json(groveUris);
    } catch (error) {
      console.error("Error getting Grove URIs:", error);
      return res.status(500).json({ 
        message: "Failed to get Grove URIs" 
      });
    }
  });
} 