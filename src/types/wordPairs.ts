/**
 * Types for word pair data structures
 */

// Types of consonant contrasts
export enum ContrastType {
  PLOSIVE_VOICED_UNVOICED = "plosive-voiced-unvoiced",   // p/b, t/d, k/g
  FRICATIVE_VOICED_UNVOICED = "fricative-voiced-unvoiced", // f/v, s/z
  NASAL_PLOSIVE = "nasal-plosive",         // m/b, n/d
  PLOSIVE_NASAL = "plosive-nasal",         // p/m, t/n
  FRICATIVE_PLOSIVE = "fricative-plosive",     // f/p, s/t
  APPROXIMANT_FRICATIVE = "approximant-fricative", // w/f, r/s
  LATERAL_RHOTIC = "lateral-rhotic",        // l/r
  FRICATIVE_APPROXIMANT = "fricative-approximant",   // v/w
  PLOSIVE_PLOSIVE = "plosive-plosive"       // p/t, t/k
}

// Information about a contrast type
export interface ContrastTypeInfo {
  id: ContrastType;
  name: string;
  description: string;
}

// A word pair for discrimination practice
export interface WordPair {
  id: string;
  word1: string;
  word2: string;
  audioPrompt1: string;
  audioPrompt2: string;
  image1: string;
  image2: string;
  contrastType: ContrastType;
  difficultyLevel: number;
}

// Complete word pairs data structure
export interface WordPairsData {
  contrastTypes: ContrastTypeInfo[];
  wordPairs: WordPair[];
}