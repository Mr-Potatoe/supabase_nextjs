import { create } from 'zustand';

// Define the UI state store
interface UIState {
  // Switch component state
  switchStates: Record<string, boolean>;
  setSwitchState: (id: string, value: boolean) => void;
  
  // Location permission state
  locationPermissionAsked: boolean;
  setLocationPermissionAsked: (value: boolean) => void;
  
  // General UI state
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

// Create the store
export const useUIStore = create<UIState>((set) => ({
  // Switch component state
  switchStates: {},
  setSwitchState: (id: string, value: boolean) => 
    set((state) => ({ 
      switchStates: { 
        ...state.switchStates, 
        [id]: value 
      } 
    })),
  
  // Location permission state
  locationPermissionAsked: false,
  setLocationPermissionAsked: (value: boolean) => 
    set({ locationPermissionAsked: value }),
  
  // General UI state
  isLoading: false,
  setIsLoading: (value: boolean) => 
    set({ isLoading: value }),
}));

// Helper function to check if we're in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Initialize state from localStorage if available
if (isBrowser()) {
  try {
    const locationPermissionAsked = localStorage.getItem('locationPermissionAsked') === 'true';
    if (locationPermissionAsked) {
      useUIStore.setState({ locationPermissionAsked });
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
}
