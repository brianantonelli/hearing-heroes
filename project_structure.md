# HearingHeroes - Project Structure

```
hearing-heroes/
├── public/                     # Static assets
│   ├── images/                 # Game images
│   │   ├── pairs/              # Consonant pair images
│   │   └── ui/                 # UI elements
│   ├── audio/                  # Audio files
│   │   ├── prompts/            # Word prompts
│   │   └── feedback/           # Feedback sounds
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/             # React components
│   │   ├── game/               # Game-related components
│   │   │   ├── GameCanvas.tsx  # PixiJS main canvas
│   │   │   ├── ImagePair.tsx   # Image pair component
│   │   │   ├── Feedback.tsx    # Feedback animations
│   │   │   └── LevelSelect.tsx # Level selection
│   │   ├── parent/             # Parent dashboard components
│   │   │   ├── Auth.tsx        # Authentication
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── Charts.tsx      # Performance charts
│   │   │   └── Export.tsx      # Export functionality
│   │   └── shared/             # Shared components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudio.ts         # Audio management
│   │   ├── useGameState.ts     # Game state management
│   │   └── useMetrics.ts       # Metrics tracking
│   ├── services/               # Service layer
│   │   ├── db.ts               # IndexedDB interactions
│   │   ├── audio.ts            # Audio service
│   │   └── metrics.ts          # Metrics service
│   ├── models/                 # TypeScript interfaces/types
│   │   ├── game.ts             # Game-related types
│   │   ├── metrics.ts          # Metrics types
│   │   └── content.ts          # Content types
│   ├── data/                   # Game content data
│   │   ├── levels.ts           # Level definitions
│   │   └── wordPairs.ts        # Word pair definitions
│   ├── utils/                  # Utility functions
│   │   ├── animation.ts        # Animation utilities
│   │   └── analytics.ts        # Analytics utilities
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite type declarations
├── index.html                  # HTML entry
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── package.json                # Dependencies
└── README.md                   # Project documentation
```