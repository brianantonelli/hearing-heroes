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
        <div className="flex items-center justify-center w-full mb-4">
          <img src="/images/ha.png" alt="Hearing Aid" className="h-16 md:h-20 mr-6" />
          <h1 className="text-5xl text-primary md:text-6xl">Hearing Heroes</h1>
          <img src="/images/ci.png" alt="Cochlear Implant" className="h-16 md:h-20 ml-6" />
        </div>
        <p className="text-2xl text-gray-600 mb-8 md:text-3xl">
          Speech discrimination practice for {state.childName}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <button
          className="bg-primary text-3xl md:text-4xl text-white py-8 px-12 rounded-2xl hover:bg-blue-600 transition-colors shadow-lg flex flex-col items-center gap-2"
          onClick={handleStartGame}
        >
          <span className="text-6xl md:text-7xl mb-2">🎮</span>
          <span>Play</span>
        </button>
      </div>

      <footer className="mt-8 w-full flex justify-between items-center px-2">
        <div className="sound-toggle">{/* Sound toggle button will go here */}</div>
        <button
          className="bg-gray-200 p-4 rounded-full hover:bg-gray-300 transition-colors text-2xl shadow"
          onClick={handleParentArea}
          aria-label="Parent Area"
        >
          ⚙️
        </button>
      </footer>
    </div>
  );
};

export default Home;