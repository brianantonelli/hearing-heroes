import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleParentArea = () => {
    navigate('/parent');
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-8 bg-white text-center">
      <div className="flex flex-col items-center justify-center mt-8">
        <h1 className="text-5xl text-primary mb-4 md:text-6xl">👂 Hearing Heroes 👂</h1>
        <p className="text-2xl text-gray-600 mb-8 md:text-3xl">
          Speech discrimination practice for {state.childName}
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-xs md:max-w-md">
        <button
          className="bg-primary text-2xl text-white py-4 px-8 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={handleStartGame}
        >
          Start Game
        </button>
        <button
          className="bg-secondary text-xl text-gray-800 py-3 px-8 rounded-lg hover:bg-green-400 transition-colors"
          onClick={handleParentArea}
        >
          Parent Area
        </button>
      </div>

      <footer className="mt-8 w-full flex justify-end">
        <div className="sound-toggle">{/* Sound toggle button will go here */}</div>
      </footer>
    </div>
  );
};

export default Home;