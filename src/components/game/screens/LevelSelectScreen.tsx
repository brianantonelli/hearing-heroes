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
  const { childName } = state;

  // Animation state
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [pulsePhases, setPulsePhases] = useState<number[]>([0, 0, 0, 0]);
  const [iconOffsets, setIconOffsets] = useState<number[]>([0, 0, 0, 0]);
  
  // Handle animation effects
  useEffect(() => {
    if (!state.enableAnimations) return;
    
    // Pulsing animation for level buttons
    const pulseTimer = setInterval(() => {
      setPulsePhases(prev => prev.map((phase, i) => 
        (phase + (i + 1) * 0.1) % 6.28 // Each level has slightly different phase speed
      ));
    }, 100);
    
    // Icon movement animation
    const iconTimer = setInterval(() => {
      setIconOffsets(prev => prev.map((offset, i) => 
        Math.sin((Date.now() / 800) + i * 1.5) * 3
      ));
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

  // Calculate positions
  const centerX = width / 2;
  const startY = 120;
  const buttonSpacing = 70;
  const buttonWidth = 250;
  const buttonHeight = 60;

  // Draw the button with fun decorations
  const drawLevelButton = React.useCallback((g: PIXI.Graphics, isSelected: boolean, index: number) => {
    const isHovered = hoverLevel === index + 1;
    g.clear();
    
    // Draw shadow for depth effect when animations are enabled
    if (state.enableAnimations) {
      g.beginFill(0x000000, 0.15);
      g.drawRoundedRect(-buttonWidth / 2 + 3, -buttonHeight / 2 + 4, buttonWidth, buttonHeight, 12);
      g.endFill();
    }
    
    // Button glow for selected level (when animations enabled)
    if (state.enableAnimations && isSelected) {
      const glowScale = 1 + Math.sin(pulsePhases[index]) * 0.03;
      g.beginFill(0x4178df, 0.3);
      g.drawRoundedRect(
        (-buttonWidth / 2) - 6 * glowScale, 
        (-buttonHeight / 2) - 6 * glowScale, 
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
      g.drawRoundedRect(-buttonWidth / 2 + 5, -buttonHeight / 2 + 5, buttonWidth - 10, buttonHeight * 0.4, 6);
      g.endFill();
    }
  }, [buttonWidth, buttonHeight, hoverLevel, state.enableAnimations, pulsePhases]);

  return (
    <Container>
      {/* Title text */}
      <Text
        text={`Hello, ${childName}!`}
        anchor={0.5}
        x={centerX}
        y={40}
        style={
          new PIXI.TextStyle({
            fill: 0x4287f5,
            fontSize: 36,
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
      />

      <Text
        text="Choose a level to start playing:"
        anchor={0.5}
        x={centerX}
        y={80}
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 24,
            fontFamily: 'Arial',
          })
        }
      />

      {/* Level buttons */}
      {levels.map((level, index) => {
        const y = startY + index * buttonSpacing;
        const isSelected = level.number === state.currentLevel;
        const iconYOffset = state.enableAnimations ? iconOffsets[index] : 0;

        return (
          <Container
            key={level.number}
            position={[centerX, y]}
            interactive={true}
            cursor="pointer"
            pointerdown={() => onLevelSelect(level.number)}
            pointerover={() => setHoverLevel(level.number)}
            pointerout={() => setHoverLevel(null)}
            scale={isSelected && state.enableAnimations ? (1 + Math.sin(pulsePhases[index]) * 0.02) : 1}
          >
            <Graphics draw={g => drawLevelButton(g, isSelected, index)} />
            
            {/* Level icon with animations (left side) */}
            <Container position={[-buttonWidth / 2 + 32, 0]}>
              <Text
                text={level.icon}
                anchor={0.5}
                y={iconYOffset}
                style={new PIXI.TextStyle({ fontSize: 26 })}
              />
            </Container>
            
            <Container position={[10, 0]}>
              <Text
                text={level.name}
                anchor={[0, 0.5]}
                y={-8}
                style={
                  new PIXI.TextStyle({
                    fill: isSelected ? 0x4178df : 0x4287f5,
                    fontSize: 20,
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
                    dropShadow: state.enableAnimations && isSelected,
                    dropShadowAlpha: 0.3,
                    dropShadowDistance: 1,
                  })
                }
              />
              <Text
                text={level.description}
                anchor={[0, 0.5]}
                y={14}
                style={
                  new PIXI.TextStyle({
                    fill: 0x666666,
                    fontSize: 16,
                    fontFamily: 'Arial',
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

      {/* Start button */}
      <GameButton
        onClick={() => onLevelSelect(state.currentLevel)}
        text={`Start Level ${state.currentLevel}`}
        x={centerX}
        y={height - 80}
        width={300}
        fontSize={24}
        icon="🚀"
        backgroundColor={0x22cc22} // Green color for start button
      />
    </Container>
  );
};

export default LevelSelectScreen;