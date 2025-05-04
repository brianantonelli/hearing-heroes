import React from 'react';
import { Container, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import GameButton from '../ui/GameButton';

interface CompleteScreenProps {
  score: {
    correct: number;
    total: number;
    retries: number;
    successfulRetries: number;
  };
  width: number;
  height: number;
  onContinue: () => void;
}

/**
 * Component for displaying the level completion screen
 */
const CompleteScreen: React.FC<CompleteScreenProps> = ({ 
  score, 
  width, 
  height,
  onContinue 
}) => {
  const accuracy = score.total > 0 
    ? Math.round((score.correct / score.total) * 100) 
    : 0;
  
  const retrySuccess = score.retries > 0
    ? Math.round((score.successfulRetries / score.retries) * 100)
    : 0;
  
  // Determine message based on accuracy
  let message = "";
  if (accuracy >= 90) {
    message = "Amazing job! 🌟";
  } else if (accuracy >= 80) {
    message = "Great job! 🎉";
  } else if (accuracy >= 60) {
    message = "Good effort! 👍";
  } else {
    message = "Keep practicing! 💪";
  }
  
  return (
    <Container position={[width / 2, height / 2]}>
      {/* Level complete title */}
      <Text
        text="Level Complete!"
        anchor={0.5}
        y={-100}
        style={new PIXI.TextStyle({
          fill: 0x22cc22,
          fontSize: 36,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          dropShadow: true,
          dropShadowAlpha: 0.3,
          dropShadowDistance: 3
        })}
      />
      
      {/* Encouragement message */}
      <Text
        text={message}
        anchor={0.5}
        y={-50}
        style={new PIXI.TextStyle({
          fill: 0x333333,
          fontSize: 28,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        })}
      />
      
      {/* Score display */}
      <Text
        text={`Score: ${score.correct} / ${score.total} (${accuracy}%)`}
        anchor={0.5}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0x333333,
          fontSize: 24,
          fontFamily: 'Arial'
        })}
      />
      
      {/* Retry stats if applicable */}
      {score.retries > 0 && (
        <Text
          text={`Successful retries: ${score.successfulRetries} / ${score.retries} (${retrySuccess}%)`}
          anchor={0.5}
          y={40}
          style={new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 18,
            fontFamily: 'Arial'
          })}
        />
      )}
      
      {/* Continue button */}
      <GameButton 
        text="Continue"
        x={0}
        y={100}
        onClick={onContinue}
        width={180}
        icon="→"
      />
    </Container>
  );
};

export default CompleteScreen;