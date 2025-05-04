# Technical Specification: Samantha's Speech Discrimination Game

## Overview
An iPad-based game to help Samantha practice consonant manner contrasts for speech discrimination, following her cochlear implant. The game will include a parents section with progress tracking and visualization.

## Technology Stack

### Core Technologies
- **Language**: TypeScript
- **Framework**: React + PixiJS (via react-pixi)
- **Build Tool**: Vite
- **Storage**: IndexedDB for progression data
- **Data Visualization**: recharts library

### Application Architecture
1. **Core Components**:
   - Game engine (PixiJS)
   - Audio management system
   - Data storage/retrieval layer (IndexedDB)
   - Analytics/metrics tracking

2. **Game Features**:
   - Level progression system
   - Consonant pair configuration
   - Scoring/feedback mechanisms
   - Visual reward system

3. **Parent Dashboard**:
   - Authentication (basic multiplication question, e.g., "What's 2x8?")
   - Performance metrics visualization
   - Session history
   - Exportable reports for SLP sharing

### Device Support
- **Target Device**: iPad (various models)
- **Orientation**: Support for both portrait and landscape
- **Offline Support**: Full offline functionality via PWA

## Game Design

### Core Gameplay
- Audio prompts with image pairs (e.g., cave/wave)
- Touch interaction for selection
- Immediate visual/audio feedback
- Progressive difficulty levels

### Level Progression
1. **Level 1**: Basic high-contrast consonants (p/b, t/d)
2. **Level 2**: More challenging contrasts (f/v, s/z)
3. **Level 3**: Multi-syllable words or phrases
4. **Level 4**: Words in simple sentences

### Metrics Tracking
- Accuracy percentage
- Response time
- Progress across specific contrast types
- Session duration and frequency

## Technical Implementation

### Offline Capabilities
- Service worker for offline access
- Local asset caching
- IndexedDB for data persistence

### User Interface
- Touch-optimized controls
- Large, clear visuals
- Child-friendly interface for game section
- Data-focused interface for parent section

### Data Management
- Local storage of all game data
- Export functionality for sharing with SLP
- No cloud synchronization required

## Development Phases & Git Strategy

For documentation and to assist other developers in understanding the development process, each major feature will be developed in a dedicated Git branch. This will enable a clear progression through the project and make it easier for others to follow the tutorial.

### Phase 1: Project Setup (branch: `setup`)
- Initialize React + TypeScript + Vite project
- Set up PixiJS integration
- Implement basic project structure
- Create deployment pipeline

### Phase 2: Core Game Mechanics (branch: `game-mechanics`)
- Implement audio system
- Create basic image-pair interaction
- Build scoring and feedback system
- Develop level progression framework

### Phase 3: Content & Progression (branch: `content-progression`)
- Add consonant contrast pairs with audio and images
- Implement difficulty levels
- Create reward system
- Build metrics collection

### Phase 4: Parent Dashboard (branch: `parent-dashboard`)
- Create protected parent section
- Implement data visualization
- Add export functionality
- Build session history view

### Phase 5: Testing & Refinement (branch: `refinement`)
- Test on iPad devices
- Optimize performance
- Ensure offline functionality
- Polish user experience

### Git Workflow:
1. Create a new branch for each major development phase
2. Work on features within that branch
3. When the phase is complete, merge to main with a pull request
4. Tag each completed phase for easy reference in the tutorial
5. This approach will allow others to check out specific stages of development when following along with the article