# Roadwire

Roadwire is an external AI radio companion for driving games.

It runs beside the game and simulates a persistent radio world: CB drivers, broadcasters, channels, memories, events, speech-to-text, LLM dialogue, TTS, radio processing, and audio playback.

The first target package is **Motor Town: Behind The Wheel**, while the core is intended to remain reusable for other driving and trucking games.

## Prototype

This repository currently contains the first visual dashboard prototype based on the Roadwire UI mockup.

The prototype is intentionally static for now. It establishes the application shell, dashboard layout, visual language, and placeholder state before the real backend and desktop wrapper are added.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Project Notes

- `src/` contains the current React/Vite prototype.
- `docs/` contains the product and technical specifications.
- The UI is mocked with sample CB drivers, AI services, broadcaster preview, hotkeys, and radio activity.

## Direction

Likely next steps:

1. Split dashboard panels into reusable components.
2. Add routes for CB Mode, Broadcaster, Worlds, Packages, Audio, Hotkeys, Characters, Studio, and Settings.
3. Define mock data models for packages, worlds, channels, drivers, providers, and hotkeys.
4. Decide whether the desktop shell should be Tauri.
