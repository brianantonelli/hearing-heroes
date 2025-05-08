import React from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

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
 * Reusable button component for game interactions
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
  const drawButton = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(backgroundColor);
      g.lineStyle(2, 0x000000, 0.1);
      g.drawRoundedRect(-width / 2, -fontSize / 2 - padding, width, fontSize + padding * 2, 10);
      g.endFill();
    },
    [backgroundColor, fontSize, padding, width]
  );

  // For child-friendly design, emphasize the emoji over text
  // and ensure button has adequate padding
  const iconSize = fontSize * 1.8; // Make icon much larger than text
  const buttonHeight = iconSize + fontSize + padding * 2.5;

  const drawButtonUpdated = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(backgroundColor);
      g.lineStyle(3, 0x000000, 0.15);
      g.drawRoundedRect(-width / 2, -buttonHeight / 2, width, buttonHeight, 15);
      g.endFill();
    },
    [backgroundColor, width, buttonHeight]
  );

  return (
    <Container position={[x, y]} interactive={true} cursor="pointer" pointerdown={onClick}>
      <Graphics draw={drawButtonUpdated} />

      {/* Center the emoji and make it prominent */}
      <Container position={[0, -fontSize / 3]}>
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
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
      />
    </Container>
  );
};

export default GameButton;