import React, { useEffect, useState, useCallback } from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { useAppContext } from '../../../context/AppContext';
import * as PIXI from 'pixi.js';
import { speechService } from '../../../services/speechService';

// Animation configuration
const CONFETTI_COUNT = 100;
const ANIMATION_DURATION = 3000; // 3 seconds - coordinated with the timing in useGameState.ts
const MIN_SIZE = 10;
const MAX_SIZE = 30;
const GRAVITY = 0.2;
const INITIAL_VELOCITY = 20;

interface Confetti {
  x: number;
  y: number;
  rotation: number;
  size: number;
  color: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
}

interface CelebrationAnimationProps {
  width: number;
  height: number;
  onComplete?: () => void;
  feedbackText?: string; // Optional text to display (defaults to getting a random one)
}

const generateConfetti = (width: number, height: number): Confetti[] => {
  const confetti: Confetti[] = [];
  
  // Colors for confetti
  const colors = [
    0xF94144, // red
    0xF3722C, // orange
    0xF8961E, // yellow-orange
    0xF9C74F, // yellow
    0x90BE6D, // yellowish-green
    0x43AA8B, // teal
    0x577590, // blue
    0x9381FF, // purple
    0xFF99C8, // pink
  ];
  
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    confetti.push({
      x: width / 2,
      y: height / 2,
      rotation: Math.random() * Math.PI * 2,
      size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * INITIAL_VELOCITY,
      speedY: (Math.random() - 1) * INITIAL_VELOCITY,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });
  }
  
  return confetti;
};

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  width, 
  height,
  onComplete,
  feedbackText
}) => {
  const { state } = useAppContext();
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [celebrationText, setCelebrationText] = useState<string>(feedbackText || '');
  
  // Skip animation if animations are disabled in preferences
  const skipAnimation = !state.enableAnimations;
  
  // Get a random celebration text if no feedbackText is provided
  useEffect(() => {
    if (!feedbackText && !celebrationText) {
      const getRandomText = async () => {
        try {
          // Initialize speech service if needed
          await speechService.initialize();
          
          // Get random success feedback and play it
          // We use playRandomFeedback to ensure text and audio are synchronized
          const text = await speechService.playRandomFeedback('pass');
          setCelebrationText(text);
        } catch (error) {
          console.error('Error getting celebration text:', error);
          setCelebrationText('Great job!'); // Fallback
        }
      };
      
      getRandomText();
    }
  }, [feedbackText, celebrationText]);
  
  // Generate confetti on component mount and handle cleanup
  useEffect(() => {
    if (skipAnimation) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    // Reset state when the component mounts
    setIsActive(true);
    
    // Generate initial confetti
    setConfetti(generateConfetti(width, height));
    
    // End the animation after the duration
    const animationTimer = setTimeout(() => {
      // First set active to false to stop animations
      setIsActive(false);
      
      // Small delay before calling onComplete to ensure animations have stopped
      setTimeout(() => {
        // Make sure we always call onComplete, even if there's an error
        if (onComplete) {
          try {
            onComplete();
          } catch (e) {
            console.error('Error in animation completion handler:', e);
          }
        }
      }, 50);
    }, ANIMATION_DURATION);
    
    // Clean up all timers when component unmounts
    return () => {
      clearTimeout(animationTimer);
      // Ensure we set active to false immediately on unmount
      setIsActive(false);
    };
  }, [width, height, onComplete, skipAnimation]);
  
  // Update confetti positions with a simple approach that doesn't use state updates
  // This prevents excessive re-renders that might cause the errors
  const animationRef = React.useRef<number>();
  const confettiRef = React.useRef<Confetti[]>([]);
  
  useEffect(() => {
    if (skipAnimation || !isActive) return;
    
    // Initial confetti
    confettiRef.current = generateConfetti(width, height);
    
    // Animation function that doesn't use setState during the animation
    const animate = () => {
      if (!isActive) return;
      
      // Update positions directly in the ref
      confettiRef.current = confettiRef.current.map(c => ({
        ...c,
        x: c.x + c.speedX,
        y: c.y + c.speedY + GRAVITY,
        rotation: c.rotation + c.rotationSpeed,
        speedY: c.speedY + GRAVITY,
      }));
      
      // Update the state less frequently to avoid re-render issues
      setConfetti([...confettiRef.current]);
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, skipAnimation, isActive]);
  
  if (skipAnimation || !isActive) return null;
  
  return (
    <Container>
      {/* Confetti particles */}
      {confetti.map((c, index) => (
        <Sprite
          key={`confetti-${index}`}
          texture={PIXI.Texture.WHITE}
          x={c.x}
          y={c.y}
          width={c.size}
          height={c.size}
          anchor={0.5}
          rotation={c.rotation}
          tint={c.color}
        />
      ))}
      
      {/* Celebration text - uses the text that matches the audio feedback */}
      <Container position={[width / 2, height / 2 - 50]}>
        <Text
          text={celebrationText || "Great job!"}
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fontFamily: 'Arial',
              fontSize: 48,
              fontWeight: 'bold',
              fill: '#FF9900',
              stroke: '#FFFFFF',
              strokeThickness: 5,
              dropShadow: true,
              dropShadowColor: '#000000',
              dropShadowDistance: 6,
            })
          }
        />
      </Container>
    </Container>
  );
};

export default CelebrationAnimation;