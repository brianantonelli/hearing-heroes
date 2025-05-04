import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-white text-center">
      <h1 className="text-5xl text-primary mb-4 md:text-6xl">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page not found</p>
      <button 
        className="bg-primary text-xl text-white py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;