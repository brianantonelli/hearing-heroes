import React, { useEffect, useState, useCallback } from 'react';
import { Container, Sprite } from '@pixi/react';
import { useAppContext } from '../../../context/AppContext';
import * as PIXI from 'pixi.js';

// Animation configuration
const CONFETTI_COUNT = 100;
const ANIMATION_DURATION = 3000; // 3 seconds
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
  onComplete
}) => {
  const { state } = useAppContext();
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showText, setShowText] = useState(false);
  
  // Skip animation if animations are disabled in preferences
  const skipAnimation = !state.enableAnimations;
  
  // Generate confetti on component mount
  useEffect(() => {
    if (skipAnimation) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    setConfetti(generateConfetti(width, height));
    
    // Show the "Great job!" text after 500ms
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);
    
    // End the animation after the duration
    const animationTimer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, ANIMATION_DURATION);
    
    return () => {
      clearTimeout(textTimer);
      clearTimeout(animationTimer);
    };
  }, [width, height, onComplete, skipAnimation]);
  
  // Update confetti positions
  const updateConfetti = useCallback(() => {
    if (!isActive) return;
    
    setConfetti(prevConfetti => 
      prevConfetti.map(c => ({
        ...c,
        x: c.x + c.speedX,
        y: c.y + c.speedY + GRAVITY,
        rotation: c.rotation + c.rotationSpeed,
        speedY: c.speedY + GRAVITY,
      }))
    );
  }, [isActive]);
  
  // Set up animation frame
  useEffect(() => {
    if (skipAnimation) return;
    
    let animationFrameId: number;
    
    const animate = () => {
      updateConfetti();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateConfetti, skipAnimation]);
  
  if (skipAnimation) return null;
  
  if (!isActive) return null;
  
  return (
    <Container>
      {/* Confetti particles */}
      {confetti.map((c, index) => (
        <Sprite
          key={index}
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
      
      {/* Celebration text */}
      {showText && (
        <Container position={[width / 2, height / 2 - 50]}> {/* Moved up to avoid interfering with progress bar */}
          {/* Create the text object manually instead of as JSX element */}
          {(() => {
            const textStyle = new PIXI.TextStyle({
              fontFamily: 'Arial',
              fontSize: 48,
              fontWeight: 'bold',
              fill: ['#FF9900', '#FF3300'],
              stroke: '#FFFFFF',
              strokeThickness: 5,
              dropShadow: true,
              dropShadowColor: '#000000',
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 6,
              dropShadowDistance: 6,
            });
            const textObj = new PIXI.Text('Great job!', textStyle);
            textObj.anchor.set(0.5);
            return <Sprite texture={textObj.texture} x={0} y={0} anchor={0.5} />;
          })()}
        </Container>
      )}
    </Container>
  );
};

export default CelebrationAnimation;