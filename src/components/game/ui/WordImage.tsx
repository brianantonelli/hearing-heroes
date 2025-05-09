import React, { useEffect, useState, useRef } from 'react';
import { Container, Sprite, Text, useTick, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface WordImageProps {
  imagePath: string;
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive: boolean;
  onSelect: () => void;
  isSelected?: boolean;
  isCorrect?: boolean | null;
}

// For sparkle animation
interface Sparkle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  alpha: number;
  color: number;
  life: number;
  maxLife: number;
  speed: number;
  vx: number;
  vy: number;
}

/**
 * Component for displaying a word image in the game
 * Handles image loading, display, and selection state
 */
const WordImage: React.FC<WordImageProps> = ({
  imagePath,
  word,
  x,
  y,
  width,
  height,
  interactive,
  onSelect,
  isSelected,
  isCorrect,
}) => {
  const [texture, setTexture] = useState<PIXI.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [glowAlpha, setGlowAlpha] = useState(0);
  const [isInteractionEnabled, setIsInteractionEnabled] = useState(false);

  // Animation references
  const sparklesRef = useRef<Sparkle[]>([]);
  const correctAnimationActive = useRef(false);
  const incorrectAnimationActive = useRef(false);
  const incorrectBounceRef = useRef(0);

  // Animation reference for floating effect
  const animationRef = useRef({
    time: 0,
    speed: 0.02, // Controls animation speed
    amplitude: 4, // Controls how much the card moves up and down (4 pixels)
    uniqueOffset: Math.random() * Math.PI * 2, // Random offset for each card so they don't all move together
  });

  // Create sparkles for correct answer animation
  const createSparkles = () => {
    const newSparkles: Sparkle[] = [];
    const colors = [0xffd700, 0x00ff00, 0xff4500, 0x1e90ff, 0xff69b4]; // Gold, Green, OrangeRed, DodgerBlue, HotPink

    // Create 20 sparkles with random properties
    for (let i = 0; i < 20; i++) {
      // Random angle and distance from center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * width * 0.5;

      // Position based on angle and distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      newSparkles.push({
        x,
        y,
        size: 5 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        alpha: 0.7 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 30 + Math.random() * 30,
        speed: 0.5 + Math.random() * 1.5,
        vx: Math.cos(angle) * (1 + Math.random()),
        vy: Math.sin(angle) * (1 + Math.random()),
      });
    }

    sparklesRef.current = newSparkles;
    setSparkles(newSparkles);
  };

  // Handle animations for floating and correct answer effects
  useTick(delta => {
    // If selected and correct, run the celebration animation
    if (isSelected && isCorrect === true) {
      // Start the animation if not already active
      if (!correctAnimationActive.current) {
        correctAnimationActive.current = true;
        createSparkles();
      }

      // Update sparkles
      if (sparklesRef.current.length > 0) {
        sparklesRef.current = sparklesRef.current.map(sparkle => {
          // Update life and position
          const newLife = sparkle.life + delta;
          const lifeRatio = newLife / sparkle.maxLife;

          // Remove sparkle if it's reached its max life
          if (newLife >= sparkle.maxLife) {
            return { ...sparkle, life: sparkle.maxLife };
          }

          // Update position and properties
          return {
            ...sparkle,
            x: sparkle.x + sparkle.vx * sparkle.speed,
            y: sparkle.y + sparkle.vy * sparkle.speed,
            rotation: sparkle.rotation + 0.01 * delta,
            alpha: sparkle.alpha * (1 - lifeRatio * 0.8), // Fade out gradually
            size: sparkle.size * (1 - lifeRatio * 0.5), // Shrink gradually
            life: newLife,
          };
        });

        // Filter out dead sparkles
        const activeSparkles = sparklesRef.current.filter(s => s.life < s.maxLife);
        setSparkles(activeSparkles);
      }

      // Animate the glow effect
      setGlowAlpha(prev => {
        if (prev < 0.6) return prev + 0.03 * delta;
        return 0.6;
      });

      // Pulse scale animation
      setScale(1 + 0.05 * Math.sin(Date.now() / 200));

      // Small rotation animation
      setRotation(0.03 * Math.sin(Date.now() / 300));
    } else if (!isSelected && !isLoading && texture) {
      // Normal floating animation when not selected
      animationRef.current.time += delta * animationRef.current.speed;
      const newY =
        Math.sin(animationRef.current.time + animationRef.current.uniqueOffset) *
        animationRef.current.amplitude;
      setOffsetY(newY);
      setScale(1);
      setRotation(0);
      setGlowAlpha(0);
      correctAnimationActive.current = false;
    } else if (isSelected && isCorrect === false) {
      // Friendly bounce animation for incorrect selection
      if (!incorrectAnimationActive.current) {
        incorrectAnimationActive.current = true;
        incorrectBounceRef.current = 0;
      }

      // Create a gentle, encouraging "try again" bounce animation
      if (incorrectAnimationActive.current) {
        // Controls how fast the bounce animation progresses - much slower now
        incorrectBounceRef.current += delta * 0.06; // Reduced from 0.1
        
        // Easy elastic bounce effect with reduced frequency and amplitude
        const progress = Math.min(incorrectBounceRef.current, Math.PI * 2);
        const bounceAmount = Math.sin(progress * 2) * Math.exp(-progress * 0.15) * 5; // Reduced frequency (3 → 2), decay (0.2 → 0.15), and amplitude (10 → 5)
        
        // Horizontal bounce (side to side) is gentler and more "try again" like
        // than a vertical bounce which can feel more like "falling"
        setOffsetY(0);
        setRotation(bounceAmount * 0.005); // Even gentler rotation (0.01 → 0.005)
        
        // Very subtly pulsing scale - reduced significantly
        setScale(1 + Math.abs(bounceAmount) * 0.002); // Reduced from 0.005

        // Reset once the animation completes
        if (progress >= Math.PI * 2) {
          incorrectAnimationActive.current = false;
        }
      } else {
        // Reset animations when done
        setOffsetY(0);
        setScale(1);
        setRotation(0);
      }

      setGlowAlpha(0);
      correctAnimationActive.current = false;
    }
  });

  // Effect to load the image
  useEffect(() => {
    // Load the image
    setIsLoading(true);
    setLoadError(false);

    PIXI.Assets.load(imagePath)
      .then(texture => {
        setTexture(texture);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(`Failed to load image: ${imagePath}`, error);
        setIsLoading(false);
        setLoadError(true);
      });
  }, [imagePath]);

  // Effect to delay interaction after becoming interactive
  useEffect(() => {
    if (interactive) {
      // Initially disable interaction
      setIsInteractionEnabled(false);

      // Enable interaction after a delay to allow audio to play
      const timer = setTimeout(() => {
        setIsInteractionEnabled(true);
      }, 1600);

      return () => clearTimeout(timer);
    } else {
      setIsInteractionEnabled(false);
    }
  }, [interactive, isSelected]);

  if (isLoading) {
    // Show loading spinner
    return (
      <Container position={[x, y]}>
        <Text
          text="Loading..."
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 16,
            })
          }
        />
      </Container>
    );
  }

  if (loadError || !texture) {
    // Show error message
    return (
      <Container position={[x, y]}>
        <Text
          text="⚠️"
          anchor={0.5}
          y={-15}
          style={
            new PIXI.TextStyle({
              fontSize: 32,
            })
          }
        />
        <Text
          text="Image Error"
          anchor={0.5}
          y={15}
          style={
            new PIXI.TextStyle({
              fill: 0xcc2222,
              fontSize: 14,
            })
          }
        />
      </Container>
    );
  }

  // Draw function for sparkles
  const drawSparkle = (g: PIXI.Graphics, sparkle: Sparkle) => {
    g.clear();
    g.beginFill(sparkle.color, sparkle.alpha);

    // Draw a star shape
    const numPoints = 5;
    const outerRadius = sparkle.size;
    const innerRadius = sparkle.size * 0.4;
    const step = Math.PI / numPoints;

    // Draw star
    let startX = outerRadius;
    let startY = 0;
    g.moveTo(startX, startY);

    for (let i = 1; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(i * step) * radius;
      const y = Math.sin(i * step) * radius;
      g.lineTo(x, y);
    }

    g.lineTo(startX, startY);
    g.endFill();
  };

  // Draw glow effect for correct answer
  const drawGlow = (g: PIXI.Graphics) => {
    g.clear();

    // Create a glow effect with gradient
    const radius = Math.max(width, height) * 0.6;
    g.beginFill(0x22cc22, glowAlpha);
    g.drawCircle(0, 0, radius);
    g.endFill();

    // Add inner brighter glow
    g.beginFill(0x88ff88, glowAlpha * 0.7);
    g.drawCircle(0, 0, radius * 0.7);
    g.endFill();
  };

  return (
    <Container
      position={[x, y + offsetY]} // Add the animated offset to the Y position
      interactive={interactive && isInteractionEnabled} // Only allow interaction after delay
      cursor={interactive && isInteractionEnabled ? 'pointer' : 'default'}
      pointerdown={interactive && isInteractionEnabled ? onSelect : undefined}
      rotation={rotation}
      scale={scale}
    >
      {/* Glow background for correct answers */}
      {isSelected && isCorrect === true && glowAlpha > 0 && <Graphics draw={drawGlow} />}

      {/* Image */}
      <Sprite
        texture={texture}
        anchor={0.5}
        width={width}
        height={height}
        alpha={isSelected && isCorrect !== true ? 0.7 : 1} // Only fade for incorrect
      />

      {/* Sparkles for correct answers */}
      {isSelected &&
        isCorrect === true &&
        sparkles.map((sparkle, index) => (
          <Graphics
            key={index}
            position={[sparkle.x, sparkle.y]}
            rotation={sparkle.rotation}
            draw={g => drawSparkle(g, sparkle)}
          />
        ))}

      {/* Friendly feedback overlay for incorrect answers */}
      {isSelected && isCorrect === false && (
        <Container position={[0, 0]}>
          <Graphics
            draw={g => {
              g.clear();

              // Draw a soft blue hint circle instead of an X
              const pulseScale = 1 + Math.sin(Date.now() / 300) * 0.05;

              // Outer glow
              g.beginFill(0x3498db, 0.2); // Soft blue glow
              g.drawCircle(0, 0, 45 * pulseScale);
              g.endFill();

              // Middle circle
              g.beginFill(0x3498db, 0.4);
              g.drawCircle(0, 0, 35 * pulseScale);
              g.endFill();

              // Inner circle with question mark
              g.beginFill(0x3498db, 0.7);
              g.drawCircle(0, 0, 25 * pulseScale);
              g.endFill();
            }}
          />

          {/* Question mark to indicate "try again" rather than "wrong" */}
          <Text
            text="?"
            anchor={0.5}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 32,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowAlpha: 0.5,
                dropShadowDistance: 1,
              })
            }
          />

          {/* Small hint text */}
          <Text
            text="Try again"
            anchor={0.5}
            y={45}
            style={
              new PIXI.TextStyle({
                fill: 0x3498db, // Friendly blue color
                fontSize: 16,
                fontWeight: 'bold',
              })
            }
          />
        </Container>
      )}

      {/* Word label - always visible */}
      <Text
        text={word}
        anchor={0.5}
        y={height / 2 + 30} // Adjusted to position below the image
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 30,
            wordWrap: true,
            wordWrapWidth: width - 20, // Adjusted for better word wrapping
          })
        }
      />
    </Container>
  );
};

export default WordImage;