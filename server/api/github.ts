import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Mock GitHub API data for development purposes
// In a real application, this would be replaced with actual GitHub API calls
const mockGitHubUsers = new Map([
  ["sarahcodes", {
    login: "sarahcodes",
    id: 1000001,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    html_url: "https://github.com/sarahcodes",
    name: "Sarah Chen",
    bio: "Building open source tools for developers. Passionate about blockchain technology and web performance optimization.",
    location: "San Francisco",
    blog: "https://sarahchen.dev",
    public_repos: 28,
    followers: 345,
    following: 67
  }],
  ["alexdev", {
    login: "alexdev",
    id: 1000002,
    avatar_url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    html_url: "https://github.com/alexdev",
    name: "Alex Rivera",
    bio: "Full stack developer passionate about Web3 and DeFi. Currently exploring blockchain authentication systems.",
    location: "New York",
    blog: "https://alexrivera.dev",
    public_repos: 42,
    followers: 213,
    following: 98
  }],
  ["mayacodes", {
    login: "mayacodes",
    id: 1000003,
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    html_url: "https://github.com/mayacodes",
    name: "Maya Johnson",
    bio: "Frontend developer and UI/UX enthusiast. Working on making blockchain more accessible to everyone.",
    location: "Berlin",
    blog: "https://mayajohnson.com",
    public_repos: 19,
    followers: 142,
    following: 56
  }]
]);

// Mock repositories data
const mockGitHubRepos = new Map([
  ["sarahcodes", [
    {
      id: 2000001,
      name: "blockchain-auth-system",
      full_name: "sarahcodes/blockchain-auth-system",
      description: "An OAuth-compatible authentication system built on blockchain technology for secure, decentralized identity verification.",
      html_url: "https://github.com/sarahcodes/blockchain-auth-system",
      language: "JavaScript",
      stargazers_count: 248,
      forks_count: 56,
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2000002,
      name: "react-performance-toolkit",
      full_name: "sarahcodes/react-performance-toolkit",
      description: "A collection of performance optimization tools and components for React applications with a focus on rendering speed.",
      html_url: "https://github.com/sarahcodes/react-performance-toolkit",
      language: "TypeScript",
      stargazers_count: 1200,
      forks_count: 184,
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2000003,
      name: "defi-dashboard-components",
      full_name: "sarahcodes/defi-dashboard-components",
      description: "A suite of React components specifically designed for DeFi applications with real-time data visualization.",
      html_url: "https://github.com/sarahcodes/defi-dashboard-components",
      language: "TypeScript",
      stargazers_count: 845,
      forks_count: 92,
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]],
  ["alexdev", [
    {
      id: 2000004,
      name: "web3-auth-explorer",
      full_name: "alexdev/web3-auth-explorer",
      description: "Explore different Web3 authentication methods with practical examples and security considerations.",
      html_url: "https://github.com/alexdev/web3-auth-explorer",
      language: "JavaScript",
      stargazers_count: 187,
      forks_count: 29,
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2000005,
      name: "blockchain-visualizer",
      full_name: "alexdev/blockchain-visualizer",
      description: "Interactive visualizations for blockchain data and structure to help developers understand how it works.",
      html_url: "https://github.com/alexdev/blockchain-visualizer",
      language: "TypeScript",
      stargazers_count: 346,
      forks_count: 57,
      updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]],
  ["mayacodes", [
    {
      id: 2000006,
      name: "react-defi-components",
      full_name: "mayacodes/react-defi-components",
      description: "A library of React components for building DeFi application interfaces quickly and beautifully.",
      html_url: "https://github.com/mayacodes/react-defi-components",
      language: "TypeScript",
      stargazers_count: 142,
      forks_count: 23,
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2000007,
      name: "javascript-utils",
      full_name: "mayacodes/javascript-utils",
      description: "A collection of utility functions for JavaScript and TypeScript projects.",
      html_url: "https://github.com/mayacodes/javascript-utils",
      language: "JavaScript",
      stargazers_count: 98,
      forks_count: 12,
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]]
]);

// Mock contributions data (GitHub contribution calendar)
function generateMockContributions(username: string): { date: string; count: number }[] {
  const contributions: { date: string; count: number }[] = [];
  const currentYear = new Date().getFullYear();
  
  // Generate random contributions for the whole year
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day);
      
      // Don't generate data for future dates
      if (date > new Date()) continue;
      
      // Randomly generate 0-12 contributions for each day
      let count = 0;
      
      if (username === "sarahcodes") {
        // Sarah is very active
        const rand = Math.random();
        if (rand < 0.7) { // 70% chance of activity
          count = Math.floor(Math.random() * 12) + 1;
        }
      } else if (username === "alexdev") {
        // Alex has moderate activity
        const rand = Math.random();
        if (rand < 0.5) { // 50% chance of activity
          count = Math.floor(Math.random() * 8) + 1;
        }
      } else if (username === "mayacodes") {
        // Maya has occasional but significant contributions
        const rand = Math.random();
        if (rand < 0.3) { // 30% chance of activity
          count = Math.floor(Math.random() * 15) + 1;
        }
      } else {
        // Default pattern for unknown users
        const rand = Math.random();
        if (rand < 0.4) { // 40% chance of activity
          count = Math.floor(Math.random() * 5) + 1;
        }
      }
      
      // Add to the list of contributions
      contributions.push({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        count
      });
    }
  }
  
  return contributions;
}

// Mock GitHub activities (commits, PRs, etc.)
function generateMockActivities(username: string): any[] {
  const activities = [];
  const numActivities = Math.floor(Math.random() * 10) + 5; // 5-15 activities
  
  // Get repositories for this user
  const repos = mockGitHubRepos.get(username) || [];
  if (repos.length === 0) return [];
  
  for (let i = 0; i < numActivities; i++) {
    const repo = repos[Math.floor(Math.random() * repos.length)];
    const types = ["PushEvent", "PullRequestEvent", "IssuesEvent", "CreateEvent"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Generate a date in the past 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    activities.push({
      id: `activity-${username}-${i}`,
      type,
      repo: {
        name: repo.full_name
      },
      created_at: date.toISOString(),
      payload: {
        // Payload depends on event type
        ...(type === "PushEvent" ? {
          commits: [
            {
              message: `Update ${repo.language} implementation with new features`,
              sha: Math.random().toString(36).substring(2, 15)
            }
          ]
        } : {}),
        ...(type === "PullRequestEvent" ? {
          action: "opened",
          pull_request: {
            title: `Add new ${repo.language} feature`,
            body: "This PR adds support for the latest features."
          }
        } : {}),
        ...(type === "IssuesEvent" ? {
          action: "opened",
          issue: {
            title: `Fix ${repo.language} bug in core module`,
            body: "There's an issue with the implementation that needs fixing."
          }
        } : {}),
        ...(type === "CreateEvent" ? {
          ref_type: "branch",
          ref: `feature/${Math.random().toString(36).substring(2, 8)}`
        } : {})
      }
    });
  }
  
  return activities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Setup GitHub API routes
export function setupGitHubRoutes(app: Express) {
  // Get GitHub user
  app.get("/api/github/user/:username", (req: Request, res: Response) => {
    const { username } = req.params;
    const user = mockGitHubUsers.get(username);
    
    if (!user) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    
    res.json(user);
  });
  
  // Get GitHub repositories
  app.get("/api/github/repos/:username", (req: Request, res: Response) => {
    const { username } = req.params;
    const repos = mockGitHubRepos.get(username);
    
    if (!repos) {
      return res.status(404).json({ message: "GitHub repositories not found" });
    }
    
    res.json(repos);
  });
  
  // Get GitHub contributions
  app.get("/api/github/contributions/:username", (req: Request, res: Response) => {
    const { username } = req.params;
    
    // Check if user exists
    if (!mockGitHubUsers.has(username)) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    
    const contributions = generateMockContributions(username);
    res.json(contributions);
  });
  
  // Get GitHub activities
  app.get("/api/github/activities/:username", (req: Request, res: Response) => {
    const { username } = req.params;
    
    // Check if user exists
    if (!mockGitHubUsers.has(username)) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    
    const activities = generateMockActivities(username);
    res.json(activities);
  });
  
  // Connect GitHub account
  app.post("/api/github/connect", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Check if GitHub username exists (in our mock data)
      const githubUser = mockGitHubUsers.get(username);
      if (!githubUser) {
        return res.status(404).json({ message: "GitHub user not found" });
      }
      
      // Check if user already exists in our system
      const existingUser = await storage.getUserByGitHubUsername(username);
      
      if (existingUser) {
        return res.json({ connected: true, username, userId: existingUser.id });
      }
      
      // Create new user in our system
      const newUser = await storage.createUser({
        username: githubUser.name || githubUser.login,
        password: Math.random().toString(36).substring(2, 15), // Random password for demo
        githubUsername: username,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio || "",
        location: githubUser.location || "",
        website: githubUser.blog || "",
        reputation: Math.floor(Math.random() * 500) + 100 // Random initial reputation
      });
      
      // Now get the repositories and import them
      const repos = mockGitHubRepos.get(username) || [];
      
      for (const repo of repos) {
        await storage.createRepository({
          userId: newUser.id,
          name: repo.name,
          description: repo.description || "",
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language
        });
      }
      
      res.json({ connected: true, username, userId: newUser.id });
    } catch (error) {
      console.error("Error connecting GitHub account:", error);
      res.status(500).json({ message: "Failed to connect GitHub account" });
    }
  });
  
  // Check GitHub connection status
  app.get("/api/github/status", async (req: Request, res: Response) => {
    // In a real app, this would check the session or token
    // For demo, we'll just return connected: false
    res.json({ connected: false });
  });
}
