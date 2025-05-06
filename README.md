# HearingHeroes

Interactive speech discrimination game for children with hearing impairments, particularly those with cochlear implants.

## Project Overview

HearingHeroes is designed to help children practice consonant manner contrasts through engaging audio-visual exercises. The game focuses on speech discrimination with a progressive difficulty system and detailed progress tracking for parents and speech language pathologists (SLPs).

### Key Features

- 🎮 Interactive audio-visual exercises with image pairs
- 📊 Comprehensive progress tracking and visualization
- 📱 Designed specifically for iPad use
- 🔒 Protected parent/SLP dashboard with metrics
- 📶 Full offline functionality as a PWA

## Technology Stack

- TypeScript
- React
- PixiJS for animations
- Vite for building
- IndexedDB for local data storage
- Tailwind CSS for styling
- Jest and React Testing Library for testing

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hearing-heroes

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage reports

## Game Structure

### Level Progression

1. **Level 1**: Basic high-contrast consonants (p/b, t/d)
2. **Level 2**: More challenging contrasts (f/v, s/z)
3. **Level 3**: Multi-syllable words or phrases
4. **Level 4**: Words in simple sentences

### Metrics Tracked

- Accuracy percentage
- Response time
- Progress across specific contrast types
- Retry counts and success rates
- Session duration and frequency

## Development

### Branch Strategy

- `setup` - Project initialization
- `game-mechanics` - Core gameplay functionality
- `content-progression` - Game content and progression system
- `parent-dashboard` - Parent/SLP metrics dashboard
- `refinement` - Testing and optimization

### Project Structure

```
hearing-heroes/
├── public/               # Static assets (images, audio files)
├── src/
│   ├── components/       # React components
│   │   ├── common/       # Shared UI components
│   │   ├── dashboard/    # Parent dashboard components
│   │   ├── game/         # Game components
│   ├── context/          # React context providers
│   ├── data/             # Game data and content
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Main page components
│   ├── services/         # Core services (audio, data storage)
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── [configuration files]
```

## License

MIT License