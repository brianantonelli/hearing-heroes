import React from 'react';
import { PracticeSession } from '../../types/metrics';

interface SessionHistoryTableProps {
  sessions: PracticeSession[];
  onSessionSelect: (sessionId: string) => void;
}

/**
 * A component that renders a table showing session history
 */
const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ 
  sessions, 
  onSessionSelect 
}) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatDuration = (startTime: number, endTime: number | null): string => {
    if (!endTime) return 'Ongoing';
    
    const durationInMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (durationInMinutes < 1) {
      return '< 1 min';
    }
    
    return `${durationInMinutes} min`;
  };
  
  return (
    <div className="w-full overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Session History</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No sessions recorded yet
                </td>
              </tr>
            ) : (
              sessions.map(session => {
                const accuracyPercentage = session.totalPractices > 0
                  ? Math.round((session.correctPractices / session.totalPractices) * 100)
                  : 0;
                
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(session.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.difficultyLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(session.startTime, session.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {accuracyPercentage}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${accuracyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onSessionSelect(session.id)}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistoryTable;