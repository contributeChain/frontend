import { Octokit } from '@octokit/core';
import { createOAuthUserAuth } from '@octokit/auth-oauth-user';
import { createTokenAuth } from '@octokit/auth-token';

// GitHub OAuth App credentials
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

// Initialize base Octokit instance
export const octokit = new Octokit();

// Initialize OAuth-authenticated Octokit instance
export async function createAuthenticatedClient(code: string) {
  const auth = createOAuthUserAuth({
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    code,
  });

  return new Octokit({ auth });
}

// Initialize token-authenticated Octokit instance
export function createTokenClient(token: string) {
  return new Octokit({
    authStrategy: createTokenAuth,
    auth: token,
  });
}

// GitHub API helpers
export async function getAuthenticatedUser(client: Octokit) {
  const { data: user } = await client.request('GET /user');
  return user;
}

export async function getUserProfile(username: string) {
  const { data: profile } = await octokit.request('GET /users/{username}', {
    username,
  });
  return profile;
}

export async function getUserRepositories(username: string) {
  const { data: repositories } = await octokit.request('GET /users/{username}/repos', {
    username,
    sort: 'updated',
    per_page: 100,
  });
  return repositories;
}

export async function getRepository(owner: string, repo: string) {
  const { data: repository } = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });
  return repository;
}

export async function getRepositoryContributions(owner: string, repo: string) {
  const { data: stats } = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
    owner,
    repo,
  });
  return stats;
}

// Types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  visibility: string;
}

export interface ContributionStats {
  author: {
    login: string;
    id: number;
  };
  total: number;
  weeks: Array<{
    w: string;
    a: number;
    d: number;
    c: number;
  }>;
} 