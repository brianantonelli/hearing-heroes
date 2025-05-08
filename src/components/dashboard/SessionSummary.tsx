import React from 'react';
import { PracticeSession } from '../../types/metrics';

interface SessionSummaryProps {
  session: PracticeSession;
}

/**
 * Component that displays a summary of a session's metadata and performance statistics
 */
const SessionSummary: React.FC<SessionSummaryProps> = ({ session }) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTime: number, endTime: number | null): string => {
    if (!endTime) return 'Ongoing';

    const durationInMs = endTime - startTime;
    const minutes = Math.floor(durationInMs / (1000 * 60));
    const seconds = Math.floor((durationInMs % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const accuracyPercentage =
    session.totalPractices > 0
      ? Math.round((session.correctPractices / session.totalPractices) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Session Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Start Time:</div>
            <div>{formatDate(session.startTime)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">End Time:</div>
            <div>{session.endTime ? formatDate(session.endTime) : 'Ongoing'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Duration:</div>
            <div>{formatDuration(session.startTime, session.endTime)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Difficulty Level:</div>
            <div>{session.difficultyLevel}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Performance Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Total Practices:</div>
            <div>{session.totalPractices}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Correct Answers:</div>
            <div>{session.correctPractices}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-gray-600">Accuracy:</div>
            <div>{accuracyPercentage}%</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Avg. Response Time:</div>
            <div>{Math.round(session.averageResponseTimeMs / 1000)} seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;