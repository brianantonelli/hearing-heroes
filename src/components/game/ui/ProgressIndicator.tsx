import React from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  backgroundColor?: number;
  fillColor?: number;
  textColor?: number;
}

/**
 * Component to show progress through the game
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  x,
  y,
  width = 200,
  height = 26,
  backgroundColor = 0xdddddd,
  fillColor = 0x4287f5,
  textColor = 0x333333,
}) => {
  // Calculate fill percentage
  const fillPercentage = Math.min(1, Math.max(0, current / total));
  const fillWidth = fillPercentage * width;

  // Draw background bar
  const drawBackground = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(backgroundColor);
      g.lineStyle(3, 0x000000, 0.2); // Thicker border with slightly more opacity
      g.drawRoundedRect(-width / 2, -height / 2, width, height, height / 4);
      g.endFill();
    },
    [backgroundColor, width, height]
  );

  // Draw fill bar
  const drawFill = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (fillWidth > 0) {
        g.beginFill(fillColor);
        // Make sure the rounded corners match properly
        if (fillPercentage < 1) {
          // Use simpler version without corner radius options
          g.drawRoundedRect(-width / 2, -height / 2, fillWidth, height, height / 4);
        } else {
          g.drawRoundedRect(-width / 2, -height / 2, fillWidth, height, height / 4);
        }
        g.endFill();
      }
    },
    [fillColor, width, height, fillWidth, fillPercentage]
  );

  // Determine if the text should be white based on progress
  const shouldUseWhiteText = fillPercentage > 0.5;

  // Text color changes to white when progress is past 50%
  const progressTextColor = shouldUseWhiteText ? 0xffffff : textColor;

  return (
    <Container position={[x, y]}>
      {/* Background bar */}
      <Graphics draw={drawBackground} />

      {/* Fill bar */}
      <Graphics draw={drawFill} />

      {/* Progress text */}
      <Text
        text={`${current}/${total}`}
        anchor={0.5}
        style={
          new PIXI.TextStyle({
            fill: progressTextColor,
            fontSize: 16,
            fontFamily: 'ABeeZee, Arial, sans-serif',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowAlpha: 0.3,
            dropShadowDistance: 1,
            dropShadowColor: shouldUseWhiteText ? 0x000000 : 0xffffff,
          })
        }
      />
    </Container>
  );
};

export default ProgressIndicator;