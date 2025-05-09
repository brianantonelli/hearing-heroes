import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { audioService } from '../services/audioService';
import GameContainer from '../components/game/GameContainer';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: 0 });

  // This is just a placeholder until we implement the actual game
  useEffect(() => {
    // Ensure no music is playing when entering the game page
    audioService.clearBackgroundMusic();
    
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
        height: window.innerHeight - headerHeight,
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
      {/* Kid-friendly game header with level info and back button */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400 text-white p-3 flex justify-between items-center text-3xl relative overflow-hidden">
        {/* Background fun elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {state.enableAnimations && Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white opacity-20"
              style={{
                width: `${10 + Math.random() * 20}px`,
                height: `${10 + Math.random() * 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `ping ${3 + Math.random() * 4}s cubic-bezier(0, 0, 0.2, 1) infinite ${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Home button without bounce */}
        <button 
          className="text-white hover:scale-125 transition-transform z-10 bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center" 
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
        </button>
        
        {/* Level display with fun styling */}
        <div className="text-2xl font-bold flex items-center space-x-2 z-10">
          {state.enableAnimations && <span className="animate-pulse text-yellow-300">⭐</span>}
          <span className="bg-white bg-opacity-20 px-4 py-1 rounded-full border-2 border-white border-opacity-30 shadow-lg">
            Level {state.currentLevel}
          </span>
          {state.enableAnimations && <span className="animate-pulse text-yellow-300">⭐</span>}
        </div>
        
        {/* Empty div to maintain layout */}
        <div className="w-12"></div>
      </div>

      {/* Game canvas */}
      <div className="flex-1 bg-gray-100">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-white">
            <div className="loading-animation">
              <span className="letter">L</span>
              <span className="letter">o</span>
              <span className="letter">a</span>
              <span className="letter">d</span>
              <span className="letter">i</span>
              <span className="letter">n</span>
              <span className="letter">g</span>
              <span className="letter">&nbsp;</span>
              <span className="letter">G</span>
              <span className="letter">a</span>
              <span className="letter">m</span>
              <span className="letter">e</span>
              <span className="letter">!</span>
            </div>
          </div>
        ) : (
          <GameContainer width={dimensions.width} height={dimensions.height} />
        )}
      </div>
    </div>
  );
};

export default Game;