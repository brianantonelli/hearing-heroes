import React, { useEffect, useState } from 'react';
import { Container, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { speechService, FeedbackType } from '../../../services/speechService';

interface FeedbackMessageProps {
  isCorrect: boolean | null;
  x: number;
  y: number;
  emojiSize?: number;
  textSize?: number;
}

// Emoji mapping for feedback types
const FEEDBACK_EMOJIS = {
  pass: ['🎉', '⭐', '🌟', '👍', '🥳', '🦄', '🏆', '🎯'],
  fail: ['🤔', '💪', '🔍', '🎯', '✨', '🧩', '🏆', '🚀']
};

/**
 * Component for displaying dynamic feedback after a selection
 * with randomized messages and large emojis from speech.yml
 * 
 * For incorrect answers only - correct answers are handled by CelebrationAnimation
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  isCorrect,
  x,
  y,
  emojiSize = 82,
  textSize = 22,
}) => {
  // State for feedback text and emoji
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackEmoji, setFeedbackEmoji] = useState<string>('');
  
  // Load and play feedback when component mounts or isCorrect changes
  useEffect(() => {
    // Only run this effect when isCorrect changes and is not null
    // AND only for incorrect answers (correct answers handled by CelebrationAnimation)
    if (isCorrect === null || isCorrect === true) return;
    
    // Set a loading state
    setFeedbackText('');
    setFeedbackEmoji('');
    
    const loadFeedback = async () => {      
      try {
        // Initialize service if needed
        await speechService.initialize();
        
        // Get random feedback AND play the corresponding audio in one call
        // This ensures text and audio are perfectly synchronized
        const text = await speechService.playRandomFeedback('fail');
        
        // Set the feedback text that matches the audio
        setFeedbackText(text);
        
        // Set random emoji for fail feedback
        const emojis = FEEDBACK_EMOJIS.fail;
        setFeedbackEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        
        console.log(`Feedback displayed: ${text} (fail)`);
      } catch (error) {
        console.error('Error loading feedback:', error);
        // Fallback values
        setFeedbackText('Try again!');
        setFeedbackEmoji('🤔');
      }
    };
    
    loadFeedback();
  }, [isCorrect]);

  const color = 0xff8800; // Always orange for incorrect answers

  // If there's no feedback yet (null value), correct answer, or text not loaded, don't render
  if (isCorrect === null || isCorrect === true || !feedbackText) return null;

  return (
    <Container position={[x, y]}>
      {/* Large emoji - significantly bigger for more visual impact */}
      <Text
        text={feedbackEmoji}
        anchor={0.5}
        y={-20}
        style={
          new PIXI.TextStyle({
            fontSize: emojiSize * 2, // Double the size for much larger emoji
          })
        }
      />

      {/* Feedback text - positioned below emoji */}
      <Text
        text={feedbackText}
        anchor={0.5}
        y={60}
        style={
          new PIXI.TextStyle({
            fill: color,
            fontSize: textSize * 1.5, // Increased text size for better visibility
            fontFamily: 'Arial',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.4, 
            dropShadowDistance: 2,
          })
        }
      />
    </Container>
  );
};

export default FeedbackMessage;