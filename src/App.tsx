import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-full w-full">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  );
};

export default App;