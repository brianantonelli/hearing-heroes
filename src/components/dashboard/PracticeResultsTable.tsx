import React from 'react';
import { PracticeResult } from '../../types/metrics';
import { WordPair } from '../../types/wordPairs';

interface PracticeResultsTableProps {
  results: PracticeResult[];
  wordPairs: Record<string, WordPair>;
}

/**
 * Component that displays a table of practice results
 */
const PracticeResultsTable: React.FC<PracticeResultsTableProps> = ({ 
  results, 
  wordPairs 
}) => {
  // Format contrast type for display
  const formatContrastType = (contrastType: string): string => {
    return contrastType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Word Pair
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Selected
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contrast Type
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Result
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Response Time
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attempt
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-2 py-4 text-center text-gray-500">
                No practice results found
              </td>
            </tr>
          ) : (
            results.map((result, index) => {
              const wordPair = wordPairs[result.wordPairId];
              return (
                <tr key={result.id} className={result.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {wordPair ? `${wordPair.word1}/${wordPair.word2}` : result.wordPairId}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {result.targetWord}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {result.selectedWord}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatContrastType(result.contrastType)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {result.difficultyLevel}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {(result.responseTimeMs / 1000).toFixed(1)}s
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                    {result.isRetry ? 'Retry' : 'First'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PracticeResultsTable;