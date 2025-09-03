# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise equipment visualization webapp that will be built with:
- **React** with Vite as the build tool
- **TypeScript** for type safety
- **PixiJS** (@pixi/react) for 2D graphical representations
- **Material UI** for the user interface

## Data Structure

The application represents an enterprise equipment hierarchy:

```
Regions (AMER, EMEA, APAC)
├── Plants
    ├── Areas
        ├── Locations
            ├── Equipment
                └── Child Equipment
```

### Equipment Attributes
- Can be of types: string, number, boolean, date, datetime, time, enum, object, array
- Can be required or optional
- Can have default values

## Development Setup

Since this is a new project, initialization will require:

```bash
# Initialize Vite project with React and TypeScript
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install pixi.js @pixi/react
npm install @mui/material @emotion/react @emotion/styled
```

## Architecture Guidelines

When implementing features:
1. Use TypeScript interfaces for all data models (Region, Plant, Area, Location, Equipment, Attribute)
2. Keep PixiJS rendering logic separate from React components
3. Use Material UI components for all UI elements outside the canvas
4. Implement proper state management for the equipment hierarchy
5. Ensure interactive features are accessible and performant

## Key Implementation Areas

- **Data Models**: Define TypeScript interfaces in `src/types/`
- **Canvas Rendering**: PixiJS components in `src/components/canvas/`
- **UI Components**: Material UI based components in `src/components/ui/`
- **State Management**: Equipment hierarchy state management
- **Interactivity**: Click, hover, and selection handlers for equipment visualization