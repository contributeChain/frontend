import { Express, Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { z } from "zod";

const groveUriSchema = z.object({
  key: z.string(),
  uri: z.string().startsWith("lens://")
});

export function setupGroveRoutes(app: Express) {
  // Resolve grove-uris.json relative to current working directory
  const groveUrisPath = path.resolve(process.cwd(), 'client/src/config/grove-uris.json');
  console.log('Using groveUrisPath:', groveUrisPath);

  // Function to ensure the grove-uris.json file exists
  const ensureGroveUrisFile = () => {
    const configDir = path.dirname(groveUrisPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    if (!fs.existsSync(groveUrisPath)) {
      const initialData = {
        users: "",
        repositories: "",
        nfts: "",
        activities: "",
        posts: "",
        uploadedAt: new Date().toISOString()
      };
      fs.writeFileSync(groveUrisPath, JSON.stringify(initialData, null, 2), 'utf8');
    }
  };

  ensureGroveUrisFile();

  app.post("/api/grove/uri", async (req: Request, res: Response) => {
    try {
      const { key, uri } = groveUriSchema.parse(req.body);

      let groveUris;
      try {
        const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
        groveUris = JSON.parse(groveUrisContent);
      } catch {
        groveUris = {
          users: "",
          repositories: "",
          nfts: "",
          activities: "",
          posts: "",
          uploadedAt: new Date().toISOString()
        };
      }

      if (!(key in groveUris)) {
        return res.status(400).json({
          message: `Invalid key: ${key}. Valid keys are: ${Object.keys(groveUris).join(', ')}`
        });
      }

      groveUris[key] = uri;
      groveUris.uploadedAt = new Date().toISOString();

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

  app.get("/api/grove/uris", async (_req: Request, res: Response) => {
    try {
      let groveUris;
      try {
        const groveUrisContent = fs.readFileSync(groveUrisPath, 'utf8');
        groveUris = JSON.parse(groveUrisContent);
      } catch {
        groveUris = {
          users: "",
          repositories: "",
          nfts: "",
          activities: "",
          posts: "",
          uploadedAt: new Date().toISOString()
        };
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
