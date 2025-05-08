import { metricsService } from '../metricsService';
import { dbService } from '../dbService';
import { ContrastType } from '../../types/wordPairs';
import { PracticeResult, PracticeSession } from '../../types/metrics';

// Mock the database service
jest.mock('../dbService', () => ({
  dbService: {
    savePracticeSession: jest.fn(async (session) => session.id),
    savePracticeResult: jest.fn(async (result) => result.id),
    calculateOverallStatistics: jest.fn(),
    queryPracticeResults: jest.fn(),
    getAllPracticeSessions: jest.fn(),
    getSessionsByLevel: jest.fn(),
  },
}));

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset any active session
    // @ts-ignore - accessing private property for testing
    metricsService.currentSession = null;
  });

  test('should start a new session', async () => {
    const sessionId = await metricsService.startSession(1);

    expect(sessionId).toBeTruthy();
    expect(dbService.savePracticeSession).toHaveBeenCalled();

    const session = dbService.savePracticeSession.mock.calls[0][0];
    expect(session.id).toBe(sessionId);
    expect(session.difficultyLevel).toBe(1);
    expect(session.startTime).toBeDefined();
    expect(session.endTime).toBeNull();
  });

  test('should end an active session', async () => {
    // Start a session first
    const sessionId = await metricsService.startSession(1);

    // End the session
    const result = await metricsService.endSession();

    expect(result).toBeTruthy();
    expect(result!.id).toBe(sessionId);
    expect(result!.endTime).toBeDefined();
    expect(dbService.savePracticeSession).toHaveBeenCalledTimes(2);

    // Should return null if no active session
    const noSessionResult = await metricsService.endSession();
    expect(noSessionResult).toBeNull();
  });

  test('should record practice results', async () => {
    // Start a session first
    await metricsService.startSession(1);

    // Record a practice
    const practiceData = {
      wordPair: {
        id: 'pair1',
        word1: 'bat',
        word2: 'pat',
        audioPrompt1: 'bat.mp3',
        audioPrompt2: 'pat.mp3',
        image1: 'bat.png',
        image2: 'pat.png',
        contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
        difficultyLevel: 1,
      },
      selectedWord: 'bat',
      targetWord: 'bat',
      responseTimeMs: 1500,
    };

    const result = await metricsService.recordPractice(practiceData);

    expect(result).toBeDefined();
    expect(result.isCorrect).toBe(true);
    expect(dbService.savePracticeResult).toHaveBeenCalled();
    expect(dbService.savePracticeSession).toHaveBeenCalledTimes(2); // Once for initial creation, once for update

    // Should update session statistics
    const updatedSession = dbService.savePracticeSession.mock.calls[1][0];
    expect(updatedSession.totalPractices).toBe(1);
    expect(updatedSession.correctPractices).toBe(1);
    expect(updatedSession.contrastTypes).toContain(ContrastType.PLOSIVE_VOICED_UNVOICED);
  });

  test('should throw error when recording practice without active session', async () => {
    const practiceData = {
      wordPair: {
        id: 'pair1',
        word1: 'bat',
        word2: 'pat',
        audioPrompt1: 'bat.mp3',
        audioPrompt2: 'pat.mp3',
        image1: 'bat.png',
        image2: 'pat.png',
        contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
        difficultyLevel: 1,
      },
      selectedWord: 'bat',
      targetWord: 'bat',
      responseTimeMs: 1500,
    };

    await expect(metricsService.recordPractice(practiceData)).rejects.toThrow('No active session');
  });

  test('should get the current session', async () => {
    // No session initially
    expect(metricsService.getCurrentSession()).toBeNull();

    // Start a session
    await metricsService.startSession(1);

    // Should return the active session
    const currentSession = metricsService.getCurrentSession();
    expect(currentSession).toBeDefined();
    expect(currentSession!.difficultyLevel).toBe(1);
  });

  test('should get overall statistics', async () => {
    const mockStats = {
      totalSessions: 5,
      totalPractices: 50,
      correctPractices: 45,
      accuracyPercentage: 90,
      averageResponseTimeMs: 1200,
      contrastStatistics: [],
      progressByLevel: [],
      lastSessionTimestamp: 1234567890,
      totalRetries: 10,
      successfulRetries: 8,
    };

    (dbService.calculateOverallStatistics as jest.Mock).mockResolvedValue(mockStats);

    const stats = await metricsService.getOverallStatistics();

    expect(stats).toEqual(mockStats);
    expect(dbService.calculateOverallStatistics).toHaveBeenCalled();
  });

  test('should query practice results', async () => {
    const mockResults: PracticeResult[] = [
      {
        id: 'result1',
        sessionId: 'session1',
        wordPairId: 'pair1',
        targetWord: 'bat',
        selectedWord: 'bat',
        isCorrect: true,
        responseTimeMs: 1200,
        timestamp: 1234567890,
        contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
        difficultyLevel: 1,
      },
    ];

    (dbService.queryPracticeResults as jest.Mock).mockResolvedValue(mockResults);

    const query = { sessionId: 'session1' };
    const results = await metricsService.getPracticeResults(query);

    expect(results).toEqual(mockResults);
    expect(dbService.queryPracticeResults).toHaveBeenCalledWith(query);
  });

  test('should get contrast accuracy', async () => {
    const mockResults: PracticeResult[] = [
      {
        id: 'result1',
        sessionId: 'session1',
        wordPairId: 'pair1',
        targetWord: 'bat',
        selectedWord: 'bat',
        isCorrect: true,
        responseTimeMs: 1200,
        timestamp: 1234567890,
        contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
        difficultyLevel: 1,
      },
      {
        id: 'result2',
        sessionId: 'session1',
        wordPairId: 'pair2',
        targetWord: 'pat',
        selectedWord: 'bat', // Incorrect
        isCorrect: false,
        responseTimeMs: 1500,
        timestamp: 1234567891,
        contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
        difficultyLevel: 1,
      },
    ];

    (dbService.queryPracticeResults as jest.Mock).mockResolvedValue(mockResults);

    const accuracy = await metricsService.getContrastAccuracy(ContrastType.PLOSIVE_VOICED_UNVOICED);

    expect(accuracy).toBe(50); // 1/2 * 100 = 50%
    expect(dbService.queryPracticeResults).toHaveBeenCalledWith({
      contrastType: ContrastType.PLOSIVE_VOICED_UNVOICED,
    });
  });
});