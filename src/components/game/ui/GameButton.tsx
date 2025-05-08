import React, { useEffect, useState, useRef } from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useAppContext } from '../../../context/AppContext';

interface GameButtonProps {
  text: string;
  x: number;
  y: number;
  onClick: () => void;
  backgroundColor?: number;
  textColor?: number;
  fontSize?: number;
  padding?: number;
  width?: number;
  icon?: string;
}

/**
 * Reusable button component for game interactions with fun animations
 */
const GameButton: React.FC<GameButtonProps> = ({
  text,
  x,
  y,
  onClick,
  backgroundColor = 0x4287f5,
  textColor = 0xffffff,
  fontSize = 24,
  padding = 10,
  width = 200,
  icon,
}) => {
  const { state } = useAppContext();
  const { enableAnimations } = state;

  // Animation states
  const [scale, setScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [iconBouncePhase, setIconBouncePhase] = useState(0);

  // Animation timers
  const pulseTimer = useRef<NodeJS.Timeout | null>(null);
  const glowTimer = useRef<NodeJS.Timeout | null>(null);
  const bounceTimer = useRef<NodeJS.Timeout | null>(null);

  // For child-friendly design, emphasize the emoji over text
  // and ensure button has adequate padding
  const iconSize = fontSize * 1.8; // Make icon much larger than text
  const buttonHeight = iconSize + fontSize + padding * 2.5;

  // Handle animations
  useEffect(() => {
    if (!enableAnimations) return;

    // Subtle pulse animation
    pulseTimer.current = setInterval(() => {
      setScale(s => (s === 1 ? 1.03 : 1));
    }, 2000);

    // Glow effect animation
    glowTimer.current = setInterval(() => {
      setGlowIntensity(g => (g + 1) % 10);
    }, 100);

    // Icon bounce animation (subtle)
    bounceTimer.current = setInterval(() => {
      setIconBouncePhase(p => (p + 1) % 20);
    }, 80);

    return () => {
      if (pulseTimer.current) clearInterval(pulseTimer.current);
      if (glowTimer.current) clearInterval(glowTimer.current);
      if (bounceTimer.current) clearInterval(bounceTimer.current);
    };
  }, [enableAnimations]);

  // Calculate icon bounce offset - subtle up/down movement
  const iconYOffset = enableAnimations ? Math.sin(iconBouncePhase * 0.3) * 3 : 0;

  // Handle button press
  const handlePointerDown = () => {
    setIsPressed(true);
    onClick();
    // Reset press state after a short delay for visual feedback
    setTimeout(() => setIsPressed(false), 150);
  };

  // Draw the button with glow and scale effects
  const drawButtonUpdated = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // Optional glow for animated version
      if (enableAnimations && glowIntensity > 5) {
        g.beginFill(backgroundColor, 0.3);
        g.drawRoundedRect(-width / 2 - 5, -buttonHeight / 2 - 5, width + 10, buttonHeight + 10, 18);
        g.endFill();
      }

      // Button base shadow (for depth)
      if (enableAnimations && !isPressed) {
        g.beginFill(0x000000, 0.2);
        g.drawRoundedRect(-width / 2 + 2, -buttonHeight / 2 + 4, width, buttonHeight, 15);
        g.endFill();
      }

      // Main button
      g.beginFill(backgroundColor);
      g.lineStyle(3, 0x000000, 0.15);
      g.drawRoundedRect(-width / 2, -buttonHeight / 2, width, buttonHeight, 15);

      // Fun button decoration for kids
      if (enableAnimations) {
        // Add colorful accent to top edge
        g.beginFill(0xffcc00, 0.6);
        g.lineStyle(0);
        g.drawRoundedRect(-width / 2 + 6, -buttonHeight / 2 + 3, width - 12, 6, 3);

        // Add subtle gradient-like effect
        g.beginFill(0xffffff, 0.15);
        g.lineStyle(0);
        g.drawRoundedRect(-width / 2 + 10, -buttonHeight / 2 + 10, width - 20, buttonHeight / 3, 6);
      }

      g.endFill();
    },
    [backgroundColor, width, buttonHeight, enableAnimations, glowIntensity, isPressed]
  );

  return (
    <Container
      position={[x, y]}
      interactive={true}
      cursor="pointer"
      pointerdown={handlePointerDown}
      scale={isPressed ? 0.95 : enableAnimations ? scale : 1}
    >
      <Graphics draw={drawButtonUpdated} />

      {/* Center the emoji and make it prominent */}
      <Container position={[0, -fontSize / 3 + (enableAnimations ? iconYOffset : 0)]}>
        <Text
          text={icon || '🔊'} // Default to speaker emoji if none provided
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fontSize: iconSize,
            })
          }
        />
      </Container>

      {/* Text positioned below the emoji */}
      <Text
        text={text}
        anchor={0.5}
        y={iconSize / 2 + 10} // Position below the emoji
        style={
          new PIXI.TextStyle({
            fill: textColor,
            fontSize: fontSize * 0.8, // Slightly smaller text
            fontFamily: 'ABeeZee, ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
            dropShadow: enableAnimations,
            dropShadowAlpha: 0.5,
            dropShadowDistance: 2,
            letterSpacing: 1,
          })
        }
      />
    </Container>
  );
};

export default GameButton;