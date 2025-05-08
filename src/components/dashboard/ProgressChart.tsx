import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ContrastStatistics } from '../../types/metrics';

interface ProgressChartProps {
  data: ContrastStatistics[];
  chartTitle: string;
}

/**
 * A component that renders a bar chart showing progress metrics
 */
const ProgressChart: React.FC<ProgressChartProps> = ({ data, chartTitle }) => {
  // Transform the contrast statistics data to a format suitable for recharts
  const chartData = data.map(stat => {
    // Format the contrast type label to be more readable
    const label = stat.contrastType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      name: label,
      accuracy: Math.round(stat.accuracyPercentage),
    };
  });

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{chartTitle}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip />
            <Legend />
            <Bar name="Accuracy %" dataKey="accuracy" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;