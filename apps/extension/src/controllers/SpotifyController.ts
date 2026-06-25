import { Logger } from "@/logger";
import { spotifyState } from "@/modules/spotify/spotify.state.svelte";
import { AuthClient } from "@/oauth2/auth";
import { SpotifyAuthProvider } from "@/oauth2/providers";
import type { Album, PlaybackState, Playlist, Track } from "MusicPlayer";
import type { ILogger } from "@/interfaces/logger.interface";
import { convertPlayerState } from "@/transforms/spotify";
import { BaseMusicController } from "./BaseMusicController";
import browser from 'webextension-polyfill';
import { SpotifyPlayerService } from "@/services/SpotifyPlayerService";
import { SpotifyApiService } from "@/services/SpotifyApiService";

export class SpotifyController extends BaseMusicController implements ILogger {
  logger: Logger = new Logger('SpotifyController');

  protected authClient: AuthClient = new AuthClient(new SpotifyAuthProvider());
  protected playerService: SpotifyPlayerService;
  protected apiService: SpotifyApiService;

  private initialized: boolean = false;
  public isPlayerActive: boolean = false;

  constructor(state: { playback: PlaybackState }) {
    super(state);
    this.apiService = new SpotifyApiService(this.authClient);
    this.playerService = new SpotifyPlayerService(this.authClient, this.state.playback.volume);

    this.playerService.setCallbacks({
      onStateChanged: (state) => this.playerStateChanged(state),
      onReady: (deviceId) => this.handlePlayerReady(deviceId),
      onNotReady: () => this.handlePlayerNotReady()
    });
  }

  get auth(): AuthClient {
    return this.authClient;
  }

  async getPlaylistItems(playlist: Playlist): Promise<Track[]> {
    return this.apiService.getPlaylistItems(playlist.id);
  }

  async getPlaylists(): Promise<Playlist[]> {
    return this.apiService.getPlaylists();
  }

  async switchRepeatMode(repeatMode: string | number): Promise<void> {
    await this.apiService.toggleRepeatMode(repeatMode);
    await this.syncState();
  }

  async initialize() {
    if (this.initialized) {
      this.logger.log('SpotifyController is already initialized');
      return;
    }

    spotifyState.isAuthenticated = await this.authClient.isAuthenticated();
    browser.storage.local.onChanged.addListener(this.handleStorageChange);

    if (spotifyState.isAuthenticated) {
      await this.playerService.initialize();
    }

    this.initialized = true;
  }

  destroy() {
    super.destroy();
    browser.storage.local.onChanged.removeListener(this.handleStorageChange);
    this.playerService.disconnect();
  }

  private readonly handleStorageChange = async (changes: Record<string, browser.Storage.StorageChange>) => {
    const key = this.authClient.storageKey;
    if (changes[key]) {
      const isAuthenticated = changes[key].newValue;
      spotifyState.isAuthenticated = !!isAuthenticated;
      this.logger.log('Spotify auth state changed reactively:', spotifyState.isAuthenticated);
      if (isAuthenticated) {
        if (!this.playerService.hasPlayer()) {
          try {
            await this.playerService.initialize();
          } catch (err) {
            this.logger.error('Failed to initialize Spotify player after re-auth:', err);
          }
        }
      } else {
        this.isPlayerActive = false;
        this.playerService.disconnect();
        delete spotifyState.deviceId;
        spotifyState.devices = [];
      }
    }
  };

  private async retrieveDevices(): Promise<void> {
    const availableDevices = await this.apiService.availableDevices();
    if (availableDevices?.length) {
      spotifyState.devices = availableDevices;
    }
  }

  private handlePlayerReady(deviceId: string) {
    spotifyState.deviceId = deviceId;
    this.retrieveDevices();
  }

  private handlePlayerNotReady() {
    delete spotifyState.deviceId;
    this.isPlayerActive = false;
  }

  async playerStateChanged(state: Spotify.PlaybackState | null) {
    if (!state) {
      this.isPlayerActive = false;
      return;
    }

    this.logger.log('playerStateChanged: Playback state changed', state);
    this.state.playback = convertPlayerState(state, this.state.playback);

    if (state.paused) {
      this.cancelPlaybackLoop?.();
    } else {
      this.setupPlaybackLoop(state.position);
    }
  }

  async activateDevice(deviceIdToActivate: string) {
    const result = await this.apiService.transferPlaybackDevice(deviceIdToActivate);
    if (result) {
      this.logger.log(`Playback device transferred to ${deviceIdToActivate}`);
      if (spotifyState.deviceId === deviceIdToActivate) {
        this.isPlayerActive = true;
      } else {
        this.isPlayerActive = false;
        await this.syncState();
      }
      spotifyState.devices = spotifyState.devices.map(device => ({
        ...device,
        is_active: device.id === deviceIdToActivate
      }));
    }
  }

  async playItem(mediaItem: Playlist | Album | Track) {
    this.logger.log('Playing item:', mediaItem.title, mediaItem);
    await this.apiService.play(mediaItem.uri);
  }

  async play() {
    this.logger.log('Resuming playback', { isPlayerActive: this.isPlayerActive });
    if (this.isPlayerActive) {
      await this.playerService.resume();
    } else {
      await this.apiService.play();
    }
    super.play();
  }

  async pause() {
    this.logger.log('Pausing playback', { isPlayerActive: this.isPlayerActive });
    if (this.isPlayerActive) {
      await this.playerService.pause();
    } else {
      await this.apiService.pause();
    }
    super.pause();
  }

  async next() {
    if (this.isPlayerActive) {
      await this.playerService.nextTrack();
    } else {
      await this.apiService.nextTrack();
      await this.syncState();
    }
  }

  async previous() {
    if (this.isPlayerActive) {
      await this.playerService.previousTrack();
    } else {
      await this.apiService.previousTrack();
      await this.syncState();
    }
  }

  async setVolume(volume: number) {
    this.logger.log('Setting volume', volume);
    if (this.isPlayerActive) {
      await this.playerService.setVolume(volume);
    } else {
      await this.apiService.setVolume(volume);
    }
    super.setVolume(volume);
  }

  async seek(position: number) {
    this.logger.log('Seeking to position:', position, this.isPlayerActive);
    if (this.isPlayerActive) {
      await this.playerService.seek(position);
    } else {
      await this.apiService.seek(position);
      // manually update state since we won't get a state change event
      this.state.playback.position_ms = position;
      this.setupPlaybackLoop();
    }
    super.seek(position);
  }

  trackEnded(): void {
    this.getPlaybackState();
  }

  async getPlaybackState(): Promise<PlaybackState> {
    this.logger.log('Retrieving Spotify playback state', {
      isPlayerActive: this.isPlayerActive,
    });
    if (this.isPlayerActive && this.playerService.hasPlayer()) {
      const playbackState = await this.playerService.getCurrentState();
      if (playbackState) {
        return convertPlayerState(playbackState, this.state.playback);
      }
    }

    this.logger.log('User is not playing music through the Web SDK, trying to retrieve from Web API');
    const playbackState = await this.apiService.getPlaybackState();
    if (playbackState) {
      this.logger.log('Playback state retrieved from Web API', playbackState);
      return playbackState;
    } else {
      throw new Error('No playback state available from Web API');
    }
  }

  async syncState() {
    this.logger.log('Syncing Spotify state');
    try {
      const playbackState = await this.getPlaybackState();
      this.state.playback = playbackState;
      if (playbackState.isPlaying) {
        this.setupPlaybackLoop();
      } else {
        this.cancelPlaybackLoop?.();
      }
    } catch(error) {
      this.logger.warn('Failed to sync Spotify state', error);
    }
  }

  async toggleShuffle(forceState?: boolean): Promise<void> {
    const newState = typeof forceState === 'boolean'
    ? forceState
    : !this.state.playback.shuffle;
    this.logger.log('Toggling shuffle mode', { newState });
    await this.apiService.toggleShuffle(newState);
    await this.syncState();
  }
}