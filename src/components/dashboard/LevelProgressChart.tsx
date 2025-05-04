import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LevelProgressChartProps {
  data: { level: number; accuracy: number }[];
}

/**
 * A component that renders an area chart showing progress across levels
 */
const LevelProgressChart: React.FC<LevelProgressChartProps> = ({ data }) => {
  // Ensure we have data for all levels 1-4 by filling in missing levels with 0
  const filledData = [1, 2, 3, 4].map(level => {
    const existingData = data.find(item => item.level === level);
    return existingData || { level, accuracy: 0 };
  });
  
  // Sort by level to ensure proper ordering
  filledData.sort((a, b) => a.level - b.level);
  
  // Transform the data to a format suitable for recharts
  const chartData = filledData.map(item => ({
    name: `Level ${item.level}`,
    accuracy: Math.round(item.accuracy),
    level: item.level
  }));
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Progress by Level</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorAccuracy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-sm mt-2 text-gray-600">
        <div>Level 1: Easier contrasts</div>
        <div>Level 4: Challenging contrasts</div>
      </div>
    </div>
  );
};

export default LevelProgressChart;