import React, { useEffect, useState, useRef } from 'react';
import { Container, Text, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import GameButton from '../ui/GameButton';
import { useAppContext } from '../../../context/AppContext';
import { audioService } from '../../../services/audioService';

interface CompleteScreenProps {
  score: {
    correct: number;
    total: number;
    retries: number;
    successfulRetries: number;
  };
  width: number;
  height: number;
  onContinue: () => void;
}

// Animation configuration
const CONFETTI_COUNT = 100;
const STARS_COUNT = 15;
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

interface Star {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  targetY: number;
  speedY: number;
  rotationSpeed: number;
  alpha: number;
}

/**
 * Component for displaying the level completion screen with animations
 */
const CompleteScreen: React.FC<CompleteScreenProps> = ({ score, width, height, onContinue }) => {
  const { state } = useAppContext();
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  // Animation states
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [titleScale, setTitleScale] = useState(0);
  const [scoreOpacity, setScoreOpacity] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [emojiSize, setEmojiSize] = useState(0);

  // Animation refs
  const confettiRef = useRef<Confetti[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  // Skip animation if animations are disabled in preferences
  const skipAnimation = !state.enableAnimations;

  // Determine message and emoji based on accuracy
  let message = '';
  let emoji = '';
  if (accuracy >= 90) {
    message = 'Great job!';
    emoji = '🌟';
  } else if (accuracy >= 80) {
    message = 'Great job!';
    emoji = '🎉';
  } else if (accuracy >= 60) {
    message = 'Good effort!';
    emoji = '👍';
  } else {
    message = 'Keep practicing!';
    emoji = '💪';
  }

  // Generate confetti particles
  const generateConfetti = () => {
    const items: Confetti[] = [];

    // Colors for confetti
    const colors = [
      0xf94144, // red
      0xf3722c, // orange
      0xf8961e, // yellow-orange
      0xf9c74f, // yellow
      0x90be6d, // yellowish-green
      0x43aa8b, // teal
      0x577590, // blue
      0x9381ff, // purple
      0xff99c8, // pink
    ];

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      items.push({
        x: width / 2,
        y: height / 2 - 100,
        rotation: Math.random() * Math.PI * 2,
        size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * INITIAL_VELOCITY * 1.5,
        speedY: (Math.random() - 1) * INITIAL_VELOCITY,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    return items;
  };

  // Generate achievement stars
  const generateStars = () => {
    const items: Star[] = [];

    for (let i = 0; i < STARS_COUNT; i++) {
      const startX = width / 2 + (Math.random() - 0.5) * width * 0.8;
      const startY = height + 100;

      items.push({
        x: startX,
        y: startY,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        targetY: height / 2 + (Math.random() - 0.5) * 200,
        speedY: -2 - Math.random() * 3,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0,
      });
    }

    return items;
  };

  // Initialize animations and play completion sound
  useEffect(() => {
    // Play the level complete audio when component mounts
    if (state.isAudioEnabled) {
      // Use specific file for level complete instead of the default
      audioService.playAudio('/audio/feedback/level_complete_great_job.mp3');
    }

    if (skipAnimation) {
      // If animations are disabled, just show the completed state
      setTitleScale(1);
      setScoreOpacity(1);
      setButtonVisible(true);
      setEmojiSize(80);
      return;
    }

    // Generate confetti and stars
    confettiRef.current = generateConfetti();
    setConfetti(confettiRef.current);

    starsRef.current = generateStars();
    setStars(starsRef.current);

    // Start title animation immediately
    const titleAnimInterval = setInterval(() => {
      setTitleScale(prev => {
        if (prev >= 1) {
          clearInterval(titleAnimInterval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 50);

    // Start emoji animation
    const emojiAnimInterval = setInterval(() => {
      setEmojiSize(prev => {
        if (prev >= 80) {
          clearInterval(emojiAnimInterval);
          return 80;
        }
        return prev + 8;
      });
    }, 50);

    // Show score with a delay
    setTimeout(() => {
      const scoreAnimInterval = setInterval(() => {
        setScoreOpacity(prev => {
          if (prev >= 1) {
            clearInterval(scoreAnimInterval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 40);
    }, 500);

    // Show button last
    setTimeout(() => {
      setButtonVisible(true);
    }, 1500);

    // Clean up
    return () => {
      clearInterval(titleAnimInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, skipAnimation]);

  // Run particle animations
  useEffect(() => {
    if (skipAnimation) return;

    const animate = () => {
      // Update confetti
      confettiRef.current = confettiRef.current.map(c => ({
        ...c,
        x: c.x + c.speedX,
        y: c.y + c.speedY,
        rotation: c.rotation + c.rotationSpeed,
        speedY: c.speedY + GRAVITY,
      }));

      // Update stars
      starsRef.current = starsRef.current.map(s => {
        // Move stars up
        const newY = s.y + s.speedY;

        // When star reaches its target position, slow it down
        let newSpeedY = s.speedY;
        if (newY <= s.targetY) {
          newSpeedY = Math.abs(s.speedY) * 0.8 * -1;

          // If almost stopped, make it hover
          if (Math.abs(newSpeedY) < 0.5) {
            newSpeedY = Math.sin(Date.now() / 500) * 0.5;
          }
        }

        // Fade in
        let newAlpha = s.alpha;
        if (s.alpha < 1) {
          newAlpha = Math.min(1, s.alpha + 0.05);
        }

        return {
          ...s,
          y: newY,
          speedY: newSpeedY,
          rotation: s.rotation + s.rotationSpeed,
          alpha: newAlpha,
        };
      });

      // Update states less frequently to avoid performance issues
      setConfetti([...confettiRef.current]);
      setStars([...starsRef.current]);

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
  }, [skipAnimation]);

  return (
    <Container position={[width / 2, height / 2]}>
      {/* Confetti animation */}
      {confetti.map((c, index) => (
        <Sprite
          key={`confetti-${index}`}
          texture={PIXI.Texture.WHITE}
          x={c.x - width / 2}
          y={c.y - height / 2}
          width={c.size}
          height={c.size / 2}
          anchor={0.5}
          rotation={c.rotation}
          tint={c.color}
        />
      ))}

      {/* Star animations */}
      {stars.map((star, index) => (
        <Text
          key={`star-${index}`}
          text="⭐"
          x={star.x - width / 2}
          y={star.y - height / 2}
          alpha={star.alpha}
          scale={star.scale}
          anchor={0.5}
          rotation={star.rotation}
          style={
            new PIXI.TextStyle({
              fontSize: 40,
            })
          }
        />
      ))}

      {/* Level complete title with scale animation */}
      <Text
        text="Level Complete!"
        anchor={0.5}
        y={-200}
        scale={titleScale}
        style={
          new PIXI.TextStyle({
            fill: 0x22cc22,
            fontSize: 42,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.3,
            dropShadowDistance: 3,
          })
        }
      />

      {/* Big emoji for visual reward with size animation */}
      <Text
        text={emoji}
        anchor={0.5}
        y={-100}
        style={
          new PIXI.TextStyle({
            fontSize: emojiSize,
          })
        }
      />

      {/* Encouragement message */}
      <Text
        text={message}
        anchor={0.5}
        y={-30}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 32,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
          })
        }
      />

      {/* Score display with fade-in animation */}
      <Text
        text={`Score: ${score.correct} / ${score.total} (${accuracy}%)`}
        anchor={0.5}
        y={10}
        alpha={scoreOpacity}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 24,
            fontFamily: 'ABeeZee, Arial, sans-serif',
          })
        }
      />

      {/* Continue button appears after animations */}
      {buttonVisible && (
        <GameButton
          text="Continue"
          x={0}
          y={120}
          onClick={onContinue}
          width={200}
          fontSize={26}
          padding={14}
          backgroundColor={0x22cc22} /* Green color for continue */
          icon="⏩" /* Fast-forward emoji is more intuitive than arrow */
        />
      )}
    </Container>
  );
};

export default CompleteScreen;
