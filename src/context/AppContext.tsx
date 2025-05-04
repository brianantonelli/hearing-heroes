import React, { createContext, useReducer, useContext } from 'react';

// Define app state
interface AppState {
  isAuthenticated: boolean;
  currentLevel: number;
  isAudioEnabled: boolean;
  childName: string;
}

// Define action types
type AppAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'SET_CHILD_NAME'; payload: string };

// Initial state
const initialState: AppState = {
  isAuthenticated: false,
  currentLevel: 1,
  isAudioEnabled: true,
  childName: 'Samantha', // Default name, can be changed in settings
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
    default:
      return state;
  }
}

// Context provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);