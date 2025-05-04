import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { preferencesService } from '../services/preferencesService';
import { Preferences } from '../types/preferences';

// Define app state
interface AppState {
  isAuthenticated: boolean;
  currentLevel: number;
  isAudioEnabled: boolean;
  childName: string;
  // Extended preferences
  maxSessionMinutes: number;
  requireParentAuth: boolean;
  enableAnimations: boolean;
  showLevelSelection: boolean;
  difficultyMultiplier: number; // Controls how quickly difficulty increases
}

// Define action types
type AppAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'SET_CHILD_NAME'; payload: string }
  | { type: 'SET_MAX_SESSION_MINUTES'; payload: number }
  | { type: 'TOGGLE_PARENT_AUTH' }
  | { type: 'TOGGLE_ANIMATIONS' }
  | { type: 'TOGGLE_LEVEL_SELECTION' }
  | { type: 'SET_DIFFICULTY_MULTIPLIER'; payload: number };

// Initial state
const initialState: AppState = {
  isAuthenticated: false,
  currentLevel: 1,
  isAudioEnabled: true,
  childName: 'Samantha', // Default name, can be changed in settings
  maxSessionMinutes: 15,
  requireParentAuth: true,
  enableAnimations: true,
  showLevelSelection: false,
  difficultyMultiplier: 1.0,
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer function to handle state updates
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
      };
    case 'SET_LEVEL':
      return {
        ...state,
        currentLevel: action.payload,
      };
    case 'TOGGLE_AUDIO':
      return {
        ...state,
        isAudioEnabled: !state.isAudioEnabled,
      };
    case 'SET_CHILD_NAME':
      return {
        ...state,
        childName: action.payload,
      };
    case 'SET_MAX_SESSION_MINUTES':
      return {
        ...state,
        maxSessionMinutes: action.payload,
      };
    case 'TOGGLE_PARENT_AUTH':
      return {
        ...state,
        requireParentAuth: !state.requireParentAuth,
      };
    case 'TOGGLE_ANIMATIONS':
      return {
        ...state,
        enableAnimations: !state.enableAnimations,
      };
    case 'TOGGLE_LEVEL_SELECTION':
      return {
        ...state,
        showLevelSelection: !state.showLevelSelection,
      };
    case 'SET_DIFFICULTY_MULTIPLIER':
      return {
        ...state,
        difficultyMultiplier: action.payload,
      };
    default:
      return state;
  }
}

// Context provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load preferences from DB on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await preferencesService.loadPreferences();
        
        // Update context with stored preferences
        if (prefs.childName && prefs.childName !== state.childName) {
          dispatch({ type: 'SET_CHILD_NAME', payload: prefs.childName });
        }
        
        if (prefs.currentLevel !== state.currentLevel) {
          dispatch({ type: 'SET_LEVEL', payload: prefs.currentLevel });
        }
        
        if (prefs.isAudioEnabled !== state.isAudioEnabled) {
          dispatch({ type: 'TOGGLE_AUDIO' });
        }
        
        if (prefs.maxSessionMinutes !== state.maxSessionMinutes) {
          dispatch({ type: 'SET_MAX_SESSION_MINUTES', payload: prefs.maxSessionMinutes });
        }
        
        if (prefs.requireParentAuth !== state.requireParentAuth) {
          dispatch({ type: 'TOGGLE_PARENT_AUTH' });
        }
        
        if (prefs.enableAnimations !== state.enableAnimations) {
          dispatch({ type: 'TOGGLE_ANIMATIONS' });
        }
        
        if (prefs.showLevelSelection !== state.showLevelSelection) {
          dispatch({ type: 'TOGGLE_LEVEL_SELECTION' });
        }
        
        if (prefs.difficultyMultiplier !== state.difficultyMultiplier) {
          dispatch({ type: 'SET_DIFFICULTY_MULTIPLIER', payload: prefs.difficultyMultiplier });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
    
    loadPreferences();
  }, []);

  // Sync state changes to DB
  useEffect(() => {
    async function syncPreferences() {
      try {
        const prefsToSync = preferencesService.appStateToPreferences(state);
        await preferencesService.savePreferences(prefsToSync);
      } catch (error) {
        console.error('Error syncing preferences:', error);
      }
    }
    
    // Skip initial render sync since we load from DB first
    const isInitialRender = state === initialState;
    if (!isInitialRender) {
      syncPreferences();
    }
  }, [
    state.childName, 
    state.currentLevel, 
    state.isAudioEnabled,
    state.maxSessionMinutes,
    state.requireParentAuth,
    state.enableAnimations,
    state.showLevelSelection,
    state.difficultyMultiplier
  ]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);