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
  height = 20, 
  backgroundColor = 0xdddddd, 
  fillColor = 0x4287f5, 
  textColor = 0x333333 
}) => {
  // Calculate fill percentage
  const fillPercentage = Math.min(1, Math.max(0, current / total));
  const fillWidth = fillPercentage * width;
  
  // Draw background bar
  const drawBackground = React.useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(backgroundColor);
    g.lineStyle(1, 0x000000, 0.1);
    g.drawRoundedRect(-width/2, -height/2, width, height, height / 2);
    g.endFill();
  }, [backgroundColor, width, height]);
  
  // Draw fill bar
  const drawFill = React.useCallback((g: PIXI.Graphics) => {
    g.clear();
    if (fillWidth > 0) {
      g.beginFill(fillColor);
      // Make sure the rounded corners match properly
      if (fillPercentage < 1) {
        // Use simpler version without corner radius options
        g.drawRoundedRect(-width/2, -height/2, fillWidth, height, height / 2);
      } else {
        g.drawRoundedRect(-width/2, -height/2, fillWidth, height, height / 2);
      }
      g.endFill();
    }
  }, [fillColor, width, height, fillWidth, fillPercentage]);
  
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
        style={new PIXI.TextStyle({
          fill: textColor,
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        })}
      />
    </Container>
  );
};

export default ProgressIndicator;