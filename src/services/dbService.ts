import { openDB, IDBPDatabase } from 'idb';
import { PracticeResult, PracticeSession, PracticeResultQuery, OverallStatistics, ContrastStatistics } from '../types/metrics';
import { ContrastType } from '../types/wordPairs';

const DB_NAME = 'hearing-heroes-db';
const DB_VERSION = 1;

// Store names
const PRACTICE_RESULTS_STORE = 'practiceResults';
const PRACTICE_SESSIONS_STORE = 'practiceSessions';

// Interface for our database
interface HearingHeroesDB extends IDBPDatabase {
  [PRACTICE_RESULTS_STORE]: PracticeResult[];
  [PRACTICE_SESSIONS_STORE]: PracticeSession[];
}

// Create or open the database
async function openDatabase(): Promise<HearingHeroesDB> {
  return openDB<HearingHeroesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(PRACTICE_RESULTS_STORE)) {
        const practiceResultsStore = db.createObjectStore(PRACTICE_RESULTS_STORE, { keyPath: 'id' });
        practiceResultsStore.createIndex('sessionId', 'sessionId', { unique: false });
        practiceResultsStore.createIndex('contrastType', 'contrastType', { unique: false });
        practiceResultsStore.createIndex('difficultyLevel', 'difficultyLevel', { unique: false });
        practiceResultsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(PRACTICE_SESSIONS_STORE)) {
        const practiceSessionsStore = db.createObjectStore(PRACTICE_SESSIONS_STORE, { keyPath: 'id' });
        practiceSessionsStore.createIndex('startTime', 'startTime', { unique: false });
        practiceSessionsStore.createIndex('difficultyLevel', 'difficultyLevel', { unique: false });
      }
    }
  });
}

/**
 * Service for interacting with the IndexedDB database
 */
export class DBService {
  private db: Promise<HearingHeroesDB>;
  
  constructor() {
    this.db = openDatabase();
  }
  
  // Practice Results CRUD operations
  
  /**
   * Save a practice result
   */
  async savePracticeResult(result: PracticeResult): Promise<string> {
    const db = await this.db;
    await db.put(PRACTICE_RESULTS_STORE, result);
    return result.id;
  }
  
  /**
   * Get a practice result by ID
   */
  async getPracticeResult(id: string): Promise<PracticeResult | undefined> {
    const db = await this.db;
    return db.get(PRACTICE_RESULTS_STORE, id);
  }
  
  /**
   * Query practice results based on filters
   */
  async queryPracticeResults(query: PracticeResultQuery): Promise<PracticeResult[]> {
    const db = await this.db;
    
    // Use the most specific index available for the query
    let store = db.transaction(PRACTICE_RESULTS_STORE).objectStore(PRACTICE_RESULTS_STORE);
    let results: PracticeResult[] = [];
    
    if (query.sessionId) {
      // If filtering by session ID, use the sessionId index
      const index = store.index('sessionId');
      results = await index.getAll(query.sessionId);
    } else if (query.contrastType) {
      // If filtering by contrast type, use the contrastType index
      const index = store.index('contrastType');
      results = await index.getAll(query.contrastType);
    } else if (query.difficultyLevel !== undefined) {
      // If filtering by difficulty level, use the difficultyLevel index
      const index = store.index('difficultyLevel');
      results = await index.getAll(query.difficultyLevel);
    } else {
      // Otherwise, get all results
      results = await store.getAll();
    }
    
    // Apply additional filters that couldn't be handled by the index
    if (query.startDate !== undefined || query.endDate !== undefined) {
      results = results.filter(result => {
        const timestamp = result.timestamp;
        if (query.startDate !== undefined && timestamp < query.startDate) {
          return false;
        }
        if (query.endDate !== undefined && timestamp > query.endDate) {
          return false;
        }
        return true;
      });
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply limit and offset
    if (query.offset !== undefined) {
      results = results.slice(query.offset);
    }
    if (query.limit !== undefined) {
      results = results.slice(0, query.limit);
    }
    
    return results;
  }
  
  // Practice Sessions CRUD operations
  
  /**
   * Save a practice session
   */
  async savePracticeSession(session: PracticeSession): Promise<string> {
    const db = await this.db;
    await db.put(PRACTICE_SESSIONS_STORE, session);
    return session.id;
  }
  
  /**
   * Get a practice session by ID
   */
  async getPracticeSession(id: string): Promise<PracticeSession | undefined> {
    const db = await this.db;
    return db.get(PRACTICE_SESSIONS_STORE, id);
  }
  
  /**
   * Get all practice sessions
   */
  async getAllPracticeSessions(): Promise<PracticeSession[]> {
    const db = await this.db;
    return db.getAll(PRACTICE_SESSIONS_STORE);
  }

  /**
   * Get practice sessions by difficulty level
   */
  async getSessionsByLevel(level: number): Promise<PracticeSession[]> {
    const db = await this.db;
    const index = db.transaction(PRACTICE_SESSIONS_STORE).objectStore(PRACTICE_SESSIONS_STORE).index('difficultyLevel');
    return index.getAll(level);
  }
  
  /**
   * Calculate overall statistics
   */
  async calculateOverallStatistics(): Promise<OverallStatistics> {
    const db = await this.db;
    
    // Get all completed sessions and practice results
    const sessionsStore = db.transaction(PRACTICE_SESSIONS_STORE).objectStore(PRACTICE_SESSIONS_STORE);
    const sessions = await sessionsStore.getAll();
    const completedSessions = sessions.filter(session => session.endTime !== null);
    
    const resultsStore = db.transaction(PRACTICE_RESULTS_STORE).objectStore(PRACTICE_RESULTS_STORE);
    const allResults = await resultsStore.getAll();
    
    // Calculate overall statistics
    const totalSessions = completedSessions.length;
    const totalPractices = allResults.length;
    const correctPractices = allResults.filter(result => result.isCorrect).length;
    const accuracyPercentage = totalPractices > 0 ? (correctPractices / totalPractices) * 100 : 0;
    
    // Calculate average response time
    const totalResponseTime = allResults.reduce((sum, result) => sum + result.responseTimeMs, 0);
    const averageResponseTimeMs = totalPractices > 0 ? totalResponseTime / totalPractices : 0;
    
    // Group results by contrast type
    const contrastMap = new Map<ContrastType, PracticeResult[]>();
    allResults.forEach(result => {
      const contrastType = result.contrastType;
      if (!contrastMap.has(contrastType)) {
        contrastMap.set(contrastType, []);
      }
      contrastMap.get(contrastType)!.push(result);
    });
    
    // Calculate statistics for each contrast type
    const contrastStatistics: ContrastStatistics[] = [];
    contrastMap.forEach((results, contrastType) => {
      const totalPractices = results.length;
      const correctPractices = results.filter(result => result.isCorrect).length;
      const accuracyPercentage = totalPractices > 0 ? (correctPractices / totalPractices) * 100 : 0;
      const totalResponseTime = results.reduce((sum, result) => sum + result.responseTimeMs, 0);
      const averageResponseTimeMs = totalPractices > 0 ? totalResponseTime / totalPractices : 0;
      
      // Calculate retry statistics
      const retries = results.filter(result => result.isRetry);
      const retryCount = retries.length;
      const successfulRetries = retries.filter(result => result.isCorrect).length;
      const retrySuccessRate = retryCount > 0 ? (successfulRetries / retryCount) * 100 : 0;
      
      contrastStatistics.push({
        contrastType,
        totalPractices,
        correctPractices,
        accuracyPercentage,
        retryCount,
        retrySuccessRate,
        averageResponseTimeMs,
      });
    });
    
    // Calculate progress by level
    const levelMap = new Map<number, PracticeResult[]>();
    allResults.forEach(result => {
      const level = result.difficultyLevel;
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level)!.push(result);
    });
    
    const progressByLevel = Array.from(levelMap.entries()).map(([level, results]) => {
      const totalPractices = results.length;
      const correctPractices = results.filter(result => result.isCorrect).length;
      const accuracy = totalPractices > 0 ? (correctPractices / totalPractices) * 100 : 0;
      return { level, accuracy };
    });
    
    // Sort levels in ascending order
    progressByLevel.sort((a, b) => a.level - b.level);
    
    // Get the most recent session timestamp
    const lastSession = completedSessions.sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];
    const lastSessionTimestamp = lastSession ? lastSession.endTime : null;
    
    // Calculate overall retry statistics
    const totalRetries = allResults.filter(result => result.isRetry).length;
    const successfulRetries = allResults.filter(result => result.isRetry && result.isCorrect).length;
    const retrySuccessRate = totalRetries > 0 ? (successfulRetries / totalRetries) * 100 : 0;

    return {
      totalSessions,
      totalPractices,
      correctPractices,
      accuracyPercentage,
      totalRetries,
      successfulRetries,
      retrySuccessRate,
      averageResponseTimeMs,
      contrastStatistics,
      progressByLevel,
      lastSessionTimestamp,
    };
  }
}

// Export singleton instance
export const dbService = new DBService();