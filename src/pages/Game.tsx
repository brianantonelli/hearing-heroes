import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import GameContainer from '../components/game/GameContainer';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: 0 });
  
  // This is just a placeholder until we implement the actual game
  useEffect(() => {
    // Simulate loading game assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    // Calculate the available height for the game canvas
    const headerHeight = 64; // Header height in pixels
    const availableHeight = window.innerHeight - headerHeight;
    setDimensions({ width: window.innerWidth, height: availableHeight });
    
    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - headerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Game header with level info and back button */}
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <button 
          className="text-white hover:underline"
          onClick={() => navigate('/')}
        >
          Back
        </button>
        <div className="text-xl font-bold">Level {state.currentLevel}</div>
        <div className="w-12">{/* Placeholder for balance */}</div>
      </div>
      
      {/* Game canvas */}
      <div className="flex-1 bg-gray-100">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="loading-animation">Loading Game...</div>
          </div>
        ) : (
          <GameContainer 
            width={dimensions.width} 
            height={dimensions.height}
          />
        )}
      </div>
    </div>
  );
};

export default Game;