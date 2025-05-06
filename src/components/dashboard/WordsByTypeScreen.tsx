import React, { useState, useEffect } from 'react';
import * as wordPairsService from '../../services/wordPairsService';
import { metricsService } from '../../services/metricsService';
import { ContrastType, ContrastTypeInfo, WordPair } from '../../types/wordPairs';
import { ContrastStatistics } from '../../types/metrics';

// Component to show word statistics grouped by contrast type
const WordsByTypeScreen: React.FC = () => {
  const [contrastTypes, setContrastTypes] = useState<ContrastTypeInfo[]>([]);
  const [wordPairsByType, setWordPairsByType] = useState<Record<ContrastType, WordPair[]>>({} as Record<ContrastType, WordPair[]>);
  const [wordStats, setWordStats] = useState<Record<string, { correct: number, total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [expandedType, setExpandedType] = useState<ContrastType | null>(null);
  const [contrastStats, setContrastStats] = useState<ContrastStatistics[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load word pairs data and overall statistics
        const wordPairsData = await wordPairsService.loadWordPairs(true);
        const stats = await metricsService.getOverallStatistics();
        
        // Set contrast types
        setContrastTypes(wordPairsData.contrastTypes);
        
        // Group word pairs by contrast type
        const pairsByType: Record<ContrastType, WordPair[]> = {} as Record<ContrastType, WordPair[]>;
        wordPairsData.wordPairs.forEach(pair => {
          if (!pairsByType[pair.contrastType]) {
            pairsByType[pair.contrastType] = [];
          }
          pairsByType[pair.contrastType].push(pair);
        });
        setWordPairsByType(pairsByType);
        
        // Set contrast stats from overall statistics
        setContrastStats(stats.contrastStatistics);
        
        // Calculate statistics for individual word pairs
        const results = await metricsService.getPracticeResults({});
        
        // Create a map to track stats for each word
        const wordStatsMap: Record<string, { correct: number, total: number }> = {};
        
        results.forEach(result => {
          // Initialize stats for target word if not exists
          if (!wordStatsMap[result.targetWord]) {
            wordStatsMap[result.targetWord] = { correct: 0, total: 0 };
          }
          
          // Only count attempts where this word was the target
          wordStatsMap[result.targetWord].total += 1;
          if (result.isCorrect) {
            wordStatsMap[result.targetWord].correct += 1;
          }
        });
        
        setWordStats(wordStatsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error loading word data:', error);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Toggle expanded state for a contrast type
  const toggleExpandType = (contrastType: ContrastType) => {
    if (expandedType === contrastType) {
      setExpandedType(null);
    } else {
      setExpandedType(contrastType);
    }
  };
  
  // Helper function to calculate accuracy percentage
  const getAccuracyPercentage = (correct: number, total: number): string => {
    if (total === 0) return 'No attempts yet';
    const percentage = (correct / total) * 100;
    return `${percentage.toFixed(1)}%`;
  };
  
  // Helper function to get a color class based on accuracy
  const getColorClass = (correct: number, total: number): string => {
    if (total === 0) return 'text-gray-400';
    const percentage = (correct / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get contrast type stats
  const getContrastTypeStats = (contrastType: ContrastType): ContrastStatistics | undefined => {
    return contrastStats.find(stat => stat.contrastType === contrastType);
  };
  
  // Render function for the component
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Words by Contrast Type</h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {contrastTypes.map((type) => {
            const pairs = wordPairsByType[type.id] || [];
            const stats = getContrastTypeStats(type.id);
            const isExpanded = expandedType === type.id;
            
            return (
              <div key={type.id} className="border rounded-lg overflow-hidden">
                {/* Contrast type header */}
                <div 
                  className={`p-4 cursor-pointer ${isExpanded ? 'bg-blue-50' : 'bg-gray-50'} hover:bg-blue-50 flex justify-between items-center`}
                  onClick={() => toggleExpandType(type.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <div className="text-right">
                    {stats && (
                      <div className="flex flex-col items-end">
                        <span className={getColorClass(stats.correctPractices, stats.totalPractices)}>
                          {getAccuracyPercentage(stats.correctPractices, stats.totalPractices)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {stats.totalPractices} attempts
                        </span>
                      </div>
                    )}
                    <span className="ml-2">{isExpanded ? '▼' : '►'}</span>
                  </div>
                </div>
                
                {/* Expanded content with word pairs */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Word Pair</th>
                          <th className="p-2 text-center">Word 1</th>
                          <th className="p-2 text-center">Word 2</th>
                          <th className="p-2 text-center">Level</th>
                          <th className="p-2 text-center">Images</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pairs.length > 0 ? (
                          pairs.map((pair) => {
                            const word1Stats = wordStats[pair.word1] || { correct: 0, total: 0 };
                            const word2Stats = wordStats[pair.word2] || { correct: 0, total: 0 };
                            
                            return (
                              <tr key={pair.id} className="border-t hover:bg-gray-50">
                                <td className="p-2">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="font-medium">{pair.word1} / {pair.word2}</div>
                                      <div className="text-xs text-gray-500">
                                        {pair.contrastType.replace(/-/g, ' ')}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="text-center">
                                    <div className="font-medium">{pair.word1}</div>
                                    <div className={getColorClass(word1Stats.correct, word1Stats.total)}>
                                      {getAccuracyPercentage(word1Stats.correct, word1Stats.total)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {word1Stats.total > 0 ? `${word1Stats.total} attempts` : 'No data'}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="text-center">
                                    <div className="font-medium">{pair.word2}</div>
                                    <div className={getColorClass(word2Stats.correct, word2Stats.total)}>
                                      {getAccuracyPercentage(word2Stats.correct, word2Stats.total)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {word2Stats.total > 0 ? `${word2Stats.total} attempts` : 'No data'}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    Level {pair.difficultyLevel}
                                  </span>
                                </td>
                                <td className="p-2 text-center text-sm">
                                  <div className="flex justify-center space-x-2">
                                    <div className="text-gray-500">
                                      {pair.image1.replace('.png', '')}
                                    </div>
                                    /
                                    <div className="text-gray-500">
                                      {pair.image2.replace('.png', '')}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">
                              No word pairs found for this contrast type
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WordsByTypeScreen;