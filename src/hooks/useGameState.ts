import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { WordPair } from '../types/wordPairs';
import { getWordPairsByLevel } from '../services/wordPairsService';
import { audioService } from '../services/audioService';
import { metricsService } from '../services/metricsService';
import { speechService } from '../services/speechService';
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
  score: {
    correct: number;
    total: number;
    retries: number;
    successfulRetries: number;
  };
  sessionId: string | null;
  handleWordSelection: (word: string) => void;
  handleReplay: () => void;
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
    successfulRetries: 0,
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const currentPairRef = useRef<WordPair | null>(null);

  // Calculate progress percentage
  const progressPercentage =
    wordPairs.length > 0
      ? Math.min(100, Math.floor((currentPairIndex / wordPairs.length) * 100))
      : 0;

  // Get current pair
  const currentPair = wordPairs[currentPairIndex] || null;

  // Load word pairs for the current level
  useEffect(() => {
    // Add a flag to track if this effect is still "current"
    let isMounted = true;

    const loadPairs = async () => {
      console.log('Loading word pairs for level:', state.currentLevel);

      try {
        // End any existing session, but don't use sessionId from state to prevent a loop
        const currentSession = metricsService.getCurrentSession();
        if (currentSession) {
          await metricsService.endSession().catch(e => {
            console.warn('Error ending previous session:', e);
          });
        }

        // Only continue if component is still mounted
        if (!isMounted) return;

        // Start a new metrics session
        const newSessionId = await startNewSession(state.currentLevel);

        // Only continue if component is still mounted
        if (!isMounted) return;

        setSessionId(newSessionId);

        // Fetch word pairs for this level
        const pairs = await getWordPairsByLevel(state.currentLevel);

        // Only continue if component is still mounted
        if (!isMounted) return;

        if (pairs.length === 0) {
          console.error(`No word pairs found for level ${state.currentLevel}`);
          return;
        }

        // Shuffle the pairs for randomization
        const shuffledPairs = [...pairs].sort(() => Math.random() - 0.5);
        setWordPairs(shuffledPairs);

        // Preload audio for all word pairs
        const audioPaths = shuffledPairs.flatMap(pair => [
          `/audio/prompts/${pair.audioPrompt1}`,
          `/audio/prompts/${pair.audioPrompt2}`,
        ]);
        audioService.preloadAudio(audioPaths);

        // Also preload feedback sounds
        audioService.preloadAudio([
          '/audio/feedback/correct.mp3',
          '/audio/feedback/incorrect.mp3',
          '/audio/feedback/level_complete.mp3',
        ]);

        // Reset state when loading new pairs
        setCurrentPairIndex(0);
        setSelectedWord(null);
        setIsCorrect(null);
        setGameStatus('intro');
        setScore({
          correct: 0,
          total: 0,
          retries: 0,
          successfulRetries: 0,
        });
      } catch (error) {
        console.error('Error loading word pairs:', error);
      }
    };

    loadPairs();

    // Clean up session on unmount
    return () => {
      isMounted = false;
      // Note: We don't end the session here since it might cause the loop
      // We'll rely on the level change effect to handle that
    };
  }, [state.currentLevel]); // Remove sessionId from dependencies to break the loop

  // Start game when word pairs are loaded
  useEffect(() => {
    // Start the game when we're on the intro screen with word pairs loaded
    if (wordPairs.length > 0 && gameStatus === 'intro') {
      // Show intro for a longer moment before starting
      // This gives more time for the "Ready, Set, Go" animation to complete
      const timer = setTimeout(() => {
        setGameStatus('prompt');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [wordPairs, gameStatus]);

  // Reset game state if the level changes
  useEffect(() => {
    // Stop any ongoing audio
    audioService.stopAll();

    // Reset state immediately when level changes
    if (sessionId) {
      // We don't wait for this to complete since the main loading effect will
      // also check for and end any existing sessions
      metricsService
        .endSession()
        .then(() => {
          console.log('Session ended successfully during level change');
        })
        .catch(error => {
          console.error('Error ending session during level change:', error);
        });

      // We don't clear sessionId here, as the main effect will handle that
      // This approach avoids issues with state updates in effects
    }

    // The main useEffect for loading word pairs will handle the rest, including
    // starting a new session for the new level
  }, [state.currentLevel]);

  // Start new session
  const startNewSession = async (level: number): Promise<string> => {
    try {
      // First check if there's already an active session
      const currentSession = metricsService.getCurrentSession();
      if (currentSession) {
        await metricsService.endSession();
      }

      const result = await metricsService.startSession(level);

      // Verify the session is now active
      const newSession = metricsService.getCurrentSession();
      if (!newSession) {
        console.error('Session creation failed - currentSession is still null after startSession');
      }

      return result;
    } catch (error) {
      console.error('Error starting session:', error);

      // Try emergency restoration if start failed
      try {
        console.log('Attempting emergency session restoration');
        return await metricsService.restoreSession(level);
      } catch (restoreError) {
        console.error('Emergency restoration also failed:', restoreError);
        return '';
      }
    }
  };

  // Play prompt when ready
  useEffect(() => {
    if (gameStatus === 'prompt' && wordPairs.length > 0) {
      try {
        const pair = wordPairs[currentPairIndex];
        // Store the current pair in the ref for metric recording
        currentPairRef.current = pair;

        // Randomly select which word to prompt
        const isFirstWord = Math.random() > 0.5;
        const promptWord = isFirstWord ? pair.word1 : pair.word2;
        const promptAudio = isFirstWord ? pair.audioPrompt1 : pair.audioPrompt2;

        setCurrentPromptWord(promptWord);

        // Play the audio prompt after a short delay
        if (state.isAudioEnabled) {
          setTimeout(() => {
            audioService.playWordPrompt(promptAudio);
          }, 1000);
        }

        // Move to selection state but with a delay in recording start time
        // This gives audio time to play
        setGameStatus('selection');
        
        // Delay setting the start time to account for audio playing
        // This effectively prevents scoring very fast taps that happen before audio completes
        setTimeout(() => {
          // Record the start time for response time measurement
          // Adding a slight delay prevents accidental immediate taps
          startTimeRef.current = Date.now();
        }, 2000); // 2 second delay before counting response time
        
      } catch (error) {
        console.error('Error setting up prompt:', error);
      }
    }
  }, [gameStatus, wordPairs, currentPairIndex, state.isAudioEnabled]);

  // Handle replay button click (just plays audio again)
  const handleReplay = useCallback(() => {
    if (gameStatus === 'selection' && currentPromptWord && currentPairRef.current) {
      const pair = currentPairRef.current;
      const promptAudio = pair.word1 === currentPromptWord ? pair.audioPrompt1 : pair.audioPrompt2;

      if (state.isAudioEnabled) {
        audioService.playWordPrompt(promptAudio);
      }
    }
  }, [gameStatus, currentPromptWord, state.isAudioEnabled]);

  // Handle word selection
  const handleWordSelection = useCallback(
    async (word: string) => {
      if (gameStatus !== 'selection' || !currentPromptWord) return;

      // Use currentPairRef.current as a safe reference that persists between renders
      const pairToUse = currentPairRef.current;

      if (!pairToUse) {
        console.error('No current pair available in ref');
        return;
      }

      const responseTime = Date.now() - (startTimeRef.current || Date.now());
      const correct = word === currentPromptWord;

      setSelectedWord(word);
      setIsCorrect(correct);
      setGameStatus('feedback');

      // Update score
      setScore(prev => {
        const newCorrect = prev.correct + (correct ? 1 : 0);

        return {
          correct: newCorrect,
          total: prev.total + 1,
        };
      });

      // We don't play feedback here - all audio and text feedback is now handled
      // in the FeedbackMessage component, which calls speechService.playRandomFeedback
      // This ensures the text and audio are properly synchronized

      // First check if there's an active session before trying to record metrics
      const activeSession = metricsService.getCurrentSession();
      if (!activeSession && sessionId) {
        console.warn(
          'Session appears inactive despite having sessionId. Attempting to restart session.'
        );
        // Try to restart a session if needed
        try {
          await startNewSession(state.currentLevel);
        } catch (e) {
          console.error('Failed emergency session restart:', e);
        }
      }

      // Record the practice result
      try {
        // Use the ref version for stability
        await metricsService.recordPractice({
          wordPair: pairToUse,
          selectedWord: word,
          targetWord: currentPromptWord,
          responseTimeMs: responseTime,
        });
      } catch (error) {
        console.error('Error recording practice result:', error);
        console.error('Error details:', {
          pairToUse,
          word,
          currentPromptWord,
          responseTime,
          sessionId,
          error,
          hasActiveSession: !!metricsService.getCurrentSession(),
        });
      }

      // Move to next pair after a delay to allow feedback to be shown
      // We'll use a shorter delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (currentPairIndex >= wordPairs.length - 1) {
          // Before setting game to complete, make sure to reset the feedback states
          setSelectedWord(null);
          setIsCorrect(null);

          // End of game - with a slight additional delay to ensure celebration is completed
          setTimeout(() => {
            // End the session
            if (sessionId) {
              metricsService.endSession().catch(console.error);
            }

            // Level complete sound will be played by the CompleteScreen
            // instead of here to make sure audio and text are synchronized

            // Now set the game status to complete
            setGameStatus('complete');
          }, 200); // Short delay to ensure any animations are finished
        } else {
          // Move to next pair
          setCurrentPairIndex(prev => prev + 1);
          setSelectedWord(null);
          setIsCorrect(null);
          setGameStatus('prompt');
        }
      }, 2000);

      return () => clearTimeout(timer);
    },
    [
      gameStatus,
      currentPairIndex,
      currentPromptWord,
      currentPair,
      wordPairs.length,
      sessionId,
      state.isAudioEnabled,
    ]
  );

  // Handle advancing to next level
  const handleNextLevel = useCallback(() => {
    // Move to the next level if performance is good enough
    const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;

    // Return true if we're advancing to a new level, false otherwise
    if (accuracy >= 80 && state.currentLevel < 4) {
      dispatch({ type: 'SET_LEVEL', payload: state.currentLevel + 1 });
      return true; // Level was increased
    }
    return false; // Level stays the same
  }, [score.correct, score.total, state.currentLevel, dispatch]);

  return {
    wordPairs,
    currentPairIndex,
    currentPair,
    currentPromptWord,
    selectedWord,
    gameStatus,
    isCorrect,
    score,
    sessionId,
    handleWordSelection,
    handleReplay,
    handleNextLevel,
    progressPercentage,
  };
};