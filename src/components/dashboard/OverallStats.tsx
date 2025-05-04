import React from 'react';
import { OverallStatistics } from '../../types/metrics';
import ProgressChart from './ProgressChart';
import LevelProgressChart from './LevelProgressChart';

interface OverallStatsProps {
  stats: OverallStatistics;
}

/**
 * Component that displays overall statistics and charts
 */
const OverallStats: React.FC<OverallStatsProps> = ({ stats }) => {
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">Total Sessions</h3>
          <p className="text-2xl font-semibold">{stats.totalSessions}</p>
          <p className="text-sm text-gray-500">Last session: {formatDate(stats.lastSessionTimestamp)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">Total Practices</h3>
          <p className="text-2xl font-semibold">{stats.totalPractices}</p>
          <p className="text-sm text-gray-500">
            {stats.correctPractices} correct ({stats.accuracyPercentage.toFixed(1)}%)
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">Retry Success</h3>
          <p className="text-2xl font-semibold">{stats.retrySuccessRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">
            {stats.successfulRetries} of {stats.totalRetries} retries
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider">Avg. Response Time</h3>
          <p className="text-2xl font-semibold">{(stats.averageResponseTimeMs / 1000).toFixed(2)}s</p>
          <p className="text-sm text-gray-500">Across all attempts</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <ProgressChart 
            data={stats.contrastStatistics} 
            chartTitle="Performance by Contrast Type" 
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <LevelProgressChart 
            data={stats.progressByLevel} 
          />
        </div>
      </div>
    </div>
  );
};

export default OverallStats;