import React, { useState, useEffect, useRef } from 'react';
import { Container, Text, Sprite, Graphics } from '@pixi/react';
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
  const [readyText, setReadyText] = useState('Ready...');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [iconSize, setIconSize] = useState(0);
  const [animTime, setAnimTime] = useState(0);

  // Animation references
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  // Skip animations if disabled in preferences
  const skipAnimation = !state.enableAnimations;

  // Level icons - map level number to fun kid-friendly emoji
  const levelIcons = ['🌈', '🌟', '🎮', '🚀', '🏆'];
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
    // Play ready set go audio - make sure it plays after a small delay
    try {
      if (state.isAudioEnabled) {
        // Small delay ensures audio context is ready
        const audioTimer = setTimeout(() => {
          try {
            audioService.playAudio('/audio/feedback/ready_set_go.mp3');
          } catch (err) {
            console.error('Error playing audio:', err);
          }
        }, 200);

        return () => clearTimeout(audioTimer);
      }
    } catch (err) {
      console.error('Error in audio setup:', err);
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
    const textTimer1 = setTimeout(() => setReadyText(texts[1]), 400);
    const textTimer2 = setTimeout(() => setReadyText(texts[2]), 600);

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

  // Animate particles and handle animation time
  useEffect(() => {
    if (skipAnimation) return;

    const animate = () => {
      // Update animation time for all components
      setAnimTime(Date.now());

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

  // Get a more fun background color for each level
  const getBgColor = () => {
    const colors = [
      0xe6f7ff, // Light blue for level 1
      0xfff1e6, // Light orange for level 2
      0xf0ffe6, // Light green for level 3
      0xffe6f0, // Light pink for level 4
      0xfff9e6, // Light yellow for level 5
    ];
    return colors[(levelNumber - 1) % colors.length];
  };

  // Skip to ready text for debugging
  useEffect(() => {
    if (!skipAnimation && state.isAudioEnabled) {
      setTimeout(() => {
        setReadyText('Ready...');
      }, 200);
      setTimeout(() => {
        setReadyText('Set...');
      }, 800);
      setTimeout(() => {
        setReadyText('Go!');
      }, 1300);
    }
  }, [skipAnimation, state.isAudioEnabled]);

  return (
    <Container position={[width / 2, height / 2]}>
      {/* Simple background */}
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(getBgColor(), 0.7);
          g.drawRoundedRect(-width / 2, -height / 2, width, height, 20);
          g.endFill();

          // Simple border
          const borderColor =
            readyText === 'Go!' ? 0x4caf50 : readyText === 'Set...' ? 0xff9800 : 0x2196f3;

          g.lineStyle(5, borderColor, 0.4);
          g.drawRoundedRect(-width / 2 + 20, -height / 2 + 20, width - 40, height - 40, 40);
        }}
      />

      {/* Text elements */}
      <Text
        text={`Level ${levelNumber}`}
        anchor={0.5}
        y={-50}
        style={
          new PIXI.TextStyle({
            fill: 0x0066cc,
            fontSize: 36,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
          })
        }
      />

      <Text
        text={levelIcon}
        anchor={0.5}
        y={-120}
        style={
          new PIXI.TextStyle({
            fontSize: 60,
          })
        }
      />

      {/* Ready/Set/Go text with animations */}
      <Text
        text={readyText}
        anchor={0.5}
        y={50}
        style={
          new PIXI.TextStyle({
            fill: getReadyTextColor(),
            fontSize: 52,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.4,
            dropShadowDistance: 3,
          })
        }
      />
    </Container>
  );
};

export default IntroScreen;
