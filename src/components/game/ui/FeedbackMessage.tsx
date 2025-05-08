import React, { useMemo } from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface FeedbackMessageProps {
  isCorrect: boolean | null;
  x: number;
  y: number;
  emojiSize?: number;
  textSize?: number;
}

/**
 * Component for displaying dynamic feedback after a selection
 * with randomized messages and large emojis
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  isCorrect,
  x,
  y,
  emojiSize = 82,
  textSize = 22,
}) => {
  // Random positive feedback messages with emojis
  const positiveMessages = [
    { emoji: '🎉', text: 'Great job!' },
    { emoji: '⭐', text: 'Awesome!' },
    { emoji: '🌟', text: 'Fantastic!' },
    { emoji: '👍', text: 'Way to go!' },
    { emoji: '🥳', text: 'You did it!' },
    { emoji: '🦄', text: 'Amazing!' },
    { emoji: '🏆', text: 'Super!' },
    { emoji: '🎯', text: 'Perfect!' },
    { emoji: '💪', text: 'Strong work!' },
    { emoji: '🎊', text: 'Wonderful!' },
    { emoji: '🧠', text: 'Smart thinking!' },
    { emoji: '🚀', text: 'Blast off!' },
  ];

  // Select a random message based on correctness and retry status
  const message = useMemo(() => {
    if (isCorrect === true) {
      // Correct answer
      return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    }
  }, [isCorrect]);

  const color = isCorrect ? 0x22cc22 : 0xff8800;

  // If there's no feedback yet (null value), don't render
  if (isCorrect === null) return null;

  return (
    <Container position={[x, y]}>
      {/* Large emoji - significantly bigger for more visual impact */}
      <Text
        text={message?.emoji}
        anchor={0.5}
        y={-60}
        style={
          new PIXI.TextStyle({
            fontSize: emojiSize * 2, // Double the size for much larger emoji
          })
        }
      />

      {/* Feedback text - positioned further down to make room for larger emoji */}
      <Text
        text={message?.text}
        anchor={0.5}
        y={50}
        style={
          new PIXI.TextStyle({
            fill: color,
            fontSize: textSize * 1.25, // Also increase text size for better proportions
            fontFamily: 'Arial',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.3, // Slightly stronger shadow for better visibility
            dropShadowDistance: 2,
          })
        }
      />
    </Container>
  );
};

export default FeedbackMessage;