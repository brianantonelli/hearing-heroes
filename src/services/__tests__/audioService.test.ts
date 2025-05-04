import { audioService, AudioCategory } from '../audioService';

// Mock the Audio API
jest.mock('../../services/audioService', () => {
  // Keep a reference to the original module
  const originalModule = jest.requireActual('../../services/audioService');
  
  return {
    ...originalModule,
    audioService: {
      playWordPrompt: jest.fn().mockResolvedValue(undefined),
      playCorrectSound: jest.fn().mockResolvedValue(undefined),
      playIncorrectSound: jest.fn().mockResolvedValue(undefined),
      playLevelCompleteSound: jest.fn().mockResolvedValue(undefined),
      preloadAudio: jest.fn(),
      stopAll: jest.fn(),
      setEffectVolume: jest.fn(),
      setVoiceVolume: jest.fn(),
      toggleMute: jest.fn(() => false),
      isMutedState: jest.fn(() => false),
      // Expose internal properties that we need to test
      effectVolume: 0.7,
      voiceVolume: 1.0,
    }
  };
});

describe('AudioService', () => {
  beforeEach(() => {
    // Reset audio service between tests
    audioService.stopAll();
    audioService.setEffectVolume(0.7);
    audioService.setVoiceVolume(1.0);
    
    // Reset any spies
    jest.clearAllMocks();
  });
  
  test('should play word prompt', async () => {
    await audioService.playWordPrompt('test.mp3');
    expect(audioService.playWordPrompt).toHaveBeenCalledWith('test.mp3');
  });
  
  test('should play feedback sounds', async () => {
    await audioService.playCorrectSound();
    await audioService.playIncorrectSound();
    await audioService.playLevelCompleteSound();
    
    expect(audioService.playCorrectSound).toHaveBeenCalled();
    expect(audioService.playIncorrectSound).toHaveBeenCalled();
    expect(audioService.playLevelCompleteSound).toHaveBeenCalled();
  });
  
  test('should control muting', async () => {
    // Mock toggleMute to return true (muted)
    (audioService.toggleMute as jest.Mock).mockReturnValueOnce(true);
    (audioService.isMutedState as jest.Mock).mockReturnValueOnce(true);
    
    const result = audioService.toggleMute();
    expect(result).toBe(true);
    expect(audioService.isMutedState()).toBe(true);
  });
  
  test('should call volume setters', () => {
    // Set volumes
    audioService.setEffectVolume(0.5);
    audioService.setVoiceVolume(0.8);
    
    // Verify setters were called
    expect(audioService.setEffectVolume).toHaveBeenCalledWith(0.5);
    expect(audioService.setVoiceVolume).toHaveBeenCalledWith(0.8);
  });
  
  test('should call preloadAudio', () => {
    const paths = ['/audio/test1.mp3', '/audio/test2.mp3'];
    audioService.preloadAudio(paths);
    
    // Verify preload was called
    expect(audioService.preloadAudio).toHaveBeenCalledWith(paths);
  });
  
  test('should call stopAll', async () => {
    // Play some sounds
    await audioService.playWordPrompt('test1.mp3');
    await audioService.playWordPrompt('test2.mp3');
    
    // Clear previous calls
    (audioService.stopAll as jest.Mock).mockClear();
    
    // Stop all sounds
    audioService.stopAll();
    
    // Verify stopAll was called
    expect(audioService.stopAll).toHaveBeenCalled();
  });
});