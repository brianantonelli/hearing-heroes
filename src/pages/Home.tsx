import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackgroundAnimation from '../components/common/BackgroundAnimation';

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
    <div className="flex flex-col items-center justify-between h-full w-full p-8 bg-gradient-to-b from-white to-blue-50 text-center overflow-hidden relative">
      {/* Background animations */}
      <BackgroundAnimation />
      
      {/* Floating sound waves */}
      <div className="absolute w-full h-full overflow-hidden pointer-events-none z-0">
        {state.enableAnimations && Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full border-2 border-primary opacity-20"
            style={{
              width: `${100 + i * 40}px`,
              height: `${100 + i * 40}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${7 + i * 2}s`,
              animation: `ping ${7 + i}s cubic-bezier(0, 0, 0.2, 1) infinite ${i}s`
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center mt-8 relative z-10">
        <div className="flex items-center justify-center w-full mb-4">
          {state.enableAnimations ? (
            <>
              <img src="/images/ha.png" alt="Hearing Aid" className="h-16 md:h-20 mr-6 animate-rock-left" />
              <h1 className="text-5xl text-primary md:text-6xl animate-pulse">Hearing Heroes</h1>
              <img src="/images/ci.png" alt="Cochlear Implant" className="h-16 md:h-20 ml-6 animate-rock-right" />
            </>
          ) : (
            <>
              <img src="/images/ha.png" alt="Hearing Aid" className="h-16 md:h-20 mr-6" />
              <h1 className="text-5xl text-primary md:text-6xl">Hearing Heroes</h1>
              <img src="/images/ci.png" alt="Cochlear Implant" className="h-16 md:h-20 ml-6" />
            </>
          )}
        </div>
        <p className="text-2xl text-gray-600 mb-8 md:text-3xl">
          Speech discrimination practice for {state.childName}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full relative z-10">
        <button
          className="bg-primary text-3xl md:text-4xl text-white py-8 px-12 rounded-2xl hover:bg-blue-600 transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-2 relative overflow-hidden group"
          onClick={handleStartGame}
        >
          {/* Button shine effect */}
          {state.enableAnimations && (
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute top-0 left-0 w-1/3 h-full bg-white opacity-20 skew-x-12 transform -translate-x-full group-hover:animate-shine"></div>
            </div>
          )}
          <span className="text-6xl md:text-7xl mb-2 animate-bounce">🎮</span>
          <span>Play</span>
        </button>
      </div>

      <footer className="mt-8 w-full flex justify-between items-center px-2 relative z-10">
        <div className="sound-toggle">{/* Sound toggle button will go here */}</div>
        <button 
          className="text-4xl hover:rotate-12 transition-transform" 
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