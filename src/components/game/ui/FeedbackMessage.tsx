import React, { useMemo } from 'react';
import { Container, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface FeedbackMessageProps {
  isCorrect: boolean | null;
  isRetry?: boolean;
  x: number;
  y: number;
  emojiSize?: number;
  textSize?: number;
  onRetry?: () => void;
}

/**
 * Component for displaying dynamic feedback after a selection
 * with randomized messages and large emojis
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ 
  isCorrect, 
  isRetry = false,
  x, 
  y, 
  emojiSize = 64,
  textSize = 22,
  onRetry
}) => {
  // Random positive feedback messages with emojis
  const positiveMessages = [
    { emoji: '🎉', text: "Great job!" },
    { emoji: '⭐', text: "Awesome!" },
    { emoji: '🌟', text: "Fantastic!" },
    { emoji: '👍', text: "Way to go!" },
    { emoji: '🥳', text: "You did it!" },
    { emoji: '🦄', text: "Amazing!" },
    { emoji: '🏆', text: "Super!" },
    { emoji: '🎯', text: "Perfect!" },
    { emoji: '💪', text: "Strong work!" },
    { emoji: '🎊', text: "Wonderful!" },
    { emoji: '🧠', text: "Smart thinking!" },
    { emoji: '🚀', text: "Blast off!" }
  ];

  // Random encouraging messages for incorrect answers (first attempt)
  const encouragingMessages = [
    { emoji: '🎧', text: "Listen again..." },
    { emoji: '🤔', text: "One more try!" },
    { emoji: '🧩', text: "Almost there!" },
    { emoji: '👂', text: "Listen carefully..." },
    { emoji: '💭', text: "Let's try once more!" },
    { emoji: '🔍', text: "Look closely!" },
    { emoji: '🦉', text: "Listen for the sound..." },
    { emoji: '🌈', text: "You can do it!" }
  ];

  // Messages for incorrect answers after retry
  const secondMissMessages = [
    { emoji: '🌱', text: "You're still learning!" },
    { emoji: '🦋', text: "Next time!" },
    { emoji: '🌻', text: "Keep practicing!" },
    { emoji: '🧐', text: "We'll try more later!" },
    { emoji: '🌞', text: "Good effort!" },
    { emoji: '🌈', text: "Practice makes perfect!" }
  ];

  // Select a random message based on correctness and retry status
  const message = useMemo(() => {
    if (isCorrect === true) {
      // Correct answer
      return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    } else if (isCorrect === false && !isRetry) {
      // Incorrect answer on first try
      return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    } else {
      // Incorrect answer on retry
      return secondMissMessages[Math.floor(Math.random() * secondMissMessages.length)];
    }
  }, [isCorrect, isRetry]);
  
  const color = isCorrect ? 0x22cc22 : (isRetry ? 0xcc2222 : 0xff8800);
  
  // Always show retry button on incorrect attempts
  const showRetryButton = isCorrect === false && onRetry !== undefined;

  // If there's no feedback yet (null value), don't render
  if (isCorrect === null) return null;
  
  return (
    <Container position={[x, y]}>
      {/* Large emoji */}
      <Text
        text={message.emoji}
        anchor={0.5}
        y={-45}
        style={new PIXI.TextStyle({
          fontSize: emojiSize
        })}
      />
      
      {/* Feedback text */}
      <Text
        text={message.text}
        anchor={0.5}
        y={30}
        style={new PIXI.TextStyle({
          fill: color,
          fontSize: textSize,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          dropShadow: true,
          dropShadowAlpha: 0.2,
          dropShadowDistance: 2
        })}
      />

      {/* Retry button - show on any incorrect attempt */}
      {showRetryButton && (
        <Container 
          position={[0, 85]}
          interactive={true}
          cursor="pointer"
          pointerdown={onRetry}
        >
          <Text
            text="🔊 Try Again"
            anchor={0.5}
            style={new PIXI.TextStyle({
              fill: 0x4287f5,
              fontSize: 24,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              dropShadow: true,
              dropShadowAlpha: 0.3,
              dropShadowDistance: 2
            })}
          />
        </Container>
      )}
    </Container>
  );
};

export default FeedbackMessage;