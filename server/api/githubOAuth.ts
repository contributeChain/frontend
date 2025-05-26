import { Express, Request, Response } from "express";
import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Ov23lixqQvpop8vkzG0W";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "25d6196cabad1bb6b1acdb69356295fcffce450c";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "http://f8ksk0o4w0kosswc88s4o8ck.35.208.71.32.sslip.io/auth/callback";

export function setupGitHubOAuthRoutes(app: Express) {
  // Exchange code for access token - GET endpoint
  app.get("/api/github/oauth/callback", async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      
      console.log("GitHub OAuth callback received (GET):", { 
        code: code ? `${typeof code} (${code.toString().substring(0, 5)}...)` : "absent", 
        state 
      });
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      // Exchange code for access token
      console.log("Requesting token from GitHub with parameters:", {
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI,
        code_type: typeof code,
        code_length: code.toString().length,
        code_sample: typeof code === 'string' ? code.substring(0, 5) + '...' : code
      });
      
      try {
        const tokenResponse = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
          },
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        
        console.log("GitHub token response received:", {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          hasError: !!tokenResponse.data.error,
          hasToken: !!tokenResponse.data.access_token,
          tokenType: typeof tokenResponse.data.access_token,
          tokenSample: tokenResponse.data.access_token ? 
                      `${String(tokenResponse.data.access_token).substring(0, 5)}...` : 
                      'none',
          responseKeys: Object.keys(tokenResponse.data),
          fullTokenResponse: JSON.stringify(tokenResponse.data).substring(0, 100) + '...'
        });
        
        // GitHub returns token or error
        if (tokenResponse.data.error) {
          console.error("GitHub OAuth error:", tokenResponse.data);
          return res.status(400).json({ 
            message: "Failed to authenticate with GitHub", 
            error: tokenResponse.data.error,
            error_description: tokenResponse.data.error_description
          });
        }
        
        if (!tokenResponse.data.access_token) {
          console.error("No access token in GitHub response:", tokenResponse.data);
          return res.status(400).json({
            message: "GitHub did not provide an access token",
            response: tokenResponse.data
          });
        }
        
        // Make sure the token is a string
        const accessToken = String(tokenResponse.data.access_token);
        console.log("Token extracted and converted to string:", {
          type: typeof accessToken,
          length: accessToken.length,
          sample: accessToken.substring(0, 5) + '...'
        });
        
        // Success - return the token to the client with explicit string type
        return res.json({
          access_token: accessToken,
          token_type: String(tokenResponse.data.token_type || 'bearer'),
          scope: String(tokenResponse.data.scope || '')
        });
      } catch (tokenError: any) {
        console.error("Error calling GitHub token endpoint:", 
          tokenError.message, 
          tokenError.response?.data || "No response data"
        );
        return res.status(500).json({
          message: "Error exchanging code for token",
          error: tokenError.message
        });
      }
    } catch (error: any) {
      console.error("Error in GitHub OAuth callback:", 
        error.message, 
        error.stack
      );
      return res.status(500).json({ 
        message: "Failed to authenticate with GitHub",
        error: error.message 
      });
    }
  });
  
  // Modern API endpoint for exchanging code - POST endpoint
  app.post("/api/auth/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      console.log("GitHub OAuth callback received (POST):", { 
        code: code ? `${typeof code} (${code.substring(0, 5)}...)` : "absent"
      });
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      // Exchange code for access token
      try {
        const tokenResponse = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
          },
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        
        // GitHub returns token or error
        if (tokenResponse.data.error) {
          console.error("GitHub OAuth error:", tokenResponse.data);
          return res.status(400).json({ 
            message: "Failed to authenticate with GitHub", 
            error: tokenResponse.data.error,
            error_description: tokenResponse.data.error_description
          });
        }
        
        if (!tokenResponse.data.access_token) {
          console.error("No access token in GitHub response:", tokenResponse.data);
          return res.status(400).json({
            message: "GitHub did not provide an access token"
          });
        }
        
        // Make sure the token is a string
        const accessToken = String(tokenResponse.data.access_token);
        
        // Success - return the token to the client
        return res.status(200).json({
          access_token: accessToken,
          token_type: String(tokenResponse.data.token_type || 'bearer'),
          scope: String(tokenResponse.data.scope || '')
        });
      } catch (tokenError: any) {
        console.error("Error calling GitHub token endpoint:", 
          tokenError.message, 
          tokenError.response?.data || "No response data"
        );
        return res.status(500).json({
          message: "Error exchanging code for token",
          error: tokenError.message
        });
      }
    } catch (error: any) {
      console.error("Error in GitHub OAuth callback:", 
        error.message, 
        error.stack
      );
      return res.status(500).json({ 
        message: "Failed to authenticate with GitHub",
        error: error.message 
      });
    }
  });
} 