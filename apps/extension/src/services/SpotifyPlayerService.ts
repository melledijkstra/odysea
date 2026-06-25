import { Logger } from "@/logger";
import { initializeSpotifyPlayer as initSDKPlayer } from "@/modules/spotify/spotify-sdk";
import type { AuthClient } from "@/oauth2/auth";

export class SpotifyPlayerService {
  private logger = new Logger('SpotifyPlayerService');
  private player?: Spotify.Player;
  private onStateChangedCb?: (state: Spotify.PlaybackState | null) => void;
  private onReadyCb?: (deviceId: string) => void;
  private onNotReadyCb?: (deviceId: string) => void;

  constructor(
    private authClient: AuthClient,
    private initialVolume: number
  ) {}

  setCallbacks(callbacks: {
    onStateChanged: (state: Spotify.PlaybackState | null) => void;
    onReady: (deviceId: string) => void;
    onNotReady: (deviceId: string) => void;
  }) {
    this.onStateChangedCb = callbacks.onStateChanged;
    this.onReadyCb = callbacks.onReady;
    this.onNotReadyCb = callbacks.onNotReady;
  }

  async initialize() {
    if (this.player) return;

    const initVolume = this.initialVolume / 100;
    this.player = await initSDKPlayer(this.authClient, initVolume);

    this.player.addListener('ready', async ({ device_id }) => {
      this.logger.log(`Ready with Device ID: %c${device_id}`, 'font-style: italic; color: lightgreen;');
      this.onReadyCb?.(device_id);
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      this.logger.log('device ID has gone offline', device_id);
      this.onNotReadyCb?.(device_id);
    });

    this.player.addListener('player_state_changed', (state) => {
      this.onStateChangedCb?.(state);
    });

    this.player.addListener('playback_error', ({ message }) => {
      this.logger.error('Playback error', message);
    });

    const success = await this.player.connect();
    if (success) {
      this.logger.log('Connected to Spotify Web Playback SDK');
    } else {
      throw new Error('Failed to connect');
    }
  }

  disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.player = undefined;
    }
  }

  togglePlay() {
    return this.player?.togglePlay();
  }

  resume() {
    return this.player?.resume();
  }

  pause() {
    return this.player?.pause();
  }

  nextTrack() {
    return this.player?.nextTrack();
  }

  previousTrack() {
    return this.player?.previousTrack();
  }

  setVolume(volumePercent: number) {
    return this.player?.setVolume(volumePercent / 100);
  }

  seek(positionMs: number) {
    return this.player?.seek(positionMs);
  }

  getCurrentState() {
    return this.player?.getCurrentState();
  }

  hasPlayer(): boolean {
    return !!this.player;
  }
}
