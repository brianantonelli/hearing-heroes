import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface BackgroundAnimationProps {
  className?: string;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ className = '' }) => {
  const { state } = useAppContext();

  // Skip rendering animations if user has disabled them
  if (!state.enableAnimations) {
    return null;
  }
  
  // Generate floating shapes with different colors and sizes
  const shapes = Array.from({ length: 15 }, (_, index) => {
    // Random shape properties
    const isCircle = Math.random() > 0.5;
    const size = 10 + Math.floor(Math.random() * 30);
    
    // Random colors - use kid-friendly colors
    const colors = [
      'bg-blue-400', 'bg-green-400', 'bg-yellow-300',
      'bg-pink-400', 'bg-purple-400', 'bg-indigo-400'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random position - distribute shapes across the screen instead of starting from bottom
    const left = Math.random() * 100;
    const top = 20 + Math.random() * 60; // Start shapes within the visible area (20%-80% from top)
    
    // Random animation duration (between 8-15s - faster than before)
    const duration = 8 + Math.floor(Math.random() * 7);
    
    // Very short delay before animation starts (0-2s)
    const delay = Math.random() * 2;
    
    // Different opacity for visual interest
    const opacity = 0.2 + Math.random() * 0.3;
    
    return {
      id: index,
      isCircle,
      size,
      color,
      left,
      top,
      duration,
      delay,
      opacity
    };
  });

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute ${shape.color} animate-float ${shape.isCircle ? 'rounded-full' : 'rounded-md'}`}
          style={{
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            opacity: shape.opacity,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundAnimation;