import { loadYamlFile } from '../utils/yamlLoader';
import { WordPairsData, WordPair, ContrastType } from '../types/wordPairs';

// Default path to word pairs YAML file
const WORD_PAIRS_PATH = '/data/wordPairs.yml';

// Cache for loaded word pairs
let wordPairsCache: WordPairsData | null = null;

/**
 * Load word pairs data from YAML file
 * 
 * @param forceFresh - Whether to force a fresh load from the file (ignoring cache)
 * @returns Promise resolving to the WordPairsData
 */
export async function loadWordPairs(forceFresh = false): Promise<WordPairsData> {
  // Return cached data if available and not forcing fresh load
  if (wordPairsCache && !forceFresh) {
    return wordPairsCache;
  }
  
  try {
    // Load and parse the YAML file
    const data = await loadYamlFile<WordPairsData>(WORD_PAIRS_PATH);
    
    // Cache the loaded data
    wordPairsCache = data;
    
    return data;
  } catch (error) {
    console.error('Failed to load word pairs:', error);
    throw new Error('Failed to load word pairs data');
  }
}

/**
 * Get word pairs filtered by difficulty level
 * 
 * @param level - The difficulty level to filter by
 * @returns Promise resolving to an array of word pairs at the specified level
 */
export async function getWordPairsByLevel(level: number): Promise<WordPair[]> {
  const data = await loadWordPairs();
  return data.wordPairs.filter(pair => pair.difficultyLevel === level);
}

/**
 * Get word pairs filtered by contrast type
 * 
 * @param contrastType - The contrast type to filter by
 * @returns Promise resolving to an array of word pairs with the specified contrast type
 */
export async function getWordPairsByContrast(contrastType: ContrastType): Promise<WordPair[]> {
  const data = await loadWordPairs();
  return data.wordPairs.filter(pair => pair.contrastType === contrastType);
}

/**
 * Get a specific word pair by ID
 * 
 * @param id - The ID of the word pair to find
 * @returns Promise resolving to the word pair with the matching ID, or undefined if not found
 */
export async function getWordPairById(id: string): Promise<WordPair | undefined> {
  const data = await loadWordPairs();
  return data.wordPairs.find(pair => pair.id === id);
}

/**
 * Get full asset path for an image file
 * 
 * @param imageFileName - The filename of the image from the YAML data
 * @returns The full path to the image asset
 */
export function getImagePath(imageFileName: string): string {
  return `/images/pairs/${imageFileName}`;
}

/**
 * Get full asset path for an audio file
 * 
 * @param audioFileName - The filename of the audio from the YAML data
 * @returns The full path to the audio asset
 */
export function getAudioPath(audioFileName: string): string {
  return `/audio/prompts/${audioFileName}`;
}