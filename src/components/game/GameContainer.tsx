import React, { useEffect, useCallback } from 'react';
import { Stage, Container } from '@pixi/react';
import { useAppContext } from '../../context/AppContext';
import { getImagePath } from '../../services/wordPairsService';
import { useGameState } from '../../hooks/useGameState';

// UI Components
import WordImage from './ui/WordImage';
import FeedbackMessage from './ui/FeedbackMessage';
import GameButton from './ui/GameButton';
import GamePrompt from './ui/GamePrompt';
import ProgressIndicator from './ui/ProgressIndicator';

// Screen Components
import IntroScreen from './screens/IntroScreen';
import CompleteScreen from './screens/CompleteScreen';

interface GameContainerProps {
  width: number;
  height: number;
}

/**
 * Main game container component
 * Handles the game display and interactions
 */
const GameContainer: React.FC<GameContainerProps> = ({ width, height }) => {
  const { state } = useAppContext();
  const gameState = useGameState();
  
  const {
    wordPairs,
    currentPairIndex,
    currentPair,
    currentPromptWord,
    selectedWord,
    gameStatus,
    isCorrect,
    isRetry,
    score,
    handleWordSelection,
    handleReplay,
    handleRetry,
    handleNextLevel
  } = gameState;
  
  // Handle replay button click
  const onReplayClick = useCallback(() => {
    handleReplay();
  }, [handleReplay]);
  
  // Handle retry attempt
  const onRetryClick = useCallback(() => {
    handleRetry();
  }, [handleRetry]);
  
  // Continue to next level or home screen
  const onContinueClick = useCallback(() => {
    handleNextLevel();
    // Return to home screen
    window.location.href = '/';
  }, [handleNextLevel]);
  
  // Render the appropriate game content based on the current status
  const renderGameContent = () => {
    if (wordPairs.length === 0) {
      return (
        <GamePrompt 
          text="Loading word pairs..."
          x={width / 2}
          y={height / 2}
          fontSize={24}
        />
      );
    }

    if (gameStatus === 'intro') {
      return <IntroScreen levelNumber={state.currentLevel} width={width} height={height} />;
    }

    if (gameStatus === 'complete') {
      return (
        <CompleteScreen 
          score={score}
          width={width}
          height={height}
          onContinue={onContinueClick}
        />
      );
    }

    // For prompt, selection and feedback states, show the word pair
    if (!currentPair) return null;
    
    const image1Path = getImagePath(currentPair.image1);
    const image2Path = getImagePath(currentPair.image2);
    
    // Determine layout based on screen dimensions
    const isHorizontal = width > height;
    const imageSize = isHorizontal 
      ? Math.min(width * 0.4, height * 0.6) 
      : Math.min(width * 0.6, height * 0.4);
    
    // Position the images based on orientation
    const imagePositions = isHorizontal 
      ? [
          { x: width * 0.25, y: height / 2 }, // Left
          { x: width * 0.75, y: height / 2 }  // Right
        ]
      : [
          { x: width / 2, y: height * 0.3 },  // Top
          { x: width / 2, y: height * 0.7 }   // Bottom
        ];
    
    return (
      <Container>
        {/* Instruction text */}
        <GamePrompt
          text="Listen and tap the matching picture"
          x={width / 2}
          y={30}
          fontSize={20}
        />
        
        {/* Word images */}
        <WordImage 
          imagePath={image1Path}
          x={imagePositions[0].x}
          y={imagePositions[0].y}
          width={imageSize}
          height={imageSize}
          interactive={gameStatus === 'selection'}
          onSelect={() => handleWordSelection(currentPair.word1)}
          isSelected={selectedWord === currentPair.word1}
          isCorrect={selectedWord === currentPair.word1 ? isCorrect : null}
        />
        <WordImage 
          imagePath={image2Path}
          x={imagePositions[1].x}
          y={imagePositions[1].y}
          width={imageSize}
          height={imageSize}
          interactive={gameStatus === 'selection'}
          onSelect={() => handleWordSelection(currentPair.word2)}
          isSelected={selectedWord === currentPair.word2}
          isCorrect={selectedWord === currentPair.word2 ? isCorrect : null}
        />
        
        {/* Replay button */}
        {gameStatus === 'selection' && (
          <GameButton 
            text="Replay"
            icon="🔊"
            x={width / 2}
            y={height - 60}
            onClick={onReplayClick}
            width={150}
          />
        )}
        
        {/* Feedback message */}
        {gameStatus === 'feedback' && isCorrect !== null && (
          <FeedbackMessage 
            isCorrect={isCorrect}
            isRetry={isRetry}
            x={width / 2}
            y={height - 100}
            onRetry={!isRetry && !isCorrect ? onRetryClick : undefined}
          />
        )}
        
        {/* Progress indicator */}
        <ProgressIndicator 
          current={currentPairIndex + 1}
          total={wordPairs.length}
          x={width / 2}
          y={height - 20}
          width={width * 0.8}
        />
      </Container>
    );
  };

  return (
    <Stage 
      width={width} 
      height={height}
      options={{ 
        backgroundColor: 0xf0f0f0,
        antialias: true,
        resolution: window.devicePixelRatio || 1
      }}
    >
      {renderGameContent()}
    </Stage>
  );
};

export default GameContainer;