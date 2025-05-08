import React from 'react';
import { PracticeSession, PracticeResult } from '../../types/metrics';
import { WordPair } from '../../types/wordPairs';

interface ExportButtonProps {
  session?: PracticeSession | null;
  results?: PracticeResult[];
  wordPairs?: Record<string, WordPair>;
  isOverallStats?: boolean;
}

/**
 * Button component that exports session data to CSV format for download
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  session,
  results = [],
  wordPairs = {},
  isOverallStats = false,
}) => {
  const formatContrastType = (contrastType: string): string => {
    return contrastType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()}_${date.toLocaleTimeString().replace(/:/g, '-')}`;
  };

  const formatCSVValue = (value: any): string => {
    // Escape quotes and handle string values with commas
    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return String(value);
  };

  const generateSessionCSV = (): string => {
    if (!session) return '';

    // Generate session summary data
    const sessionSummary = [
      ['Session Information'],
      ['Session ID', session.id],
      ['Start Time', new Date(session.startTime).toLocaleString()],
      ['End Time', session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing'],
      ['Duration (ms)', session.endTime ? session.endTime - session.startTime : 'N/A'],
      ['Difficulty Level', session.difficultyLevel],
      [''],
      ['Performance Summary'],
      ['Total Practices', session.totalPractices],
      ['Correct Practices', session.correctPractices],
      [
        'Accuracy',
        `${((session.correctPractices / (session.totalPractices || 1)) * 100).toFixed(1)}%`,
      ],
      ['Average Response Time (ms)', session.averageResponseTimeMs.toFixed(0)],
      [''],
    ];

    // Generate results data for the table
    let resultRows: string[][] = [];
    if (results.length > 0) {
      resultRows = [
        ['Practice Results'],
        [
          'Word Pair ID',
          'Word 1',
          'Word 2',
          'Target Word',
          'Selected Word',
          'Contrast Type',
          'Difficulty Level',
          'Result',
          'Response Time (ms)',
          'Timestamp',
        ],
        ...results.map(result => {
          const pair = wordPairs[result.wordPairId];
          return [
            result.wordPairId,
            pair ? pair.word1 : 'Unknown',
            pair ? pair.word2 : 'Unknown',
            result.targetWord,
            result.selectedWord,
            formatContrastType(result.contrastType),
            String(result.difficultyLevel),
            result.isCorrect ? 'Correct' : 'Incorrect',
            String(result.responseTimeMs),
            new Date(result.timestamp).toLocaleString(),
          ];
        }),
      ];
    }

    // Combine all CSV sections
    const allRows = [...sessionSummary, ...resultRows];

    // Convert to CSV format
    return allRows.map(row => row.map(formatCSVValue).join(',')).join('\n');
  };

  const exportData = (): void => {
    // Generate filename based on session data
    const filename = session
      ? `session_${session.id.slice(0, 8)}_${formatDate(session.startTime)}.csv`
      : `hearing_heroes_export_${formatDate(Date.now())}.csv`;

    // Generate CSV content
    const csvContent = generateSessionCSV();

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportData}
      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      disabled={!session && !isOverallStats}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export CSV
    </button>
  );
};

export default ExportButton;