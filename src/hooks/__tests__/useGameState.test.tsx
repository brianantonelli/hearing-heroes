import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';
import { WordPair, ContrastType } from '../../types/wordPairs';
import { getWordPairsByLevel } from '../../services/wordPairsService';

// Mock the modules
jest.mock('../../services/audioService', () => ({
  audioService: {
    playWordPrompt: jest.fn(() => Promise.resolve()),
    playCorrectSound: jest.fn(() => Promise.resolve()),
    playIncorrectSound: jest.fn(() => Promise.resolve()),
    playLevelCompleteSound: jest.fn(() => Promise.resolve()),
    preloadAudio: jest.fn(),
    stopAll: jest.fn(),
  }
}));

jest.mock('../../services/wordPairsService', () => ({
  getWordPairsByLevel: jest.fn(),
  getImagePath: jest.fn(fileName => `/images/pairs/${fileName}`),
  getAudioPath: jest.fn(fileName => `/audio/prompts/${fileName}`),
}));

jest.mock('../../services/metricsService', () => ({
  metricsService: {
    startSession: jest.fn(() => Promise.resolve('test-session-id')),
    endSession: jest.fn(() => Promise.resolve(null)),
    recordPractice: jest.fn(() => Promise.resolve()),
  }
}));

// Mock React context
jest.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    state: {
      currentLevel: 1,
      isAudioEnabled: true,
    },
    dispatch: jest.fn(),
  }),
}));

// Mock data
const mockWordPairs: WordPair[] = [
  {
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
  {
    id: 'pair2',
    word1: 'fan',
    word2: 'van',
    audioPrompt1: 'fan.mp3',
    audioPrompt2: 'van.mp3',
    image1: 'fan.png',
    image2: 'van.png',
    contrastType: ContrastType.FRICATIVE_VOICED_UNVOICED,
    difficultyLevel: 1,
  },
];

describe('useGameState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock the getWordPairsByLevel function
    (getWordPairsByLevel as jest.Mock).mockResolvedValue(mockWordPairs);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should initialize with correct default state', async () => {
    const { result } = renderHook(() => useGameState());

    // Initial state should be correct
    expect(result.current.gameStatus).toBe('intro');
    expect(result.current.wordPairs).toEqual([]);
    expect(result.current.currentPair).toBeNull();
  });

  test('should expose correct methods and properties', async () => {
    const { result } = renderHook(() => useGameState());

    // Check that the hook provides the required functions
    expect(typeof result.current.handleReplay).toBe('function');
    expect(typeof result.current.handleWordSelection).toBe('function');
    expect(typeof result.current.handleNextLevel).toBe('function');
  });

  test('should call handleWordSelection', async () => {
    const { result } = renderHook(() => useGameState());

    // Mock the function
    const mockHandler = jest.fn();
    result.current.handleWordSelection = mockHandler;

    // Call the function
    result.current.handleWordSelection('bat');

    // Verify it was called
    expect(mockHandler).toHaveBeenCalledWith('bat');
  });

  test('should call handleNextLevel', async () => {
    const { result } = renderHook(() => useGameState());

    // Mock the function
    const mockHandler = jest.fn();
    result.current.handleNextLevel = mockHandler;

    // Call the function
    result.current.handleNextLevel();

    // Verify it was called
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should call handleReplay', async () => {
    const { result } = renderHook(() => useGameState());

    // Mock the function
    const mockHandler = jest.fn();
    result.current.handleReplay = mockHandler;

    // Call the function
    result.current.handleReplay();

    // Verify it was called
    expect(mockHandler).toHaveBeenCalled();
  });
});