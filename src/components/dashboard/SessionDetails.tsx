import React, { useEffect, useState } from 'react';
import { PracticeSession, PracticeResult } from '../../types/metrics';
import { metricsService } from '../../services/metricsService';
import { getWordPairById } from '../../services/wordPairsService';
import { WordPair } from '../../types/wordPairs';
import SessionSummary from './SessionSummary';
import PracticeResultsTable from './PracticeResultsTable';

interface SessionDetailsProps {
  sessionId: string;
  onBack: () => void;
}

/**
 * Component that loads and displays detailed information about a specific practice session
 */
const SessionDetails: React.FC<SessionDetailsProps> = ({ sessionId, onBack }) => {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [wordPairs, setWordPairs] = useState<Record<string, WordPair>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionDetails() {
      try {
        setLoading(true);

        // Load session data
        const sessionData = await metricsService.getPracticeSession(sessionId);

        if (!sessionData) {
          console.error('SessionDetails: Session not found with ID:', sessionId);
          throw new Error('Session not found');
        }
        setSession(sessionData);

        // Load practice results
        const practiceResults = await metricsService.getPracticeResults({ sessionId });
        setResults(practiceResults);

        // Load word pair details
        const wordPairMap: Record<string, WordPair> = {};

        // Load each word pair used in this session
        const uniquePairIds = Array.from(new Set(practiceResults.map(r => r.wordPairId)));

        for (const pairId of uniquePairIds) {
          const pair = await getWordPairById(pairId);
          if (pair) {
            wordPairMap[pairId] = pair;
          } else {
            console.warn('SessionDetails: Word pair not found for ID:', pairId);
          }
        }

        setWordPairs(wordPairMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to load session details');
        setLoading(false);
        console.error('SessionDetails: Error loading session details:', err);
      }
    }

    loadSessionDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Loading session details...</h2>
          <button onClick={onBack} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">
            Back to Sessions
          </button>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Error</h2>
          <button onClick={onBack} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">
            Back to Sessions
          </button>
        </div>
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error || 'Failed to load session details'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Session Details</h2>
        <button onClick={onBack} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">
          Back to Sessions
        </button>
      </div>

      <div className="mb-8">
        <SessionSummary session={session} />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Practice Details</h3>
        <PracticeResultsTable results={results} wordPairs={wordPairs} />
      </div>
    </div>
  );
};

export default SessionDetails;