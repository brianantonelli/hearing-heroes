import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../common/Modal';
import { preferencesService } from '../../services/preferencesService';

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Level 1 (Easiest)' },
  { value: 2, label: 'Level 2' },
  { value: 3, label: 'Level 3' },
  { value: 4, label: 'Level 4' },
];

const SESSION_DURATIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
];

const DIFFICULTY_MULTIPLIERS = [
  { value: 0.5, label: 'Slower (0.5x)' },
  { value: 0.75, label: 'Gradual (0.75x)' },
  { value: 1.0, label: 'Standard (1.0x)' },
  { value: 1.25, label: 'Faster (1.25x)' },
  { value: 1.5, label: 'Challenging (1.5x)' },
];

const PreferencesScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle alert visibility
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccessAlertVisible) {
      timer = setTimeout(() => {
        setIsSuccessAlertVisible(false);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccessAlertVisible]);

  // Show success alert
  const showSuccessAlert = (message: string) => {
    setSuccessMessage(message);
    setIsSuccessAlertVisible(true);
  };

  // Handle child name change
  const handleChildNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CHILD_NAME', payload: e.target.value });
  };

  // Handle level change
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LEVEL', payload: parseInt(e.target.value) });
  };

  // Handle session duration change
  const handleSessionDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_MAX_SESSION_MINUTES', payload: parseInt(e.target.value) });
  };

  // Handle difficulty multiplier change
  const handleDifficultyMultiplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_DIFFICULTY_MULTIPLIER', payload: parseFloat(e.target.value) });
  };

  // Handle toggle switches
  const toggleAudio = () => dispatch({ type: 'TOGGLE_AUDIO' });
  const toggleParentAuth = () => dispatch({ type: 'TOGGLE_PARENT_AUTH' });
  const toggleAnimations = () => dispatch({ type: 'TOGGLE_ANIMATIONS' });
  const toggleLevelSelection = () => dispatch({ type: 'TOGGLE_LEVEL_SELECTION' });

  // Handle reset preferences
  const handleResetPreferences = async () => {
    try {
      const resetPrefs = await preferencesService.resetPreferences();

      // Update context with reset preferences
      dispatch({ type: 'SET_CHILD_NAME', payload: resetPrefs.childName });
      dispatch({ type: 'SET_LEVEL', payload: resetPrefs.currentLevel });
      if (state.isAudioEnabled !== resetPrefs.isAudioEnabled) {
        dispatch({ type: 'TOGGLE_AUDIO' });
      }
      dispatch({ type: 'SET_MAX_SESSION_MINUTES', payload: resetPrefs.maxSessionMinutes });
      if (state.requireParentAuth !== resetPrefs.requireParentAuth) {
        dispatch({ type: 'TOGGLE_PARENT_AUTH' });
      }
      if (state.enableAnimations !== resetPrefs.enableAnimations) {
        dispatch({ type: 'TOGGLE_ANIMATIONS' });
      }
      if (state.showLevelSelection !== resetPrefs.showLevelSelection) {
        dispatch({ type: 'TOGGLE_LEVEL_SELECTION' });
      }
      dispatch({ type: 'SET_DIFFICULTY_MULTIPLIER', payload: resetPrefs.difficultyMultiplier });

      setIsResetModalOpen(false);
      showSuccessAlert('Preferences have been reset to defaults');
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  // Handle clear practice data
  const handleClearPracticeData = async () => {
    try {
      await preferencesService.clearPracticeData();
      setIsClearDataModalOpen(false);
      showSuccessAlert('All practice data has been cleared');
    } catch (error) {
      console.error('Error clearing practice data:', error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <h2 className="text-xl font-bold mb-4">Preferences</h2>

      {/* Success alert */}
      {isSuccessAlertVisible && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}

      {/* User Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">User Information</h3>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="childName" className="mb-1 font-medium">
              Child's Name
            </label>
            <input
              id="childName"
              type="text"
              value={state.childName}
              onChange={handleChildNameChange}
              className="border border-gray-300 rounded-md p-2"
              placeholder="Enter child's name"
            />
          </div>
        </div>
      </div>

      {/* Game Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Game Settings</h3>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="currentLevel" className="mb-1 font-medium">
              Default Level
            </label>
            <select
              id="currentLevel"
              value={state.currentLevel}
              onChange={handleLevelChange}
              className="border border-gray-300 rounded-md p-2"
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              The level that will be selected when starting the game
            </p>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sessionDuration" className="mb-1 font-medium">
              Max Session Duration
            </label>
            <select
              id="sessionDuration"
              value={state.maxSessionMinutes}
              onChange={handleSessionDurationChange}
              className="border border-gray-300 rounded-md p-2"
            >
              {SESSION_DURATIONS.map(duration => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              The maximum amount of time for a practice session
            </p>
          </div>

          <div className="flex flex-col">
            <label htmlFor="difficultyMultiplier" className="mb-1 font-medium">
              Difficulty Progression
            </label>
            <select
              id="difficultyMultiplier"
              value={state.difficultyMultiplier}
              onChange={handleDifficultyMultiplierChange}
              className="border border-gray-300 rounded-md p-2"
            >
              {DIFFICULTY_MULTIPLIERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Controls how quickly the difficulty increases during gameplay
            </p>
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">UI Preferences</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Audio</h4>
              <p className="text-sm text-gray-600">Enable sound effects and voice prompts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.isAudioEnabled}
                onChange={toggleAudio}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Animations</h4>
              <p className="text-sm text-gray-600">Enable animations and visual effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.enableAnimations}
                onChange={toggleAnimations}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Level Selection</h4>
              <p className="text-sm text-gray-600">Allow child to select difficulty level (on by default)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.showLevelSelection}
                onChange={toggleLevelSelection}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Security Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Parent Authentication</h4>
              <p className="text-sm text-gray-600">
                Require parent authentication to access parent dashboard
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.requireParentAuth}
                onChange={toggleParentAuth}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Data Management</h3>

        <div className="space-y-4">
          <div className="flex flex-col">
            <button onClick={() => setIsClearDataModalOpen(true)} className="btn-yellow">
              Clear Practice Data
            </button>
            <p className="text-sm text-gray-500 mt-1">
              This will clear all practice sessions and results, but keep your preferences
            </p>
          </div>

          <div className="flex flex-col">
            <button onClick={() => setIsResetModalOpen(true)} className="btn-red">
              Reset All Preferences
            </button>
            <p className="text-sm text-gray-500 mt-1">
              This will reset all preferences to default values
            </p>
          </div>
        </div>
      </div>

      {/* Reset Preferences Modal */}
      <Modal
        title="Reset Preferences"
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetPreferences}
        confirmText="Reset"
        variant="danger"
      >
        <p className="text-gray-700 mb-2">
          Are you sure you want to reset all preferences to their default values?
        </p>
        <p className="text-gray-700">This action cannot be undone.</p>
      </Modal>

      {/* Clear Data Modal */}
      <Modal
        title="Clear Practice Data"
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={handleClearPracticeData}
        confirmText="Clear Data"
        variant="warning"
      >
        <p className="text-gray-700 mb-2">Are you sure you want to clear all practice data?</p>
        <p className="text-gray-700">
          This will delete all practice sessions, results, and progress statistics. Your preferences
          will be kept. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PreferencesScreen;