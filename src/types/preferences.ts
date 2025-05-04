/**
 * Types for user preferences
 */

export interface Preferences {
  // Identifier for this preferences set
  id: string;

  // User information
  childName: string;
  
  // Game settings
  isAudioEnabled: boolean;
  currentLevel: number;
  maxSessionMinutes: number;
  difficultyMultiplier: number;
  
  // UI preferences
  enableAnimations: boolean;
  showLevelSelection: boolean;
  
  // Security settings
  requireParentAuth: boolean;
  
  // Last updated timestamp
  lastUpdated: number;
}

export interface PreferenceUpdate {
  key: keyof Preferences;
  value: any;
}