import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// Simple multiplication question for authentication
const ParentAuth: React.FC<{ onAuthenticate: () => void }> = ({ onAuthenticate }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [problem, setProblem] = useState<{ num1: number; num2: number; result: number }>({ num1: 0, num2: 0, result: 0 });
  
  // Generate a new random multiplication problem
  useEffect(() => {
    generateProblem();
  }, []);
  
  const generateProblem = () => {
    // Generate numbers between 2-12 for multiplication problems
    // that are appropriate for a parent but not too difficult
    const num1 = Math.floor(Math.random() * 10) + 2; // 2-11
    const num2 = Math.floor(Math.random() * 10) + 2; // 2-11
    const result = num1 * num2;
    
    setProblem({ num1, num2, result });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if answer is correct
    if (parseInt(answer) === problem.result) {
      onAuthenticate();
    } else {
      setError(true);
      setAnswer('');
      // Generate a new problem after an incorrect answer
      generateProblem();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Parent Area</h2>
        <p className="mb-6 text-center">
          To access the parent dashboard, please answer this question:
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="text-xl text-center font-bold">
            What is {problem.num1} × {problem.num2}?
          </div>
          
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            className={`p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            placeholder="Enter answer"
            autoFocus
          />
          
          {error && (
            <p className="text-red-500 text-center">Incorrect answer. Please try again.</p>
          )}
          
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Parent Dashboard (placeholder for now)
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-full">
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Parent Dashboard</h1>
        <button 
          onClick={() => navigate('/')}
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exit
        </button>
      </header>
      
      <div className="flex-1 p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Progress Summary</h2>
            <p className="text-gray-600">Progress visualization charts will be implemented in the parent dashboard branch.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
            <p className="text-gray-600">Session history will be implemented in the parent dashboard branch.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Settings controls will be implemented in the parent dashboard branch.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parent Area main component
const ParentArea: React.FC = () => {
  const { state } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  if (!isAuthenticated) {
    return <ParentAuth onAuthenticate={() => setIsAuthenticated(true)} />;
  }
  
  return <Dashboard />;
};

export default ParentArea;