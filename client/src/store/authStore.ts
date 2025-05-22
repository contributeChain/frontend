import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile,
  getLocalUserProfile,
  storeLocalUserProfile,
  clearLocalUserProfile,
  getGitHubAuthUrl,
  linkWalletWithGitHubToken
} from '@/lib/auth-service';
import { type GitHubUser } from '@/lib/githubClient';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  connectGitHub: () => void;
  updateUserWithGitHub: (accessToken: string, address: string, ensName?: string) => Promise<UserProfile>;
  initWallet: (address: string, isConnected: boolean) => void;
  updateUserWithGitHubInfo: (address: string, githubUser: GitHubUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      
      login: (profile: UserProfile) => {
        console.log('Logging in with profile:', profile);
        set({ user: profile, isAuthenticated: !!profile.isAuthenticated });
        storeLocalUserProfile(profile);
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
        clearLocalUserProfile();
      },
      
      updateUser: (userData: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) return;
        
        const updatedUser = { ...user, ...userData };
        set({ user: updatedUser });
        storeLocalUserProfile(updatedUser);
      },
      
      connectGitHub: () => {
        // Redirect to GitHub OAuth flow
        window.location.href = getGitHubAuthUrl();
      },
      
      updateUserWithGitHub: async (accessToken: string, address: string, ensName?: string): Promise<UserProfile> => {
        try {
          if (!address) {
            throw new Error("No wallet connected");
          }
          
          // Link wallet with GitHub using the token
          const updatedProfile = await linkWalletWithGitHubToken(
            address,
            ensName,
            accessToken
          );
          
          // Update user in state
          set({ 
            user: updatedProfile,
            isAuthenticated: !!updatedProfile.isAuthenticated 
          });
          
          storeLocalUserProfile(updatedProfile);
          return updatedProfile;
        } catch (error) {
          console.error("Error updating user with GitHub:", error);
          throw error;
        }
      },
      
      initWallet: (address: string, isConnected: boolean) => {
        const { user } = get();
        
        if (address && isConnected) {
          // Check if we have a different address than stored
          if (user && user.walletAddress !== address) {
            // Clear the current user if a different wallet connects
            set({ user: null, isAuthenticated: false });
            clearLocalUserProfile();
          } 
          // If no user is set but we have an address, we can create a basic profile
          else if (!user) {
            const newUser: UserProfile = {
              walletAddress: address,
              isAuthenticated: false
            };
            set({ user: newUser, isAuthenticated: false });
            storeLocalUserProfile(newUser);
          }
        } else if (!isConnected && user) {
          // If wallet disconnects, clear the user
          set({ user: null, isAuthenticated: false });
          clearLocalUserProfile();
        }
        
        // Set loading to false after initialization
        set({ loading: false });
      },
      
      updateUserWithGitHubInfo: (address: string, githubUser: GitHubUser) => {
        const { user } = get();
        
        if (!user || user.walletAddress !== address) return;
        
        if (!user.githubUser || user.githubUser.id !== githubUser.id) {
          const updatedProfile: UserProfile = {
            ...user,
            githubUser,
            isAuthenticated: true,
          };
          set({ 
            user: updatedProfile,
            isAuthenticated: true
          });
          storeLocalUserProfile(updatedProfile);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
); 