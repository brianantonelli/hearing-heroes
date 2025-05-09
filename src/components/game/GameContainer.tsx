import React, { useEffect, useCallback, useState } from 'react';
import { Stage, Container } from '@pixi/react';
import { useAppContext } from '../../context/AppContext';
import { getImagePath } from '../../services/wordPairsService';
import { useGameState } from '../../hooks/useGameState';
import { audioService } from '../../services/audioService';

// UI Components
import WordImage from './ui/WordImage';
import FeedbackMessage from './ui/FeedbackMessage';
import GameButton from './ui/GameButton';
import GamePrompt from './ui/GamePrompt';
import ProgressIndicator from './ui/ProgressIndicator';
import CelebrationAnimation from './ui/CelebrationAnimation';
import LoadingScreen from './ui/LoadingScreen';
import BackgroundBubbles from './ui/BackgroundBubbles';

// Screen Components
import IntroScreen from './screens/IntroScreen';
import CompleteScreen from './screens/CompleteScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';

interface GameContainerProps {
  width: number;
  height: number;
}

/**
 * Main game container component
 * Handles the game display and interactions
 */
const GameContainer: React.FC<GameContainerProps> = ({ width, height }) => {
  const { state, dispatch } = useAppContext();
  const gameState = useGameState();

  // Check both app state and sessionStorage to determine if we should show level selection
  const skipLevelSelectionFromSession = sessionStorage.getItem('skipLevelSelection') === 'true';

  // Track if we should show the level selection screen
  const [showLevelSelect, setShowLevelSelect] = useState(
    state.showLevelSelection && !state.levelSelectionShown && !skipLevelSelectionFromSession
  );

  // Track if we should show the celebration animation
  const [showCelebration, setShowCelebration] = useState(false);

  // Ensure level 1 is default when level selection is shown
  useEffect(() => {
    if (showLevelSelect) {
      // Always start with level 1 selected when showing level selection
      dispatch({ type: 'SET_LEVEL', payload: 1 });
    }

    // Clean up the session storage entry when component unmounts
    return () => {
      sessionStorage.removeItem('skipLevelSelection');
    };
  }, [showLevelSelect, dispatch]);

  const {
    wordPairs,
    currentPairIndex,
    currentPair,
    currentPromptWord,
    selectedWord,
    gameStatus,
    isCorrect,
    score,
    handleReplay,
    handleNextLevel,
  } = gameState;

  // Reset celebration when moving to a new word pair or changing game status
  useEffect(() => {
    setShowCelebration(false);
  }, [currentPairIndex, gameStatus]);

  // Custom word selection handler to show celebration animation
  const handleWordSelection = (word: string) => {
    // We need to check if the word matches the current prompt word
    // before calling the original handler, because it will change state
    const isAnswer = word === currentPromptWord;

    // Reset celebration state first to ensure it can be triggered again
    setShowCelebration(false);

    // Call the original handler
    const result = gameState.handleWordSelection(word);

    // If this is a correct answer  show celebration
    if (isAnswer) {
      // Slight delay to let the feedback show first
      setTimeout(() => {
        try {
          setShowCelebration(true);
        } catch (error) {
          console.error('Error showing celebration:', error);
          // Still allow the game to continue even if celebration fails
        }
      }, 500);
    }

    return result;
  };

  // Handle replay button click
  const onReplayClick = useCallback(() => {
    handleReplay();
  }, [handleReplay]);

  // Continue to next level or home screen
  const onContinueClick = useCallback(() => {
    // Call handleNextLevel to potentially increase the level
    const movedToNextLevel = handleNextLevel();

    if (movedToNextLevel) {
      // If we advanced to a new level, mark level selection as shown
      dispatch({ type: 'SET_LEVEL_SELECTION_SHOWN', payload: true });

      // Store this in session storage to ensure it persists through reload
      sessionStorage.setItem('skipLevelSelection', 'true');

      // Reload to start the new level
      window.location.reload();
    } else {
      // Otherwise return to home screen
      // Use hash navigation since we're using createHashRouter
      window.location.href = '/#/';
    }
  }, [handleNextLevel, dispatch]);

  // Handle level selection
  const handleLevelSelect = useCallback(
    (level: number) => {
      // Stop any playing audio immediately
      audioService.stopAll();

      // Set the selected level
      dispatch({ type: 'SET_LEVEL', payload: level });

      // Mark level selection as shown for this session in both app state and session storage
      dispatch({ type: 'SET_LEVEL_SELECTION_SHOWN', payload: true });
      sessionStorage.setItem('skipLevelSelection', 'true');

      // Close the level selection screen
      setShowLevelSelect(false);

      // No need to reload - the useGameState hook will detect the level change
      // and reload the word pairs for the new level automatically
    },
    [dispatch]
  );

  // Handle celebration animation completion
  const handleCelebrationComplete = useCallback(() => {
    // Use a try-catch to prevent any errors from propagating
    try {
      // Set this to false to ensure the celebration animation is removed
      setShowCelebration(false);
      console.log('Celebration animation complete');
    } catch (error) {
      console.error('Error in handleCelebrationComplete:', error);
    }
  }, []);

  // Render the appropriate game content based on the current status
  const renderGameContent = () => {
    if (wordPairs.length === 0) {
      return <LoadingScreen width={width} height={height} />;
    }

    // Show level select before intro if enabled in preferences
    if (state.showLevelSelection && showLevelSelect) {
      return (
        <Container position={[0, 0]}>
          <LevelSelectScreen onLevelSelect={handleLevelSelect} width={width} height={height} />
        </Container>
      );
    }

    if (gameStatus === 'intro') {
      return <IntroScreen levelNumber={state.currentLevel} width={width} height={height} />;
    }

    if (gameStatus === 'complete') {
      return (
        <CompleteScreen score={score} width={width} height={height} onContinue={onContinueClick} />
      );
    }

    // For prompt, selection and feedback states, show the word pair
    if (!currentPair) return null;

    const image1Path = getImagePath(currentPair.image1);
    const image2Path = getImagePath(currentPair.image2);

    // Determine layout based on screen dimensions
    const isHorizontal = width > height;
    const imageSize = isHorizontal
      ? Math.min(width * 0.3, height * 0.5)
      : Math.min(width * 0.5, height * 0.3);

    // Position the images based on orientation
    const imagePositions = isHorizontal
      ? [
          { x: width * 0.25, y: height / 2.5 }, // Left
          { x: width * 0.75, y: height / 2.5 }, // Right
        ]
      : [
          { x: width / 2, y: height * 0.25 }, // Top
          { x: width / 2, y: height * 0.65 }, // Bottom
        ];

    // Use a deterministic "random" based on the word pair to ensure consistent positions
    // This creates a reproducible but seemingly random pattern that doesn't change during replays
    // We use the sum of char codes in the words as a seed for deterministic randomization
    const seed =
      currentPair.word1.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) +
      currentPair.word2.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const shouldSwap = (seed + currentPairIndex) % 7 > 3; // Using modulo 7 for more variation
    const positions = shouldSwap
      ? [imagePositions[1], imagePositions[0]]
      : [imagePositions[0], imagePositions[1]];

    return (
      <Container>
        {/* Instruction text */}
        <GamePrompt text="Listen and tap the matching picture" x={width / 2} y={30} fontSize={20} />

        {/* Word images */}
        <WordImage
          imagePath={image1Path}
          word={currentPair.word1}
          x={positions[0].x}
          y={positions[0].y}
          width={imageSize}
          height={imageSize}
          interactive={gameStatus === 'selection'}
          onSelect={() => handleWordSelection(currentPair.word1)}
          isSelected={selectedWord === currentPair.word1}
          isCorrect={selectedWord === currentPair.word1 ? isCorrect : null}
        />
        <WordImage
          imagePath={image2Path}
          word={currentPair.word2}
          x={positions[1].x}
          y={positions[1].y}
          width={imageSize}
          height={imageSize}
          interactive={gameStatus === 'selection'}
          onSelect={() => handleWordSelection(currentPair.word2)}
          isSelected={selectedWord === currentPair.word2}
          isCorrect={selectedWord === currentPair.word2 ? isCorrect : null}
        />

        {gameStatus === 'selection' && (
          <GameButton
            text="Listen Again"
            icon="🔊"
            x={width / 2}
            y={height - 105} /* Moved up more to accommodate taller button */
            onClick={onReplayClick}
            width={180}
            fontSize={22}
            padding={10}
            backgroundColor={0x4caf50} /* Green color for better visibility */
            animateIcon={false}
          />
        )}

        {/* Feedback message - positioned higher to leave room for larger Try Again button and progress bar */}
        {gameStatus === 'feedback' && isCorrect !== null && (
          <FeedbackMessage
            isCorrect={isCorrect}
            x={width / 2}
            y={height - 220} /* Moved even higher for the much taller button */
            emojiSize={70} /* Even larger emoji for better visibility and impact */
            textSize={26} /* Larger text for better readability */
          />
        )}

        {/* Progress indicator - positioned at bottom with increased margin */}
        <ProgressIndicator
          current={currentPairIndex + 1}
          total={wordPairs.length}
          x={width / 2}
          y={height - 20} /* Increased margin from bottom */
          width={width * 0.8}
          height={26} /* Taller progress bar for better visibility */
        />
      </Container>
    );
  };

  // For complete screen, don't try to show any leftover celebrations
  const shouldShowCelebration = showCelebration && gameStatus !== 'complete';

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0xf0f0f0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      }}
    >
      {/* Background bubbles for all screens */}
      {state.enableAnimations && gameStatus !== 'complete' && !showLevelSelect && (
        <BackgroundBubbles width={width} height={height} />
      )}
      
      {renderGameContent()}
      
      {shouldShowCelebration && gameStatus !== 'complete' && (
        <CelebrationAnimation
          width={width}
          height={height}
          onComplete={handleCelebrationComplete}
        />
      )}
    </Stage>
  );
};

export default GameContainer;