import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import GameButton from '../ui/GameButton';

interface LevelSelectScreenProps {
  onLevelSelect: (level: number) => void;
  width?: number;
  height?: number;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ 
  onLevelSelect, 
  width = 800, // Default width
  height = 600 // Default height
}) => {
  const { state } = useAppContext();
  const { childName } = state;
  
  // Define levels with their descriptions
  const levels = [
    { number: 1, name: 'Level 1', description: 'Beginning' },
    { number: 2, name: 'Level 2', description: 'Easy' },
    { number: 3, name: 'Level 3', description: 'Medium' },
    { number: 4, name: 'Level 4', description: 'Hard' },
    { number: 5, name: 'Level 5', description: 'Expert' }
  ];
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Hello, {childName}!
        </h1>
        <p className="text-xl">
          Choose a level to start playing:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl">
        {levels.map((level) => (
          <button
            key={level.number}
            onClick={() => onLevelSelect(level.number)}
            className={`
              flex flex-col items-center justify-center
              bg-white border-4 border-primary rounded-lg
              py-6 px-8 shadow-lg hover:shadow-xl
              transform transition-transform hover:scale-105
              ${level.number === state.currentLevel ? 'bg-blue-100 border-blue-600' : ''}
            `}
          >
            <span className="text-2xl font-bold text-primary mb-2">
              {level.name}
            </span>
            <span className="text-lg text-gray-600">
              {level.description}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-12">
        <GameButton
          onClick={() => onLevelSelect(state.currentLevel)}
          text={`Start with Level ${state.currentLevel}`}
          x={width / 2}
          y={0}
          width={300}
          fontSize={24}
        />
      </div>
    </div>
  );
};

export default LevelSelectScreen;