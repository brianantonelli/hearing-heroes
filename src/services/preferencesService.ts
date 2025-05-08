/**
 * Service for managing user preferences
 * Handles synchronization between AppContext and IndexedDB
 */
import { dbService } from './dbService';
import { Preferences, PreferenceUpdate } from '../types/preferences';

class PreferencesService {
  /**
   * Load preferences from DB and return them
   * If no preferences exist, creates default preferences
   */
  async loadPreferences(id: string = 'default'): Promise<Preferences> {
    let preferences = await dbService.getPreferences(id);
    
    if (!preferences) {
      // Create default preferences
      const defaultPreferences: Preferences = {
        id,
        childName: 'Samantha',
        isAudioEnabled: true,
        isMusicEnabled: true,
        musicVolume: 0.4,
        currentLevel: 1,
        maxSessionMinutes: 15,
        difficultyMultiplier: 1.0,
        enableAnimations: true,
        showLevelSelection: false,
        requireParentAuth: true,
        lastUpdated: Date.now()
      };
      
      await dbService.savePreferences(defaultPreferences);
      preferences = defaultPreferences;
    }
    
    return preferences;
  }
  
  /**
   * Save preferences to DB
   */
  async savePreferences(preferences: Preferences): Promise<void> {
    preferences.lastUpdated = Date.now();
    await dbService.savePreferences(preferences);
  }
  
  /**
   * Update a single preference value
   */
  async updatePreference(key: keyof Preferences, value: any, id: string = 'default'): Promise<void> {
    await dbService.updatePreference(key, value, id);
  }
  
  /**
   * Bulk update preferences with multiple updates
   */
  async bulkUpdatePreferences(updates: PreferenceUpdate[], id: string = 'default'): Promise<Preferences> {
    let preferences = await this.loadPreferences(id);
    
    // Apply all updates
    for (const update of updates) {
      // Type assertion to avoid TypeScript error with indexing
      (preferences as any)[update.key] = update.value;
    }
    
    // Save updated preferences
    preferences.lastUpdated = Date.now();
    await this.savePreferences(preferences);
    
    return preferences;
  }
  
  /**
   * Convert AppState to Preferences object
   */
  appStateToPreferences(state: {
    childName: string;
    isAudioEnabled: boolean;
    isMusicEnabled: boolean;
    musicVolume: number;
    currentLevel: number;
    maxSessionMinutes: number;
    difficultyMultiplier: number;
    enableAnimations: boolean;
    showLevelSelection: boolean;
    requireParentAuth: boolean;
  }, id: string = 'default'): Preferences {
    return {
      id,
      childName: state.childName,
      isAudioEnabled: state.isAudioEnabled,
      isMusicEnabled: state.isMusicEnabled,
      musicVolume: state.musicVolume,
      currentLevel: state.currentLevel,
      maxSessionMinutes: state.maxSessionMinutes,
      difficultyMultiplier: state.difficultyMultiplier,
      enableAnimations: state.enableAnimations,
      showLevelSelection: state.showLevelSelection,
      requireParentAuth: state.requireParentAuth,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Clear all practice data but keep preferences
   */
  async clearPracticeData(): Promise<void> {
    await dbService.clearPracticeData();
  }
  
  /**
   * Reset preferences to defaults
   */
  async resetPreferences(id: string = 'default'): Promise<Preferences> {
    const defaultPreferences: Preferences = {
      id,
      childName: 'Samantha',
      isAudioEnabled: true,
      isMusicEnabled: true,
      musicVolume: 0.4,
      currentLevel: 1,
      maxSessionMinutes: 15,
      difficultyMultiplier: 1.0,
      enableAnimations: true,
      showLevelSelection: false, 
      requireParentAuth: true,
      lastUpdated: Date.now()
    };
    
    await this.savePreferences(defaultPreferences);
    return defaultPreferences;
  }
  
  /**
   * Reset all data including preferences and practice data
   */
  async resetAllData(): Promise<void> {
    await dbService.clearAllData();
    // Create default preferences again
    await this.resetPreferences();
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();