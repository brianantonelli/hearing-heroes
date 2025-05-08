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
  isMusicEnabled: boolean; // New setting for background music 
  musicVolume: number;     // Volume for background music (0.0 to 1.0)
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