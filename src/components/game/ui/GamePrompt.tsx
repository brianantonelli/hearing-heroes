import React from 'react';
import { Container, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface GamePromptProps {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Component for displaying game prompts and instructions
 */
const GamePrompt: React.FC<GamePromptProps> = ({
  text,
  x,
  y,
  fontSize = 20,
  color = 0x333333,
  width = 400,
  align = 'center',
}) => {
  return (
    <Container position={[x, y]}>
      <Text
        text={text}
        anchor={align === 'center' ? 0.5 : align === 'right' ? 1 : 0}
        style={
          new PIXI.TextStyle({
            fill: color,
            fontSize: fontSize,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: '500',
            letterSpacing: 0.5,
            align: align,
            wordWrap: width > 0,
            wordWrapWidth: width,
          })
        }
      />
    </Container>
  );
};

export default GamePrompt;