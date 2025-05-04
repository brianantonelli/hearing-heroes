import React from 'react';
import { Container, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface IntroScreenProps {
  levelNumber: number;
  width: number;
  height: number;
}

/**
 * Component for displaying the game intro screen
 */
const IntroScreen: React.FC<IntroScreenProps> = ({ levelNumber, width, height }) => {
  return (
    <Container position={[width / 2, height / 2]}>
      <Text
        text={`Level ${levelNumber}`}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0x333333,
          fontSize: 36,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          dropShadow: true,
          dropShadowAlpha: 0.2,
          dropShadowDistance: 2
        })}
      />
      <Text
        text="Get ready..."
        anchor={0.5}
        y={50}
        style={new PIXI.TextStyle({
          fill: 0x333333,
          fontSize: 24,
          fontFamily: 'Arial'
        })}
      />
    </Container>
  );
};

export default IntroScreen;