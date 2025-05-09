import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { metricsService } from '../services/metricsService';
import { OverallStatistics, PracticeSession } from '../types/metrics';

// Import styles to ensure Tailwind classes are included
import '../styles/index.css';

// Dashboard Components
import SessionHistoryTable from '../components/dashboard/SessionHistoryTable';
import SessionDetails from '../components/dashboard/SessionDetails';
import OverallStats from '../components/dashboard/OverallStats';
import ExportButton from '../components/dashboard/ExportButton';
import PreferencesScreen from '../components/dashboard/PreferencesScreen';
import WordsByTypeScreen from '../components/dashboard/WordsByTypeScreen';

// Simple multiplication question for authentication
const ParentAuth: React.FC<{ onAuthenticate: () => void }> = ({ onAuthenticate }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [problem, setProblem] = useState<{ num1: number; num2: number; result: number }>({
    num1: 0,
    num2: 0,
    result: 0,
  });

  // Generate a new random multiplication problem
  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    // Generate numbers between 2-12 for multiplication problems
    // that are appropriate for a parent but not too difficult
    const num1 = Math.floor(Math.random() * 5) + 2; // 2-6
    const num2 = Math.floor(Math.random() * 5) + 2; // 2-6
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
            onChange={e => {
              setAnswer(e.target.value);
              setError(false);
            }}
            className={`p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            placeholder="Enter answer"
            autoFocus
          />

          {error && <p className="text-red-500 text-center">Incorrect answer. Please try again.</p>}

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

// Dashboard view types
type DashboardView = 'overview' | 'sessions' | 'sessionDetails' | 'preferences' | 'wordsByType';

// Parent Dashboard component
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Debug: Check what's actually in the database
        const db = await metricsService.getAllSessions();

        // Try loading the sessions one at a time to identify any issues
        let recentSessions;
        let statistics;

        try {
          recentSessions = await metricsService.getRecentSessions(10);
        } catch (sessionErr) {
          console.error('ParentArea: Failed to load recent sessions:', sessionErr);
          recentSessions = [];
        }

        try {
          statistics = await metricsService.getOverallStatistics();
        } catch (statsErr) {
          console.error('ParentArea: Failed to calculate statistics:', statsErr);
          statistics = null;
        }

        setSessions(recentSessions);
        setOverallStats(statistics);
        setLoading(false);
      } catch (err) {
        console.error('ParentArea: Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentView('sessionDetails');
  };

  const renderContent = () => {
    if (loading && currentView !== 'preferences') {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error && currentView !== 'preferences') {
      return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Progress Summary</h2>
              {overallStats && <ExportButton isOverallStats={true} />}
            </div>

            {overallStats ? (
              <>
                <OverallStats stats={overallStats} />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentView('wordsByType')}
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <span>View detailed word analysis</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">No progress data available yet.</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Sessions</h2>
                <button
                  onClick={() => setCurrentView('sessions')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View All Sessions
                </button>
              </div>

              <SessionHistoryTable
                sessions={sessions.slice(0, 5)}
                onSessionSelect={handleSessionSelect}
              />
            </div>
          </div>
        );

      case 'sessions':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Session History</h2>
              <button
                onClick={() => setCurrentView('overview')}
                className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back to Overview
              </button>
            </div>

            <SessionHistoryTable sessions={sessions} onSessionSelect={handleSessionSelect} />
          </div>
        );

      case 'sessionDetails':
        if (!selectedSessionId) return null;
        return (
          <SessionDetails sessionId={selectedSessionId} onBack={() => setCurrentView('sessions')} />
        );

      case 'preferences':
        return <PreferencesScreen />;

      case 'wordsByType':
        return <WordsByTypeScreen />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">Parent Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exit
        </button>
      </header>

      <div
        className="flex-1 p-6 bg-gray-100 overflow-y-auto"
        style={{ height: 'calc(100vh - 70px)' }}
      >
        <div className="max-w-6xl mx-auto pb-12">
          <nav className="mb-6 sticky top-0 bg-gray-100 z-5 pt-2 pb-1">
            <ul className="flex border-b">
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${
                    currentView === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    setCurrentView('overview');
                  }}
                >
                  Overview
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${
                    currentView === 'sessions' || currentView === 'sessionDetails'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    setCurrentView('sessions');
                  }}
                >
                  Sessions
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${
                    currentView === 'wordsByType'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    setCurrentView('wordsByType');
                  }}
                >
                  Words Analysis
                </button>
              </li>
              <li className="mr-1">
                <button
                  className={`inline-block py-2 px-4 ${
                    currentView === 'preferences'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    setCurrentView('preferences');
                  }}
                >
                  Preferences
                </button>
              </li>
            </ul>
          </nav>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Parent Area main component
const ParentArea: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <ParentAuth onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
};

export default ParentArea;