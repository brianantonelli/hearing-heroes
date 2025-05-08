import React, { useState, useEffect } from 'react';
import { Container, Graphics, Text, Sprite } from '@pixi/react';
import { useAppContext } from '../../../context/AppContext';
import GameButton from '../ui/GameButton';
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

    return () => {
      clearInterval(pulseTimer);
      clearInterval(iconTimer);
    };
  }, [state.enableAnimations]);

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

  return (
    <Container>
      <Text
        text="Choose Your Level"
        anchor={0.5}
        x={centerX}
        y={40}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 24,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            letterSpacing: 0.5,
          })
        }
      />

      {/* Level buttons in 2x2 grid */}
      {levels.map((level, index) => {
        // Calculate grid position (2 columns)
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = gridStartX + col * (buttonWidth + gridGap);
        const y = gridStartY + row * (buttonHeight + gridGap) + verticalOffset;

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