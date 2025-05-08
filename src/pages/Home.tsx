import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackgroundAnimation from '../components/common/BackgroundAnimation';
import Modal from '../components/common/Modal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  
  // Check if this is a first-time visit or if the name is empty
  useEffect(() => {
    // We consider it first time if the child's name is empty
    const isFirstTime = !state.childName || state.childName === '';
    if (isFirstTime) {
      setShowNameModal(true);
      setNameInput('');
    }
  }, [state.childName]);

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleParentArea = () => {
    navigate('/parent');
  };
  
  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      dispatch({ type: 'SET_CHILD_NAME', payload: nameInput.trim() });
      setShowNameModal(false);
    }
    // Don't close modal if name is empty - keep it open until they enter a name
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
        {state.enableAnimations ? (
          <button
            className="bg-primary text-3xl md:text-4xl text-white py-8 px-12 rounded-2xl
            transition-all active:scale-95 shadow-lg flex flex-col items-center gap-2 relative overflow-hidden
            border-4 animate-rainbow-border animate-button-pulse"
            onClick={handleStartGame}
          >
            {/* Button shine effect */}
            <div className="button-shine"></div>
            
            {/* Emoji background effects */}
            <div className="absolute opacity-10 text-5xl -left-5 top-2 rotate-12">🎵</div>
            <div className="absolute opacity-10 text-5xl -right-5 bottom-2 -rotate-12">🎧</div>
            
            {/* Main content */}
            <div className="drop-shadow-lg">
              <span className="text-6xl md:text-7xl mb-2 animate-bounce inline-block">🎮</span>
            </div>
            <span className="font-bold drop-shadow-md tracking-wider">PLAY!</span>
            
            {/* Fun decorative elements */}
            <div className="absolute -right-3 -top-3 text-2xl animate-ping">✨</div>
            <div className="absolute -left-3 -top-3 text-2xl animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
          </button>
        ) : (
          <button
            className="bg-primary text-3xl md:text-4xl text-white py-8 px-12 rounded-2xl
            transition-all active:scale-95 shadow-lg flex flex-col items-center gap-2 relative overflow-hidden"
            onClick={handleStartGame}
          >
            <span className="text-6xl md:text-7xl mb-2">🎮</span>
            <span>Play</span>
          </button>
        )}
      </div>

      <footer className="mt-8 w-full flex justify-end items-center px-2 relative z-10">
        {state.enableAnimations ? (
          <button 
            className="text-4xl active:rotate-45 transition-transform duration-300 active:scale-110 filter drop-shadow-md" 
            onClick={handleParentArea} 
            aria-label="Parent Area"
          >
            ⚙️
          </button>
        ) : (
          <button 
            className="text-4xl active:rotate-12 transition-transform" 
            onClick={handleParentArea} 
            aria-label="Parent Area"
          >
            ⚙️
          </button>
        )}
      </footer>
      
      {/* Child Name Modal */}
      <Modal
        title="Welcome to Hearing Heroes!"
        isOpen={showNameModal}
        onClose={() => {/* Prevent closing without entering a name */}}
        onConfirm={handleNameSubmit}
        confirmText="Let's Play!"
        variant="info"
      >
        <div className="space-y-4">
          <div className="relative">
            <p className="text-xl font-bold">What's your name?</p>
            {state.enableAnimations && (
              <>
                <div className="absolute -top-6 -left-4 text-lg animate-float" style={{ animationDuration: '3s' }}>🎵</div>
                <div className="absolute -top-4 -right-4 text-lg animate-float" style={{ animationDuration: '4s' }}>🎧</div>
              </>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className={`border-2 ${nameInput ? 'border-green-400' : 'border-gray-300'} rounded-lg px-4 py-3 text-xl 
                w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameSubmit();
                }
              }}
            />
            {state.enableAnimations && nameInput && (
              <div className="absolute right-3 top-3 text-xl animate-bounce">✓</div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <span className="text-6xl animate-bounce inline-block">{nameInput ? '😃' : '👋'}</span>
              {state.enableAnimations && (
                <div className="absolute -right-6 -top-6 text-2xl animate-ping opacity-70" style={{ animationDuration: '1s' }}>✨</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;