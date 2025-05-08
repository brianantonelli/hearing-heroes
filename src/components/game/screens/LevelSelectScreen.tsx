import React from 'react';
import { Container, Graphics, Text } from '@pixi/react';
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

  // Define levels with their descriptions
  const levels = [
    { number: 1, name: 'Level 1', description: 'Beginning' },
    { number: 2, name: 'Level 2', description: 'Easy' },
    { number: 3, name: 'Level 3', description: 'Medium' },
    { number: 4, name: 'Level 4', description: 'Hard' },
  ];

  // Calculate positions
  const centerX = width / 2;
  const startY = 120;
  const buttonSpacing = 70;
  const buttonWidth = 250;
  const buttonHeight = 60;

  // Draw the button
  const drawLevelButton = React.useCallback((g: PIXI.Graphics, isSelected: boolean) => {
    g.clear();
    g.beginFill(isSelected ? 0xd1e0ff : 0xffffff);
    g.lineStyle(4, isSelected ? 0x4178df : 0x4287f5);
    g.drawRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    g.endFill();
  }, []);

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

        return (
          <Container
            key={level.number}
            position={[centerX, y]}
            interactive={true}
            cursor="pointer"
            pointerdown={() => onLevelSelect(level.number)}
          >
            <Graphics draw={g => drawLevelButton(g, isSelected)} />
            <Text
              text={level.name}
              anchor={0.5}
              y={-10}
              style={
                new PIXI.TextStyle({
                  fill: 0x4287f5,
                  fontSize: 20,
                  fontFamily: 'Arial',
                  fontWeight: 'bold',
                })
              }
            />
            <Text
              text={level.description}
              anchor={0.5}
              y={15}
              style={
                new PIXI.TextStyle({
                  fill: 0x666666,
                  fontSize: 16,
                  fontFamily: 'Arial',
                })
              }
            />
          </Container>
        );
      })}

      {/* Start button */}
      <GameButton
        onClick={() => onLevelSelect(state.currentLevel)}
        text={`Start with Level ${state.currentLevel}`}
        x={centerX}
        y={height - 80}
        width={300}
        fontSize={24}
      />
    </Container>
  );
};

export default LevelSelectScreen;