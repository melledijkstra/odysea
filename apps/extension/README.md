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

### Download Latest Release (Recommended)

1. Download the latest `mizu-extension-vX.Y.Z.zip` archive from the [GitHub Releases](https://github.com/melledijkstra/odysea/releases/latest) page.
2. Unzip the downloaded archive to a folder on your computer.
3. Load the extension in a Chromium-based browser (Chrome, Brave, Edge, Arc, etc.):
   - Open `chrome://extensions`.
   - Enable **Developer mode** using the toggle in the top-right corner.
   - Click **Load unpacked** and select the unzipped folder (the directory containing `manifest.json`).

### Build from Source

1. Clone the repository:

```bash
git clone https://github.com/melledijkstra/odysea.git
```

2. Install and build:

```bash
pnpm install && pnpm turbo run build --filter=@odysea/extension
```

3. Load the extension in your browser:

- Open the Extension Management page by navigating to `chrome://extensions`.
- Enable Developer Mode by clicking the toggle switch next to Developer mode.
- Click the Load unpacked button and select the `apps/extension/dist` directory of the cloned repository.

## Releasing

Extension releases are published automatically by `.github/workflows/release-extension.yml` when an `extension-vX.Y.Z` tag is pushed:

1. Update `"version"` in `apps/extension/package.json` to `X.Y.Z` and commit it to `main`.
2. Tag and push:

```bash
git tag extension-vX.Y.Z
git push origin extension-vX.Y.Z
```

The workflow verifies that the tag matches `apps/extension/package.json`, builds and validates `@odysea/extension`, packages `apps/extension/dist` into `mizu-extension-vX.Y.Z.zip`, and publishes the GitHub Release.
