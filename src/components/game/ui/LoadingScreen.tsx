import React, { useState, useEffect } from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useAppContext } from '../../../context/AppContext';

interface LoadingScreenProps {
  width: number;
  height: number;
}

/**
 * Fun animated loading screen for children with bouncing letters and characters
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ width, height }) => {
  const { state } = useAppContext();
  const enableAnimations = state.enableAnimations;
  
  // Animation states
  const [dots, setDots] = useState(0);
  const [characterY, setCharacterY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [progress, setProgress] = useState(0);
  const [letterOffsets, setLetterOffsets] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  
  // Characters to show during loading
  const characters = ['🎮', '🎵', '🎧', '🎤', '👂', '👋'];
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Animate the dots for visual feedback
  useEffect(() => {
    if (!enableAnimations) return;
    
    const dotsTimer = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    
    const characterTimer = setInterval(() => {
      setCurrentCharIndex(prev => (prev + 1) % characters.length);
    }, 800);
    
    const bounceTimer = setInterval(() => {
      setCharacterY(Math.sin(Date.now() / 200) * 15);
    }, 50);
    
    const rotationTimer = setInterval(() => {
      setRotation(prev => prev + 0.1);
    }, 50);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (Math.random() * 5);
        return Math.min(95, newProgress); // Cap at 95% to avoid setting expectations too high
      });
    }, 150);
    
    // Animate individual letters
    const letterTimer = setInterval(() => {
      setLetterOffsets(prev => 
        prev.map((offset, idx) => 
          Math.sin((Date.now() / 300) + idx * 0.7) * 10
        )
      );
    }, 50);
    
    return () => {
      clearInterval(dotsTimer);
      clearInterval(characterTimer);
      clearInterval(bounceTimer);
      clearInterval(rotationTimer);
      clearInterval(progressTimer);
      clearInterval(letterTimer);
    };
  }, [enableAnimations]);
  
  // Get loading text with animated dots
  const loadingText = `Loading${'.'.repeat(dots)}`;
  
  // Get current character to display
  const currentCharacter = characters[currentCharIndex];
  
  // Draw loading bar
  const drawLoadingBar = React.useCallback((g: PIXI.Graphics) => {
    const barWidth = width * 0.6;
    const barHeight = 20;
    const x = -barWidth / 2;
    const y = 40;
    
    // Background
    g.clear();
    g.beginFill(0xDDDDDD);
    g.drawRoundedRect(x, y, barWidth, barHeight, 10);
    g.endFill();
    
    // Progress fill
    g.beginFill(0x4287f5);
    g.drawRoundedRect(x, y, barWidth * (progress / 100), barHeight, 10);
    g.endFill();
    
    // Add some fun decorative elements
    if (enableAnimations) {
      // Stars along the progress bar
      const starPositions = [0.2, 0.4, 0.6, 0.8];
      starPositions.forEach((pos) => {
        if (progress / 100 > pos) {
          g.beginFill(0xFFFF00);
          const starX = x + (barWidth * pos);
          const starY = y + barHeight / 2;
          g.drawStar(starX, starY, 5, 5, 3);
          g.endFill();
        }
      });
    }
  }, [width, progress, enableAnimations]);

  // Split the loading word into individual letters for animation
  const loadingLetters = "Loading Game".split('');
  
  return (
    <Container position={[width / 2, height / 2 - 50]}>
      {/* Animated character bouncing above */}
      <Text
        text={currentCharacter}
        anchor={0.5}
        y={-80 + characterY}
        scale={1.5}
        rotation={enableAnimations ? rotation * 0.2 : 0}
        style={new PIXI.TextStyle({ fontSize: 70 })}
      />
      
      {/* Main title with individual bouncing letters */}
      <Container>
        {loadingLetters.map((letter, index) => (
          <Text
            key={index}
            text={letter}
            x={-120 + (index * 30)} // Adjusted starting position for wider text
            y={enableAnimations ? letterOffsets[index % letterOffsets.length] : 0}
            anchor={[0.5, 0.5]}
            style={
              new PIXI.TextStyle({
                fill: 0x4287f5,
                fontSize: 32,
                fontFamily: 'ABeeZee, Arial, sans-serif',
                fontWeight: 'bold',
              })
            }
          />
        ))}
      </Container>
      
      {/* Animated dots */}
      <Text 
        text={".".repeat(dots)}
        x={140}
        y={0}
        style={
          new PIXI.TextStyle({
            fill: 0x4287f5,
            fontSize: 32,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
          })
        }
      />
      
      {/* Progress bar */}
      <Graphics draw={drawLoadingBar} />
      
      {/* Progress percentage */}
      <Text
        text={`${Math.floor(progress)}%`}
        y={80}
        anchor={0.5}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 18,
            fontFamily: 'ABeeZee, Arial, sans-serif',
          })
        }
      />
      
      {/* Fun message */}
      <Text
        text="Get Ready for Fun!"
        y={110}
        anchor={0.5}
        style={
          new PIXI.TextStyle({
            fill: 0x666666,
            fontSize: 24,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontStyle: 'italic',
            fontWeight: 'bold',
          })
        }
      />
    </Container>
  );
};

export default LoadingScreen;