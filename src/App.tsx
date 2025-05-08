import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Type definition for Screen Orientation API
interface ScreenOrientation {
  lock(orientation: 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary'): Promise<void>;
  unlock(): void;
  type: string;
  angle: number;
  onchange: ((this: ScreenOrientation, ev: Event) => any) | null;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  dispatchEvent(event: Event): boolean;
}

interface ScreenWithOrientation extends Screen {
  orientation?: ScreenOrientation;
}

const App: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIOS(isIOSDevice);
    
    if (isIOSDevice) {
      // Add iOS class to body
      document.body.classList.add('ios-device');
      
      // Try to lock to landscape if API is available
      try {
        const screenWithOrientation = window.screen as ScreenWithOrientation;
        if (screenWithOrientation.orientation) {
          screenWithOrientation.orientation.lock('landscape-primary')
            .catch(error => {
              console.warn('Could not lock screen to landscape:', error);
              // Fall back to orientation change detection
              checkOrientation();
            });
        } else {
          // Orientation API not available, use fallback
          checkOrientation();
        }
      } catch (error) {
        console.warn('Error with screen orientation API:', error);
        // Fall back to orientation change detection
        checkOrientation();
      }
      
      // Listen for orientation changes
      window.addEventListener('orientationchange', checkOrientation);
      
      // Cleanup
      return () => {
        window.removeEventListener('orientationchange', checkOrientation);
      };
    }
  }, []);
  
  // Check and handle device orientation
  const checkOrientation = () => {
    // Use window.orientation for iOS (deprecated but works better on iOS)
    // Need to use type assertion for TypeScript
    const windowWithOrientation = window as unknown as { orientation: number };
    const isLandscape = windowWithOrientation.orientation === 90 || windowWithOrientation.orientation === -90;
    
    // Alternative method if window.orientation is not available
    if (typeof windowWithOrientation.orientation === 'undefined') {
      // Use matchMedia as a fallback
      const mql = window.matchMedia('(orientation: landscape)');
      if (!mql.matches) {
        // Show rotation message for portrait orientation
        document.body.classList.add('portrait');
      } else {
        document.body.classList.remove('portrait');
      }
    } else if (!isLandscape) {
      // Wait for orientation change animation to complete
      setTimeout(() => {
        document.body.classList.add('portrait');
      }, 50);
    } else {
      document.body.classList.remove('portrait');
    }
  };

  return (
    <AppProvider>
      <div className="orientation-message">
        <div className="flex flex-col items-center space-y-6 text-center bg-blue-50 p-8 rounded-xl shadow-lg max-w-md mx-auto border-4 border-blue-300">
          {/* Device rotate icon with animation */}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#4287f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-90">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#4287f5" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <path d="M2 12C2 6.48 6.48 2 12 2c2.76 0 5.26 1.12 7.07 2.93L16 8h6V2l-2.43 2.43C17.34 2.21 14.82 1 12 1 5.93 1 1 5.93 1 12h1zm20 0c0 5.52-4.48 10-10 10-2.76 0-5.26-1.12-7.07-2.93L8 16H2v6l2.43-2.43C6.66 21.79 9.18 23 12 23c6.07 0 11-4.93 11-11h-1z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-blue-700">Hearing Heroes</h1>
          <h2 className="text-xl font-bold text-blue-600">Please Rotate Your Device</h2>
          
          <div className="space-y-3">
            <p className="text-lg text-blue-800">Hearing Heroes works best in landscape mode.</p>
            <p className="text-md text-blue-600">Please rotate your device sideways to continue playing.</p>
          </div>
          
          <div className="mt-4 transform rotate-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4287f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full w-full">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  );
};

export default App;