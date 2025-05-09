import React, { useState, useEffect } from 'react';
import { Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useAppContext } from '../../../context/AppContext';

interface BackgroundBubblesProps {
  width: number;
  height: number;
}

/**
 * Fun animated bubbles for the background
 */
const BackgroundBubbles: React.FC<BackgroundBubblesProps> = ({ width, height }) => {
  const { state } = useAppContext();
  
  // Skip rendering if animations are disabled
  if (!state.enableAnimations) return null;
  
  // Animated background elements
  const [bubbles, setBubbles] = useState<Array<{
    x: number;
    y: number;
    radius: number;
    color: number;
    speed: number;
    phase: number;
  }>>([]);

  // Initialize bubbles for the background
  useEffect(() => {
    if (state.enableAnimations) {
      // Create bubbles with fun properties
      const newBubbles = Array.from({ length: 15 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 5 + Math.random() * 25,
        color: [0x4287f5, 0x42d7f5, 0xf542a1, 0xf5d742, 0x42f56f][Math.floor(Math.random() * 5)],
        speed: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      }));
      setBubbles(newBubbles);
    } else {
      setBubbles([]);
    }
  }, [state.enableAnimations, width, height]);

  // Handle bubble movement animation
  useEffect(() => {
    if (!state.enableAnimations) return;

    // Bubble movement animation
    const bubbleTimer = setInterval(() => {
      setBubbles(prev => 
        prev.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.x + Math.sin(bubble.phase + Date.now() / 2000) * 0.5,
          // Reset bubble position when it goes off screen
          ...(bubble.y < -bubble.radius ? {
            x: Math.random() * width,
            y: height + bubble.radius,
            phase: Math.random() * Math.PI * 2,
          } : {})
        }))
      );
    }, 30);

    return () => {
      clearInterval(bubbleTimer);
    };
  }, [state.enableAnimations, width, height]);

  // Draw bubbles for the animated background
  const drawBubble = React.useCallback(
    (g: PIXI.Graphics, bubble: typeof bubbles[0]) => {
      g.clear();
      
      // Draw a gradient-like bubble with alpha
      g.beginFill(bubble.color, 0.2); // Lower opacity for background
      g.drawCircle(bubble.x, bubble.y, bubble.radius);
      g.endFill();

      // Highlight on top
      g.beginFill(0xFFFFFF, 0.2);
      g.drawCircle(
        bubble.x - bubble.radius * 0.3, 
        bubble.y - bubble.radius * 0.3, 
        bubble.radius * 0.3
      );
      g.endFill();
    },
    []
  );

  return (
    <Container>
      {bubbles.map((bubble, index) => (
        <Graphics key={index} draw={(g) => drawBubble(g, bubble)} />
      ))}
    </Container>
  );
};

export default BackgroundBubbles;