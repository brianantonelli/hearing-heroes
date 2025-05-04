# CLAUDE.md - HearingHeroes Project Guide

## Project Overview
HearingHeroes is a speech discrimination game designed for children with hearing impairments, particularly those with cochlear implants. The game focuses on consonant manner contrasts through interactive audio-visual exercises.

## Technical Stack
- TypeScript
- React + PixiJS
- Vite for building
- IndexedDB for data storage
- PWA for offline functionality on iPad

## Commands to Run
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Important Project Areas
1. **Game Mechanics**: Audio prompts with image pairs (e.g., cave/wave)
2. **Progress Tracking**: Metrics stored in IndexedDB
3. **Parent Dashboard**: Protected area with visualizations
4. **Level Progression**: Multiple difficulty levels for consonant contrasts

## Git Branching Strategy
For documenting development progress and enabling others to follow along with the tutorial:

1. Development Phases and Branches:
   - Phase 1: Project Setup - `setup` branch
   - Phase 2: Core Game Mechanics - `game-mechanics` branch  
   - Phase 3: Content & Progression - `content-progression` branch
   - Phase 4: Parent Dashboard - `parent-dashboard` branch
   - Phase 5: Testing & Refinement - `refinement` branch

2. Commands for Branch Management:
   - Start new phase: `git checkout -b <branch-name>`
   - Commit changes: `git add . && git commit -m "Description of changes"`
   - Merge to main: `git checkout main && git merge <branch-name>`
   - Tag release: `git tag -a v<version> -m "Phase X complete"`

3. Pull Request Process:
   - Each phase should be completed with a PR to main
   - PRs should include a summary of changes and testing performed

## Testing Focus
- Ensure audio works correctly on iPad
- Verify touch controls are responsive
- Test offline functionality
- Validate data persistence

## Project References
- Technical specification: `/technical_specification.md`
- Project structure: `/project_structure.md`
- Development phases and git strategy: Technical specification's "Development Phases & Git Strategy" section