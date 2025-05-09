import React, { useState, useEffect, useCallback } from 'react';
import { Container, Text, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useAppContext } from '../../../context/AppContext';

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
 * Fun, kid-friendly progress indicator with animations
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  x,
  y,
  width = 200,
  height = 30, // Taller by default
  backgroundColor = 0xf0f0f0,
  fillColor = 0x4287f5,
  textColor = 0x333333,
}) => {
  const { state } = useAppContext();
  const enableAnimations = state.enableAnimations;
  
  // Animation states
  const [starRotation, setStarRotation] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0.6);
  const [markerOffset, setMarkerOffset] = useState(0);
  
  // Animation effect for stars and glowing
  useEffect(() => {
    if (!enableAnimations) return;
    
    // Rotating star animation
    const starTimer = setInterval(() => {
      setStarRotation(prev => prev + 0.05);
    }, 50);
    
    // Pulsing glow animation
    const glowTimer = setInterval(() => {
      setGlowOpacity(prev => 0.4 + Math.sin(Date.now() / 500) * 0.3);
    }, 50);
    
    // Marker bobbing animation
    const markerTimer = setInterval(() => {
      setMarkerOffset(Math.sin(Date.now() / 300) * 3);
    }, 50);
    
    return () => {
      clearInterval(starTimer);
      clearInterval(glowTimer);
      clearInterval(markerTimer);
    };
  }, [enableAnimations]);
  
  // Calculate fill percentage
  const fillPercentage = Math.min(1, Math.max(0, current / total));
  const fillWidth = fillPercentage * width;
  
  // Rainbow gradient colors for the fill
  const rainbowColors = [
    0xff3333, // Red
    0xff9933, // Orange
    0xffff33, // Yellow
    0x33ff33, // Green
    0x33ffff, // Cyan
    0x3333ff, // Blue
    0xff33ff, // Magenta
  ];
  
  // Draw fun background with textures
  const drawBackground = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      
      // Shadow effect
      g.beginFill(0x000000, 0.1);
      g.drawRoundedRect(-width / 2 + 3, -height / 2 + 3, width, height, height / 2);
      g.endFill();
      
      // Main background
      g.beginFill(backgroundColor);
      g.lineStyle(3, 0x999999, 0.5);
      g.drawRoundedRect(-width / 2, -height / 2, width, height, height / 2);
      g.endFill();
      
      // Fun pattern - dotted texture in background
      if (enableAnimations) {
        g.beginFill(0xffffff, 0.15);
        
        // Add small dots in the background for texture
        const dotSize = 3;
        const dotSpacing = 12;
        const dotsPerRow = Math.floor(width / dotSpacing);
        const dotsPerCol = Math.floor(height / dotSpacing);
        
        for (let i = 0; i < dotsPerRow; i++) {
          for (let j = 0; j < dotsPerCol; j++) {
            const dotX = -width / 2 + (i + 0.5) * dotSpacing;
            const dotY = -height / 2 + (j + 0.5) * dotSpacing;
            g.drawCircle(dotX, dotY, dotSize / 2);
          }
        }
        g.endFill();
      }
    },
    [backgroundColor, width, height, enableAnimations]
  );
  
  // Draw fill bar with gradient or rainbow effect
  const drawFill = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (fillWidth > 0) {
        // For animated version, use rainbow gradient
        if (enableAnimations) {
          // Create a fun gradient or rainbow effect
          const segments = rainbowColors.length;
          const segmentWidth = width / segments;
          
          for (let i = 0; i < segments; i++) {
            const segmentStart = i * segmentWidth;
            const segmentEnd = Math.min((i + 1) * segmentWidth, fillWidth);
            
            if (segmentEnd > segmentStart) {
              g.beginFill(rainbowColors[i], 0.9);
              g.drawRoundedRect(
                -width / 2 + segmentStart, 
                -height / 2, 
                segmentEnd - segmentStart, 
                height,
                i === 0 ? height / 2 : 0, // Only round the left edge on first segment
              );
              g.endFill();
            }
          }
          
          // Add a shine effect on top
          g.beginFill(0xffffff, 0.2);
          g.drawRoundedRect(
            -width / 2,
            -height / 2,
            fillWidth,
            height / 3, // Only top portion for shine
            height / 2
          );
          g.endFill();
        } else {
          // Simple version for when animations are disabled
          g.beginFill(fillColor);
          g.drawRoundedRect(-width / 2, -height / 2, fillWidth, height, height / 2);
          g.endFill();
        }
        
        // Add rounded cap at the end of the progress bar when not complete
        if (fillPercentage < 1 && fillPercentage > 0 && enableAnimations) {
          g.beginFill(rainbowColors[Math.floor(fillPercentage * rainbowColors.length) % rainbowColors.length]);
          g.drawCircle(-width / 2 + fillWidth, 0, height / 2 - 2);
          g.endFill();
          
          // Add a glow effect around the end cap
          g.beginFill(0xffffff, glowOpacity);
          g.drawCircle(-width / 2 + fillWidth, 0, height / 2 + 3);
          g.endFill();
        }
      }
    },
    [fillColor, width, height, fillWidth, fillPercentage, enableAnimations, rainbowColors, glowOpacity]
  );
  
  // Determine text colors and styles
  const shouldUseWhiteText = fillPercentage > 0.4;
  const progressTextColor = shouldUseWhiteText ? 0xffffff : textColor;
  
  return (
    <Container position={[x, y]}>
      {/* Background with texture */}
      <Graphics draw={drawBackground} />
      
      {/* Colorful fill bar */}
      <Graphics draw={drawFill} />
      
      {/* Progress stars to mark segments */}
      {enableAnimations && Array.from({ length: total }).map((_, index) => {
        const starX = -width / 2 + (width / total) * (index + 0.5);
        const isFilled = index < current - 1;
        const isNext = index === current - 1;
        
        return (
          <Container key={index} position={[starX, 0]}>
            {/* Star markers */}
            <Text
              text={isFilled ? "⭐" : "☆"}
              anchor={0.5}
              y={isNext ? markerOffset : 0}
              scale={isNext ? 1.2 : 0.9}
              rotation={isFilled && enableAnimations ? starRotation : 0}
              alpha={isFilled ? 1 : 0.6}
              style={
                new PIXI.TextStyle({
                  fontSize: 16,
                  fill: isFilled ? 0xffdd00 : 0x999999,
                  dropShadow: isFilled,
                  dropShadowDistance: 1,
                  dropShadowAlpha: 0.3,
                })
              }
            />
          </Container>
        );
      })}
      
      {/* Progress text */}
      <Container position={[0, height / 2 + 12]}>
        <Text
          text={`${current} of ${total}`}
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 16,
              fontFamily: 'ABeeZee, Arial, sans-serif',
              fontWeight: 'bold',
              dropShadow: true,
              dropShadowAlpha: 0.4,
              dropShadowDistance: 1,
              dropShadowColor: 0xffffff,
            })
          }
        />
      </Container>
    </Container>
  );
};

export default ProgressIndicator;