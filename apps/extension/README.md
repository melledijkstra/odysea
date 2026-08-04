# Mizu

## Overview

Mizu is a personal homepage extension that enhances your new tab page with a variety of productivity tools. It is designed to help you stay organized and efficient by providing quick access to essential features right from your browser's new tab.

![Impression of extension](./docs/current-newtab.png)

## Features

- **Unplash Images**: Beautiful background images from Unsplash.
- **Modules**: Enable and disable different modules from the settings page only when you need it!
- **Spotify Web Player**: Able to play Spotify from the newtab (requires premium)
- **Weather Widget**: Displays current weather conditions and forecasts for your location.
- **Quick Notes**: Allows you to jot down notes directly on the homepage.
- **Pomodoro Timer**: Helps you stay focused with a built-in Pomodoro timer.
- **Popup Controls**: Quickly control Spotify playback and focus mode from the browser toolbar popup.

### Modules

- Google Tasks: Enables Google Tasks integration for viewing and adding tasks.
- Command Center: Shows a handy dashboard with quick actions. Use `cmd+p` within the homepage to open command center
- Well Being: Provides a guided breathing exercise.
- Spotify: Offers in-page Spotify playback controls.
- World Clocks: Displays local times from multiple time zones.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/melledijkstra/mizu.git
```

2. Install and build:

```bash
pnpm install && pnpm build
```

3. Load the extension in your browser:

- Open the Extension Management page by navigating to `chrome://extensions`.
- Enable Developer Mode by clicking the toggle switch next to Developer mode.
- Click the Load unpacked button and select the `dist` directory of the cloned repository.
