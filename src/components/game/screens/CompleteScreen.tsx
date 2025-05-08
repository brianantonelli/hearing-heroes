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
const CompleteScreen: React.FC<CompleteScreenProps> = ({ score, width, height, onContinue }) => {
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  // Determine message and emoji based on accuracy
  let message = '';
  let emoji = '';
  if (accuracy >= 90) {
    message = 'Amazing job!';
    emoji = '🌟';
  } else if (accuracy >= 80) {
    message = 'Great job!';
    emoji = '🎉';
  } else if (accuracy >= 60) {
    message = 'Good effort!';
    emoji = '👍';
  } else {
    message = 'Keep practicing!';
    emoji = '💪';
  }

  return (
    <Container position={[width / 2, height / 2]}>
      {/* Level complete title */}
      <Text
        text="Level Complete!"
        anchor={0.5}
        y={-200}
        style={
          new PIXI.TextStyle({
            fill: 0x22cc22,
            fontSize: 42,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.3,
            dropShadowDistance: 3,
          })
        }
      />

      {/* Big emoji for visual reward */}
      <Text
        text={emoji}
        anchor={0.5}
        y={-100}
        style={
          new PIXI.TextStyle({
            fontSize: 80, // Much bigger emoji for visual impact
          })
        }
      />

      {/* Encouragement message */}
      <Text
        text={message}
        anchor={0.5}
        y={-30}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 32,
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
      />

      {/* Score display */}
      <Text
        text={`Score: ${score.correct} / ${score.total} (${accuracy}%)`}
        anchor={0.5}
        y={10}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 24,
            fontFamily: 'Arial',
          })
        }
      />

      {/* Continue button - more kid-friendly with prominent emoji */}
      <GameButton
        text="Continue"
        x={0}
        y={120}
        onClick={onContinue}
        width={200}
        fontSize={26}
        padding={14}
        backgroundColor={0x22cc22} /* Green color for continue */
        icon="⏩" /* Fast-forward emoji is more intuitive than arrow */
      />
    </Container>
  );
};

export default CompleteScreen;