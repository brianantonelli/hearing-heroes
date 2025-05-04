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
  icon
}) => {
  const drawButton = React.useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(backgroundColor);
    g.lineStyle(2, 0x000000, 0.1);
    g.drawRoundedRect(-width/2, -fontSize/2 - padding, width, fontSize + padding * 2, 10);
    g.endFill();
  }, [backgroundColor, fontSize, padding, width]);

  return (
    <Container 
      position={[x, y]}
      interactive={true}
      cursor="pointer"
      pointerdown={onClick}
    >
      <Graphics draw={drawButton} />
      {icon && (
        <Text
          text={icon}
          anchor={0.5}
          x={-width/2 + 20}
          style={new PIXI.TextStyle({
            fontSize: fontSize + 2,
          })}
        />
      )}
      <Text
        text={text}
        anchor={0.5}
        x={icon ? 10 : 0} // Offset text if there's an icon
        style={new PIXI.TextStyle({
          fill: textColor,
          fontSize: fontSize,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        })}
      />
    </Container>
  );
};

export default GameButton;