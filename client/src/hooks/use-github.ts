import { useGitHubStore } from '@/store';

// This is a compatibility layer to provide the same API as the old useGitHub hook
export function useGitHub() {
  const isAuthenticated = useGitHubStore((state) => state.isAuthenticated);
  const user = useGitHubStore((state) => state.user);
  const octokit = useGitHubStore((state) => state.octokit);
  const login = useGitHubStore((state) => state.login);
  const logout = useGitHubStore((state) => state.logout);

  return {
    isAuthenticated,
    user,
    authenticatedClient: octokit, // For backward compatibility
    login,
    logout
  };
} 