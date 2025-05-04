import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { WordPair } from '../types/wordPairs';
import { getWordPairsByLevel } from '../services/wordPairsService';
import { audioService } from '../services/audioService';
import { metricsService } from '../services/metricsService';
import { v4 as uuidv4 } from 'uuid';

// Game states
export type GameStatus = 'intro' | 'prompt' | 'selection' | 'feedback' | 'complete';

// Return type of the useGameState hook
export interface GameStateData {
  wordPairs: WordPair[];
  currentPairIndex: number;
  currentPair: WordPair | null;
  currentPromptWord: string | null;
  selectedWord: string | null;
  gameStatus: GameStatus;
  isCorrect: boolean | null;
  isRetry: boolean;
  score: {
    correct: number;
    total: number;
    retries: number;
    successfulRetries: number;
  };
  sessionId: string | null;
  handleWordSelection: (word: string) => void;
  handleReplay: () => void;
  handleRetry: () => void;
  handleNextLevel: () => void;
  progressPercentage: number;
}

/**
 * Custom hook to manage game state and logic
 * Separates game logic from UI components
 */
export const useGameState = (): GameStateData => {
  const { state, dispatch } = useAppContext();
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [currentPromptWord, setCurrentPromptWord] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('intro');
  const [score, setScore] = useState({
    correct: 0,
    total: 0,
    retries: 0,
    successfulRetries: 0
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRetry, setIsRetry] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const currentPairRef = useRef<WordPair | null>(null);

  // Calculate progress percentage
  const progressPercentage = wordPairs.length > 0 
    ? Math.min(100, Math.floor((currentPairIndex / wordPairs.length) * 100))
    : 0;

  // Get current pair
  const currentPair = wordPairs[currentPairIndex] || null;

  // Load word pairs for the current level
  useEffect(() => {
    const loadPairs = async () => {
      try {
        const pairs = await getWordPairsByLevel(state.currentLevel);
        if (pairs.length === 0) {
          console.error(`No word pairs found for level ${state.currentLevel}`);
          return;
        }
        
        // Shuffle the pairs for randomization
        const shuffledPairs = [...pairs].sort(() => Math.random() - 0.5);
        setWordPairs(shuffledPairs);
        
        // Start a new metrics session
        const newSessionId = await startNewSession(state.currentLevel);
        setSessionId(newSessionId);
        
        // Preload audio for all word pairs
        const audioPaths = shuffledPairs.flatMap(pair => [
          `/audio/prompts/${pair.audioPrompt1}`,
          `/audio/prompts/${pair.audioPrompt2}`
        ]);
        audioService.preloadAudio(audioPaths);
        
        // Also preload feedback sounds
        audioService.preloadAudio([
          '/audio/feedback/correct.mp3',
          '/audio/feedback/incorrect.mp3',
          '/audio/feedback/level_complete.mp3'
        ]);

        // Reset state when loading new pairs
        setCurrentPairIndex(0);
        setSelectedWord(null);
        setIsCorrect(null);
        setIsRetry(false);
        setGameStatus('intro');
        setScore({
          correct: 0,
          total: 0,
          retries: 0,
          successfulRetries: 0
        });
      } catch (error) {
        console.error('Error loading word pairs:', error);
      }
    };
    
    loadPairs();
    
    // Clean up session on unmount
    return () => {
      if (sessionId) {
        metricsService.endSession().catch(console.error);
      }
    };
  }, [state.currentLevel]);

  // Start game when word pairs are loaded
  useEffect(() => {
    if (wordPairs.length > 0 && gameStatus === 'intro') {
      // Show intro for a moment before starting
      const timer = setTimeout(() => {
        setGameStatus('prompt');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [wordPairs, gameStatus]);

  // Start new session with initialized retry stats
  const startNewSession = async (level: number): Promise<string> => {
    try {
      const result = await metricsService.startSession(level);
      return result;
    } catch (error) {
      console.error('Error starting session:', error);
      return '';
    }
  };

  // Play prompt when ready
  useEffect(() => {
    if (gameStatus === 'prompt' && wordPairs.length > 0) {
      const pair = wordPairs[currentPairIndex];
      currentPairRef.current = pair;
      
      // Randomly select which word to prompt
      const isFirstWord = Math.random() > 0.5;
      const promptWord = isFirstWord ? pair.word1 : pair.word2;
      const promptAudio = isFirstWord ? pair.audioPrompt1 : pair.audioPrompt2;
      
      setCurrentPromptWord(promptWord);
      
      // Play the audio prompt
      if (state.isAudioEnabled) {
        audioService.playWordPrompt(promptAudio);
      }
      
      // Record the start time for response time measurement
      startTimeRef.current = Date.now();
      
      // Move to selection state
      setGameStatus('selection');
    }
  }, [gameStatus, wordPairs, currentPairIndex, state.isAudioEnabled]);

  // Handle retry of the current prompt
  const handleRetry = useCallback(() => {
    if (!currentPromptWord || !currentPairRef.current) return;
    
    // Reset selection and correctness
    setSelectedWord(null);
    setIsCorrect(null);
    
    // Set retry flag if not already set
    if (!isRetry) {
      setIsRetry(true);
      setScore(prev => ({
        ...prev,
        retries: prev.retries + 1
      }));
    }
    
    // Reset timer for response time measurement
    startTimeRef.current = Date.now();
    
    // Play the audio prompt again
    const pair = currentPairRef.current;
    const promptAudio = pair.word1 === currentPromptWord 
      ? pair.audioPrompt1 
      : pair.audioPrompt2;
    
    // Always play audio on retry - this is important feedback
    audioService.playWordPrompt(promptAudio);
    
    // Slight delay to ensure audio is heard before selection is possible
    setTimeout(() => {
      // Go back to selection state
      setGameStatus('selection');
    }, 500);
  }, [currentPromptWord, state.isAudioEnabled, isRetry]);

  // Handle replay button click (just plays audio again)
  const handleReplay = useCallback(() => {
    if (gameStatus === 'selection' && currentPromptWord && currentPairRef.current) {
      const pair = currentPairRef.current;
      const promptAudio = pair.word1 === currentPromptWord 
        ? pair.audioPrompt1 
        : pair.audioPrompt2;
      
      if (state.isAudioEnabled) {
        audioService.playWordPrompt(promptAudio);
      }
    }
  }, [gameStatus, currentPromptWord, state.isAudioEnabled]);

  // Handle word selection
  const handleWordSelection = useCallback(async (word: string) => {
    if (gameStatus !== 'selection' || !currentPromptWord || !currentPair) return;
    
    const responseTime = Date.now() - (startTimeRef.current || Date.now());
    const correct = word === currentPromptWord;
    
    setSelectedWord(word);
    setIsCorrect(correct);
    setGameStatus('feedback');
    
    // Update score
    setScore(prev => {
      const newCorrect = prev.correct + (correct ? 1 : 0);
      const newSuccessfulRetries = prev.successfulRetries + (correct && isRetry ? 1 : 0);
      
      return {
        correct: newCorrect,
        total: prev.total + 1,
        retries: prev.retries,
        successfulRetries: newSuccessfulRetries
      };
    });
    
    // Play feedback sound
    if (state.isAudioEnabled) {
      if (correct) {
        audioService.playCorrectSound();
      } else {
        audioService.playIncorrectSound();
      }
    }
    
    // Record the practice result
    if (sessionId) {
      try {
        await metricsService.recordPractice({
          wordPair: currentPair,
          selectedWord: word,
          targetWord: currentPromptWord,
          responseTimeMs: responseTime,
          isRetry,
          attemptCount: isRetry ? 2 : 1
        });
      } catch (error) {
        console.error('Error recording practice result:', error);
      }
    }
    
    // Only auto-advance if the answer was correct
    // Otherwise user needs to explicitly press retry or replay
    if (!correct) {
      return;
    }
    
    // Move to next pair after a delay
    const timer = setTimeout(() => {
      if (currentPairIndex >= wordPairs.length - 1) {
        // End of game
        setGameStatus('complete');
        
        // End the session
        if (sessionId) {
          metricsService.endSession().catch(console.error);
        }
        
        // Play level complete sound
        if (state.isAudioEnabled) {
          audioService.playLevelCompleteSound();
        }
      } else {
        // Move to next pair
        setCurrentPairIndex(prev => prev + 1);
        setSelectedWord(null);
        setIsCorrect(null);
        setIsRetry(false); // Reset retry flag for next pair
        setGameStatus('prompt');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [gameStatus, currentPairIndex, currentPromptWord, currentPair, wordPairs.length, sessionId, state.isAudioEnabled, isRetry]);

  // Handle advancing to next level
  const handleNextLevel = useCallback(() => {
    // Move to the next level if performance is good enough
    const accuracy = score.total > 0 
      ? (score.correct / score.total) * 100 
      : 0;
      
    if (accuracy >= 80 && state.currentLevel < 4) {
      dispatch({ type: 'SET_LEVEL', payload: state.currentLevel + 1 });
    }
  }, [score.correct, score.total, state.currentLevel, dispatch]);

  return {
    wordPairs,
    currentPairIndex,
    currentPair,
    currentPromptWord,
    selectedWord,
    gameStatus,
    isCorrect,
    isRetry,
    score,
    sessionId,
    handleWordSelection,
    handleReplay,
    handleRetry,
    handleNextLevel,
    progressPercentage
  };
};