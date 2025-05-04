import React, { useMemo } from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface FeedbackMessageProps {
  isCorrect: boolean | null;
  isRetry?: boolean;
  x: number;
  y: number;
  emojiSize?: number;
  textSize?: number;
  onRetry?: () => void;
  onSkip?: () => void; // New prop for skipping to next word
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
  emojiSize = 82,
  textSize = 22,
  onRetry,
  onSkip,
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

  // Random encouraging messages for incorrect answers (first attempt)
  const encouragingMessages = [
    { emoji: '🎧', text: 'Listen again...' },
    { emoji: '🤔', text: 'One more try!' },
    { emoji: '🧩', text: 'Almost there!' },
    { emoji: '👂', text: 'Listen carefully...' },
    { emoji: '💭', text: "Let's try once more!" },
    { emoji: '🔍', text: 'Look closely!' },
    { emoji: '🦉', text: 'Listen for the sound...' },
    { emoji: '🌈', text: 'You can do it!' },
  ];

  // Messages for incorrect answers after retry
  const secondMissMessages = [
    { emoji: '🌱', text: "You're still learning!" },
    { emoji: '🦋', text: 'Next time!' },
    { emoji: '🌻', text: 'Keep practicing!' },
    { emoji: '🧐', text: "We'll try more later!" },
    { emoji: '🌞', text: 'Good effort!' },
    { emoji: '🌈', text: 'Practice makes perfect!' },
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

  const color = isCorrect ? 0x22cc22 : isRetry ? 0xcc2222 : 0xff8800;

  // Always show retry and skip buttons on incorrect attempts
  const showRetryButton = isCorrect === false && onRetry !== undefined;
  const showSkipButton = isCorrect === false && onSkip !== undefined;

  // If there's no feedback yet (null value), don't render
  if (isCorrect === null) return null;

  return (
    <Container position={[x, y]}>
      {/* Large emoji - significantly bigger for more visual impact */}
      <Text
        text={message.emoji}
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
        text={message.text}
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

      {/* Button container for both buttons - moved down to make space for large emoji */}
      <Container position={[0, 130]}>
        {/* Retry button - show on any incorrect attempt */}
        {showRetryButton && (
          <Container position={[-120, 0]} interactive={true} cursor="pointer" pointerdown={onRetry}>
            {/* Button background - larger, rounder, and more colorful for child appeal */}
            <Graphics draw={(g: PIXI.Graphics) => {
              g.clear();
              g.beginFill(0xFF6B6B); // Brighter, more playful red color
              g.lineStyle(3, 0x000000, 0.15);
              g.drawRoundedRect(-90, -60, 180, 120, 20);
              g.endFill();
            }} />
            
            {/* Large emoji icon */}
            <Container position={[0, -25]}>
              <Text
                text="🔊"
                anchor={0.5}
                style={
                  new PIXI.TextStyle({
                    fontSize: 50, // Much larger icon
                  })
                }
              />
            </Container>
            
            {/* Button text */}
            <Text
              text="Try Again"
              anchor={0.5}
              y={30} // Below the emoji
              style={
                new PIXI.TextStyle({
                  fill: 0xffffff,
                  fontSize: 24,
                  fontFamily: 'Arial',
                  fontWeight: 'bold',
                  dropShadow: true,
                  dropShadowAlpha: 0.3,
                  dropShadowDistance: 2,
                })
              }
            />
          </Container>
        )}

        {/* Skip button - show on any incorrect attempt */}
        {showSkipButton && (
          <Container position={[120, 0]} interactive={true} cursor="pointer" pointerdown={onSkip}>
            {/* Button background */}
            <Graphics draw={(g: PIXI.Graphics) => {
              g.clear();
              g.beginFill(0x6C7BFA); // Blue color for skip
              g.lineStyle(3, 0x000000, 0.15);
              g.drawRoundedRect(-90, -60, 180, 120, 20);
              g.endFill();
            }} />
            
            {/* Large emoji icon */}
            <Container position={[0, -25]}>
              <Text
                text="⏩"
                anchor={0.5}
                style={
                  new PIXI.TextStyle({
                    fontSize: 50, // Match the retry button icon size
                  })
                }
              />
            </Container>
            
            {/* Button text */}
            <Text
              text="Skip"
              anchor={0.5}
              y={30} // Below the emoji
              style={
                new PIXI.TextStyle({
                  fill: 0xffffff,
                  fontSize: 24,
                  fontFamily: 'Arial',
                  fontWeight: 'bold',
                  dropShadow: true,
                  dropShadowAlpha: 0.3,
                  dropShadowDistance: 2,
                })
              }
            />
          </Container>
        )}
      </Container>
    </Container>
  );
};

export default FeedbackMessage;