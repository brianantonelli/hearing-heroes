/**
 * Types for metrics and session data
 */

import { ContrastType } from './wordPairs';

// Represents the result of a single word pair practice
export interface PracticeResult {
  id: string;            // Unique identifier for this practice result
  sessionId: string;     // ID of the session this belongs to
  wordPairId: string;    // ID of the word pair that was practiced
  targetWord: string;    // The word that was the correct answer
  selectedWord: string;  // The word that was selected by the user
  isCorrect: boolean;    // Whether the selection was correct
  responseTimeMs: number; // How long it took to respond in milliseconds
  timestamp: number;     // When this practice happened (Unix timestamp)
  contrastType: ContrastType; // Type of contrast in this practice
  difficultyLevel: number; // Difficulty level of this practice
}

// Represents a practice session
export interface PracticeSession {
  id: string;            // Unique identifier for this session
  startTime: number;     // When the session started (Unix timestamp)
  endTime: number | null; // When the session ended (Unix timestamp), null if ongoing
  difficultyLevel: number; // Difficulty level for this session
  totalPractices: number; // Total number of practices in this session
  correctPractices: number; // Number of correct practices
  averageResponseTimeMs: number; // Average response time in milliseconds
  contrastTypes: ContrastType[]; // Types of contrasts practiced in this session
}

// Summary statistics for a specific contrast type
export interface ContrastStatistics {
  contrastType: ContrastType; // The type of contrast
  totalPractices: number;    // Total number of practices with this contrast
  correctPractices: number;  // Number of correct practices
  accuracyPercentage: number; // Accuracy as a percentage
  averageResponseTimeMs: number; // Average response time in milliseconds
}

// Overall statistics for all practice sessions
export interface OverallStatistics {
  totalSessions: number;    // Total number of completed sessions
  totalPractices: number;   // Total number of practices across all sessions
  correctPractices: number; // Total number of correct practices
  accuracyPercentage: number; // Overall accuracy as a percentage
  averageResponseTimeMs: number; // Overall average response time in milliseconds
  contrastStatistics: ContrastStatistics[]; // Statistics broken down by contrast type
  progressByLevel: { level: number; accuracy: number }[]; // Progress by difficulty level
  lastSessionTimestamp: number | null; // Timestamp of the last session
}

// Parameters for querying practice results
export interface PracticeResultQuery {
  sessionId?: string;    // Filter by session ID
  contrastType?: ContrastType; // Filter by contrast type
  difficultyLevel?: number; // Filter by difficulty level
  startDate?: number;    // Filter by start date (Unix timestamp)
  endDate?: number;      // Filter by end date (Unix timestamp)
  limit?: number;        // Limit the number of results
  offset?: number;       // Offset for pagination
}