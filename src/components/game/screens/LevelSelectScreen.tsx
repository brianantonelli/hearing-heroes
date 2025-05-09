import React, { useState, useEffect } from 'react';
import { Container, Graphics, Text, Sprite } from '@pixi/react';
import { useAppContext } from '../../../context/AppContext';
import { audioService } from '../../../services/audioService';
import GameButton from '../ui/GameButton';
import BackgroundAnimation from '../../common/BackgroundAnimation';
import * as PIXI from 'pixi.js';

interface LevelSelectScreenProps {
  onLevelSelect: (level: number) => void;
  width?: number;
  height?: number;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  onLevelSelect,
  width = 800, // Default width
  height = 600, // Default height
}) => {
  const { state } = useAppContext();

  // Animation state
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [pulsePhases, setPulsePhases] = useState<number[]>([0, 0, 0, 0]);
  const [iconOffsets, setIconOffsets] = useState<number[]>([0, 0, 0, 0]);
  const [titleHue, setTitleHue] = useState(0);
  const [titleBounce, setTitleBounce] = useState(0);
  const [titleScale, setTitleScale] = useState(1);

  // Animated background elements
  const [bubbles, setBubbles] = useState<
    Array<{
      x: number;
      y: number;
      radius: number;
      color: number;
      speed: number;
      phase: number;
    }>
  >([]);

  // Stop any playing audio when the level select screen appears
  useEffect(() => {
    // This ensures we don't hear audio from previous screens when level selection appears
    audioService.stopAll();
  }, []);

  // Initialize bubbles for the background
  useEffect(() => {
    if (state.enableAnimations) {
      // Create bubbles with fun properties
      const newBubbles = Array.from({ length: 20 }, () => ({
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

  // Handle animation effects
  useEffect(() => {
    if (!state.enableAnimations) return;

    // Pulsing animation for level buttons
    const pulseTimer = setInterval(() => {
      setPulsePhases(prev =>
        prev.map(
          (phase, i) => (phase + (i + 1) * 0.1) % 6.28 // Each level has slightly different phase speed
        )
      );
    }, 100);

    // Icon movement animation
    const iconTimer = setInterval(() => {
      setIconOffsets(prev => prev.map((offset, i) => Math.sin(Date.now() / 800 + i * 1.5) * 3));
    }, 50);

    // Bubble movement animation
    const bubbleTimer = setInterval(() => {
      setBubbles(prev =>
        prev.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.x + Math.sin(bubble.phase + Date.now() / 2000) * 0.5,
          // Reset bubble position when it goes off screen
          ...(bubble.y < -bubble.radius
            ? {
                x: Math.random() * width,
                y: height + bubble.radius,
                phase: Math.random() * Math.PI * 2,
              }
            : {}),
        }))
      );
    }, 30);

    // Rainbow title animation
    const titleAnimationTimer = setInterval(() => {
      // Update hue for rainbow effect (0-360)
      setTitleHue(prev => (prev + 2) % 360);

      // Update bounce effect
      setTitleBounce(Math.sin(Date.now() / 300) * 5);

      // Update scale for pulse effect
      setTitleScale(1 + Math.sin(Date.now() / 600) * 0.05);
    }, 30);

    return () => {
      clearInterval(pulseTimer);
      clearInterval(iconTimer);
      clearInterval(bubbleTimer);
      clearInterval(titleAnimationTimer);
    };
  }, [state.enableAnimations, width, height]);

  // Define levels with their descriptions and icons
  const levels = [
    { number: 1, name: 'Level 1', description: 'Beginning', icon: '🌱' },
    { number: 2, name: 'Level 2', description: 'Easy', icon: '🌟' },
    { number: 3, name: 'Level 3', description: 'Medium', icon: '🔥' },
    { number: 4, name: 'Level 4', description: 'Hard', icon: '🏆' },
  ];

  // Calculate positions for a perfectly centered 2x2 grid
  const centerX = width / 2;
  const centerY = height / 2;
  const buttonWidth = 200; // Button width
  const buttonHeight = 80; // Button height
  const gridGap = 60; // Gap between buttons

  // Calculate the total grid width and height to center it properly
  const gridWidth = 2 * buttonWidth + gridGap;
  const gridHeight = 2 * buttonHeight + gridGap;

  // Calculate starting position for the top-left button to center the entire grid
  const gridStartX = centerX - gridWidth / 2 + buttonWidth / 2;
  const gridStartY = centerY - gridHeight / 2 + buttonHeight / 2;

  // Handle level selection with custom handling
  const handleSelectLevel = (level: number) => {
    // First, set the current level
    onLevelSelect(level);

    // We'll call this directly to avoid the weird auto-start issue
    // The parent component will handle the rest
  };

  // Draw the button with fun decorations
  const drawLevelButton = React.useCallback(
    (g: PIXI.Graphics, isSelected: boolean, index: number) => {
      const isHovered = hoverLevel === index + 1;
      g.clear();

      // Draw shadow for depth effect when animations are enabled
      if (state.enableAnimations) {
        g.beginFill(0x000000, 0.15);
        g.drawRoundedRect(
          -buttonWidth / 2 + 3,
          -buttonHeight / 2 + 4,
          buttonWidth,
          buttonHeight,
          12
        );
        g.endFill();
      }

      // Button glow for selected level (when animations enabled)
      if (state.enableAnimations && isSelected) {
        const glowScale = 1 + Math.sin(pulsePhases[index]) * 0.03;
        g.beginFill(0x4178df, 0.3);
        g.drawRoundedRect(
          -buttonWidth / 2 - 6 * glowScale,
          -buttonHeight / 2 - 6 * glowScale,
          buttonWidth + 12 * glowScale,
          buttonHeight + 12 * glowScale,
          15
        );
        g.endFill();
      }

      // Main button
      g.beginFill(isSelected ? 0xd1e0ff : isHovered ? 0xf0f7ff : 0xffffff);
      g.lineStyle(4, isSelected ? 0x4178df : isHovered ? 0x5c98ff : 0x4287f5);
      g.drawRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
      g.endFill();

      // Fun decorative elements for kids when animations enabled
      if (state.enableAnimations) {
        // Top accent bar
        g.beginFill(isSelected ? 0xffcc00 : 0xa0d0ff, 0.5);
        g.lineStyle(0);
        g.drawRoundedRect(-buttonWidth / 2 + 8, -buttonHeight / 2 + 5, buttonWidth - 16, 6, 3);
        g.endFill();

        // Inner highlight (gradient simulation)
        g.beginFill(0xffffff, 0.2);
        g.drawRoundedRect(
          -buttonWidth / 2 + 5,
          -buttonHeight / 2 + 5,
          buttonWidth - 10,
          buttonHeight * 0.4,
          6
        );
        g.endFill();
      }
    },
    [buttonWidth, buttonHeight, hoverLevel, state.enableAnimations, pulsePhases]
  );

  // Apply a small vertical offset to better center the grid in the available space
  const verticalOffset = 20;

  // Draw bubbles for the animated background
  const drawBubble = React.useCallback((g: PIXI.Graphics, bubble: (typeof bubbles)[0]) => {
    g.clear();

    // Draw a gradient-like bubble with alpha
    g.beginFill(bubble.color, 0.4);
    g.drawCircle(bubble.x, bubble.y, bubble.radius);
    g.endFill();

    // Highlight on top
    g.beginFill(0xffffff, 0.3);
    g.drawCircle(
      bubble.x - bubble.radius * 0.3,
      bubble.y - bubble.radius * 0.3,
      bubble.radius * 0.3
    );
    g.endFill();
  }, []);

  return (
    <Container>
      {/* Background with fun bubbles */}
      {state.enableAnimations &&
        bubbles.map((bubble, index) => <Graphics key={index} draw={g => drawBubble(g, bubble)} />)}

      {/* Add some fun stars in the corners */}
      {state.enableAnimations && (
        <>
          <Text
            text="✨"
            x={30}
            y={30}
            anchor={0.5}
            alpha={0.6}
            rotation={Date.now() / 3000}
            scale={{
              x: 1 + Math.sin(Date.now() / 1000) * 0.1,
              y: 1 + Math.sin(Date.now() / 1000) * 0.1,
            }}
            style={new PIXI.TextStyle({ fontSize: 30 })}
          />
          <Text
            text="✨"
            x={width - 30}
            y={30}
            anchor={0.5}
            alpha={0.6}
            rotation={-Date.now() / 3500}
            scale={{
              x: 1 + Math.sin(Date.now() / 950) * 0.1,
              y: 1 + Math.sin(Date.now() / 950) * 0.1,
            }}
            style={new PIXI.TextStyle({ fontSize: 35 })}
          />
          <Text
            text="✨"
            x={width - 50}
            y={height - 50}
            anchor={0.5}
            alpha={0.6}
            rotation={Date.now() / 4000}
            scale={{
              x: 1 + Math.sin(Date.now() / 900) * 0.1,
              y: 1 + Math.sin(Date.now() / 900) * 0.1,
            }}
            style={new PIXI.TextStyle({ fontSize: 40 })}
          />
          <Text
            text="✨"
            x={50}
            y={height - 50}
            anchor={0.5}
            alpha={0.6}
            rotation={-Date.now() / 3200}
            scale={{
              x: 1 + Math.sin(Date.now() / 1050) * 0.1,
              y: 1 + Math.sin(Date.now() / 1050) * 0.1,
            }}
            style={new PIXI.TextStyle({ fontSize: 30 })}
          />
        </>
      )}

      {/* Regular title when animations are disabled */}
      {!state.enableAnimations && (
        <Text
          text="Choose Your Level"
          anchor={0.5}
          x={centerX}
          y={40}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 28,
              fontFamily: 'ABeeZee, Arial, sans-serif',
              letterSpacing: 1,
              fontWeight: 'bold',
            })
          }
        />
      )}

      {/* Super kid-friendly title with fun elements */}
      {state.enableAnimations && (
        <Container position={[centerX, 40]}>
          {/* Cartoon-like decorations */}
          <Text
            text="🌈"
            anchor={0.5}
            x={-210 + Math.sin(Date.now() / 1000) * 5}
            y={0}
            scale={0.8}
            style={new PIXI.TextStyle({ fontSize: 30 })}
          />

          <Text
            text="⭐"
            anchor={0.5}
            x={210 - Math.sin(Date.now() / 1000) * 5}
            y={0}
            rotation={Date.now() / 2000}
            scale={0.8}
            style={new PIXI.TextStyle({ fontSize: 30 })}
          />

          {/* Individual animated letters */}
          {'Pick a Level!'.split('').map((letter, i) => {
            // Calculate individual letter position and effects
            const position = i * 22 - 100; // Centered positioning
            const letterHue = (titleHue + i * 15) % 360; // Staggered colors
            const letterY = letter === ' ' ? 0 : titleBounce * Math.sin(i * 0.7 + Date.now() / 300);
            const letterRotation = letter === ' ' ? 0 : Math.sin(Date.now() / 800 + i * 0.5) * 0.15;

            // Convert HSL to hex color
            const h = letterHue / 360;
            const s = 0.8; // More saturated colors
            const l = 0.55; // Brighter colors
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
            const m = l - c / 2;
            let r, g, b;
            if (h < 1 / 6) {
              r = c;
              g = x;
              b = 0;
            } else if (h < 2 / 6) {
              r = x;
              g = c;
              b = 0;
            } else if (h < 3 / 6) {
              r = 0;
              g = c;
              b = x;
            } else if (h < 4 / 6) {
              r = 0;
              g = x;
              b = c;
            } else if (h < 5 / 6) {
              r = x;
              g = 0;
              b = c;
            } else {
              r = c;
              g = 0;
              b = x;
            }

            const color =
              Math.round((r + m) * 255) * 65536 +
              Math.round((g + m) * 255) * 256 +
              Math.round((b + m) * 255);

            // For uppercase letters, make them extra fancy
            const isUpperCase = letter === letter.toUpperCase() && letter !== ' ';

            return (
              <Text
                key={i}
                text={letter}
                anchor={0.5}
                x={position}
                y={letterY}
                rotation={letterRotation}
                scale={titleScale * (isUpperCase ? 1.2 : 1)}
                style={
                  new PIXI.TextStyle({
                    fill: color,
                    fontSize: 36,
                    fontFamily: 'ABeeZee, Arial, sans-serif',
                    fontWeight: 'bold',
                    dropShadow: true,
                    dropShadowColor: 0x333333,
                    dropShadowDistance: 2,
                    dropShadowAlpha: 0.5,
                    stroke: 0xffffff,
                    strokeThickness: 2,
                  })
                }
              />
            );
          })}

          {/* Add animated playful elements */}
          <Text
            text="🎮"
            x={-135 + Math.sin(Date.now() / 1200) * 10}
            y={-20 + Math.cos(Date.now() / 1000) * 5}
            scale={0.75}
            anchor={0.5}
            style={new PIXI.TextStyle({ fontSize: 24 })}
          />

          <Text
            text="🎯"
            x={135 - Math.sin(Date.now() / 1200) * 10}
            y={-20 + Math.cos(Date.now() / 1000) * 5}
            scale={0.75}
            anchor={0.5}
            style={new PIXI.TextStyle({ fontSize: 24 })}
          />
        </Container>
      )}

      {/* Level buttons in 2x2 grid */}
      {levels.map((level, index) => {
        // Calculate grid position (2 columns)
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = gridStartX + col * (buttonWidth + gridGap);
        const y = gridStartY + row * (buttonHeight + gridGap) + verticalOffset;

        // Always show the correct selected level
        const isSelected = level.number === state.currentLevel;
        const iconYOffset = state.enableAnimations ? iconOffsets[index] : 0;

        return (
          <Container
            key={level.number}
            position={[x, y]}
            interactive={true}
            cursor="pointer"
            pointerdown={() => handleSelectLevel(level.number)}
            pointerover={() => setHoverLevel(level.number)}
            pointerout={() => setHoverLevel(null)}
            scale={
              isSelected && state.enableAnimations ? 1 + Math.sin(pulsePhases[index]) * 0.02 : 1
            }
          >
            <Graphics draw={g => drawLevelButton(g, isSelected, index)} />

            {/* Level icon (centered and larger) */}
            <Container position={[0, -15]}>
              <Text
                text={level.icon}
                anchor={0.5}
                y={iconYOffset}
                style={new PIXI.TextStyle({ fontSize: 32 })}
              />
            </Container>

            {/* Text centered below icon */}
            <Container position={[0, 18]}>
              <Text
                text={level.name}
                anchor={[0.5, 0.5]}
                style={
                  new PIXI.TextStyle({
                    fill: isSelected ? 0x4178df : 0x4287f5,
                    fontSize: 18,
                    fontFamily: 'ABeeZee, Arial, sans-serif',
                    fontWeight: 'bold',
                    dropShadow: state.enableAnimations && isSelected,
                    dropShadowAlpha: 0.3,
                    dropShadowDistance: 1,
                  })
                }
              />
            </Container>

            {/* Star indicator for unlocked levels */}
            {level.number <= state.currentLevel && (
              <Container position={[buttonWidth / 2 - 25, -buttonHeight / 2 + 15]}>
                <Text
                  text="✓"
                  anchor={0.5}
                  style={
                    new PIXI.TextStyle({
                      fontSize: 16,
                      fill: 0x22cc22,
                      fontWeight: 'bold',
                    })
                  }
                />
              </Container>
            )}
          </Container>
        );
      })}
    </Container>
  );
};

export default LevelSelectScreen;