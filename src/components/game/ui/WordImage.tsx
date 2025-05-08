import React, { useEffect, useState } from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface WordImageProps {
  imagePath: string;
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive: boolean;
  onSelect: () => void;
  isSelected?: boolean;
  isCorrect?: boolean | null;
}

/**
 * Component for displaying a word image in the game
 * Handles image loading, display, and selection state
 */
const WordImage: React.FC<WordImageProps> = ({
  imagePath,
  word,
  x,
  y,
  width,
  height,
  interactive,
  onSelect,
  isSelected,
  isCorrect,
}) => {
  const [texture, setTexture] = useState<PIXI.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Load the image
    setIsLoading(true);
    setLoadError(false);

    PIXI.Assets.load(imagePath)
      .then(texture => {
        setTexture(texture);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(`Failed to load image: ${imagePath}`, error);
        setIsLoading(false);
        setLoadError(true);
      });
  }, [imagePath]);

  if (isLoading) {
    // Show loading spinner
    return (
      <Container position={[x, y]}>
        <Text
          text="Loading..."
          anchor={0.5}
          style={
            new PIXI.TextStyle({
              fill: 0x333333,
              fontSize: 16,
            })
          }
        />
      </Container>
    );
  }

  if (loadError || !texture) {
    // Show error message
    return (
      <Container position={[x, y]}>
        <Text
          text="⚠️"
          anchor={0.5}
          y={-15}
          style={
            new PIXI.TextStyle({
              fontSize: 32,
            })
          }
        />
        <Text
          text="Image Error"
          anchor={0.5}
          y={15}
          style={
            new PIXI.TextStyle({
              fill: 0xcc2222,
              fontSize: 14,
            })
          }
        />
      </Container>
    );
  }

  return (
    <Container
      position={[x, y]}
      interactive={interactive}
      cursor={interactive ? 'pointer' : 'default'}
      pointerdown={interactive ? onSelect : undefined}
    >
      {/* Image */}
      <Sprite
        texture={texture}
        anchor={0.5}
        width={width}
        height={height}
        alpha={isSelected ? 0.7 : 1}
      />

      {/* Feedback overlay (check mark or X) */}
      {isSelected && isCorrect !== null && (
        <Container position={[0, 0]}>
          <Text
            text={isCorrect ? '✓' : '✗'}
            anchor={0.5}
            style={
              new PIXI.TextStyle({
                fill: isCorrect ? 0x22cc22 : 0xcc2222,
                fontSize: 64,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowAlpha: 0.5,
                dropShadowDistance: 2,
              })
            }
          />
        </Container>
      )}
      <Text
        text={word}
        anchor={0.5}
        y={height / 2 + 30} // Adjusted to position below the image
        style={
          new PIXI.TextStyle({
            fill: 0x333333,
            fontSize: 30,
            wordWrap: true,
            wordWrapWidth: width - 20, // Adjusted for better word wrapping
          })
        }
      />
    </Container>
  );
};

export default WordImage;