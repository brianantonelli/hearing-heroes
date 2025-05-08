import React, { useState, useEffect, useRef } from 'react';
import { Container, Text, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useAppContext } from '../../../context/AppContext';
import { audioService } from '../../../services/audioService';

interface IntroScreenProps {
  levelNumber: number;
  width: number;
  height: number;
}

// Particle interface for animations
interface Particle {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  alpha: number;
}

/**
 * Component for displaying the game intro screen with fun animations
 */
const IntroScreen: React.FC<IntroScreenProps> = ({ levelNumber, width, height }) => {
  const { state } = useAppContext();

  // Animation states
  const [titleScale, setTitleScale] = useState(0);
  const [readyScale, setReadyScale] = useState(0);
  const [readyText, setReadyText] = useState('Get ready...');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [iconSize, setIconSize] = useState(0);

  // Animation references
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  // Skip animations if disabled in preferences
  const skipAnimation = !state.enableAnimations;

  // Level icons - map level number to fun emoji
  const levelIcons = ['🔊', '🎯', '🌟', '🚀', '🏆'];
  const levelIcon = levelIcons[levelNumber - 1] || '🎮';

  // Generate colorful particles
  const generateParticles = (count: number): Particle[] => {
    const items: Particle[] = [];
    const colors = [0x4caf50, 0x2196f3, 0xff9800, 0xe91e63, 0x9c27b0];

    for (let i = 0; i < count; i++) {
      items.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.8,
        y: height / 2 + (Math.random() - 0.5) * height * 0.8,
        scale: 0.2 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        alpha: 0.7 + Math.random() * 0.3,
      });
    }

    return items;
  };

  // Initialize animations and play sound
  useEffect(() => {
    // Play ready set go audio
    if (state.isAudioEnabled) {
      audioService.playAudio('/audio/feedback/ready_set_go.mp3');
    }

    if (skipAnimation) {
      setTitleScale(1);
      setReadyScale(1);
      setIconSize(60);
      return;
    }

    // Generate particles for background
    particlesRef.current = generateParticles(20);
    setParticles(particlesRef.current);

    // Title scale animation
    const titleAnimInterval = setInterval(() => {
      setTitleScale(prev => {
        if (prev >= 1) {
          clearInterval(titleAnimInterval);
          return 1;
        }
        return prev + 0.08;
      });
    }, 40);

    // Ready text animation - bounce in
    const readyAnimInterval = setInterval(() => {
      setReadyScale(prev => {
        if (prev >= 1) {
          clearInterval(readyAnimInterval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 50);

    // Level icon animation
    const iconAnimInterval = setInterval(() => {
      setIconSize(prev => {
        if (prev >= 60) {
          clearInterval(iconAnimInterval);
          return 60;
        }
        return prev + 6;
      });
    }, 50);

    // Ready text changes
    const texts = ['Ready...', 'Set...', 'Go!'];

    // Change text with timing matching the audio
    const textTimer1 = setTimeout(() => setReadyText(texts[1]), 800);
    const textTimer2 = setTimeout(() => setReadyText(texts[2]), 1600);

    return () => {
      clearInterval(titleAnimInterval);
      clearInterval(readyAnimInterval);
      clearInterval(iconAnimInterval);
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, skipAnimation, state.isAudioEnabled]);

  // Animate particles
  useEffect(() => {
    if (skipAnimation) return;

    const animate = () => {
      // Update particles
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: p.x + p.speedX,
        y: p.y + p.speedY,
        rotation: p.rotation + p.rotationSpeed,
        // Wrap particles around screen edges
        ...(p.x < 0 ? { x: width } : {}),
        ...(p.x > width ? { x: 0 } : {}),
        ...(p.y < 0 ? { y: height } : {}),
        ...(p.y > height ? { y: 0 } : {}),
      }));

      setParticles([...particlesRef.current]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, skipAnimation]);

  // Get text color based on countdown state
  const getReadyTextColor = () => {
    switch (readyText) {
      case 'Ready...':
        return 0x2196f3; // Blue
      case 'Set...':
        return 0xff9800; // Orange
      case 'Go!':
        return 0x4caf50; // Green
      default:
        return 0x333333;
    }
  };

  return (
    <Container position={[width / 2, height / 2]}>
      {/* Background particles */}
      {particles.map((p, index) => (
        <Sprite
          key={`particle-${index}`}
          texture={PIXI.Texture.WHITE}
          x={p.x - width / 2}
          y={p.y - height / 2}
          width={20}
          height={20}
          anchor={0.5}
          scale={p.scale}
          rotation={p.rotation}
          alpha={p.alpha * 0.3}
          tint={0xffd700} // Gold color
        />
      ))}

      {/* Level icon with animation */}
      <Text
        text={levelIcon}
        anchor={0.5}
        y={-120}
        style={
          new PIXI.TextStyle({
            fontSize: iconSize,
          })
        }
      />

      {/* Level title with scale animation */}
      <Text
        text={`Level ${levelNumber}`}
        anchor={0.5}
        y={-50}
        scale={titleScale}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 42,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.4,
            dropShadowDistance: 3,
          })
        }
      />

      {/* Ready/Set/Go text with animations */}
      <Text
        text={readyText}
        anchor={0.5}
        y={50}
        scale={readyScale}
        style={
          new PIXI.TextStyle({
            fill: getReadyTextColor(),
            fontSize: 48,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.3,
            dropShadowDistance: 2,
          })
        }
      />
    </Container>
  );
};

export default IntroScreen;
