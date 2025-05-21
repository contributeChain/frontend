import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { networkConfig, lensClient, authenticateWithLens, checkLensProfile } from '@/lib/lensClient';

interface LensState {
  hasProfile: boolean | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: (address: string, walletClient: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: (address: string | undefined) => Promise<void>;
}

export const useLensStore = create<LensState>()(
  (set, get) => ({
    hasProfile: null,
    isAuthenticated: false,
    isLoading: false,
    
    checkAuth: async (address: string | undefined) => {
      if (!address) {
        set({
          isAuthenticated: false,
          hasProfile: null,
          isLoading: false
        });
        return;
      }

      set({ isLoading: true });
      
      try {
        // Check if the user is already authenticated
        const resumed = await lensClient.resumeSession();
        const isAuthenticated = resumed.isOk();
        
        // Check if the user has a Lens profile
        const profileResult = await checkLensProfile(address);
        
        set({ 
          isAuthenticated,
          hasProfile: profileResult.hasProfile 
        });
      } catch (error) {
        console.error("Error checking Lens authentication:", error);
        set({ isAuthenticated: false });
      } finally {
        set({ isLoading: false });
      }
    },
    
    authenticate: async (address: string, walletClient: any): Promise<boolean> => {
      if (!address || !walletClient) {
        return false;
      }
      
      set({ isLoading: true });
      
      try {
        const authResult = await authenticateWithLens(address, walletClient);
        
        if (authResult.success) {
          set({ isAuthenticated: true });
          
          // After successful auth, check for profile
          const profileResult = await checkLensProfile(address);
          set({ hasProfile: profileResult.hasProfile });
          
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error authenticating with Lens:", error);
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    logout: async (): Promise<void> => {
      set({ isLoading: true });
      
      try {
        // Clear the session from storage
        localStorage.removeItem('lens.session.key');
        sessionStorage.removeItem('lens.session.key');
        
        // Update state
        set({ isAuthenticated: false });
      } catch (error) {
        console.error("Error logging out from Lens:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  })
); 