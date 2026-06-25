import { SpotifyApiClient } from "@/api/spotify";
import { MemoryCache, MIN_5 } from "@/cache/memory";
import type { AuthClient } from "@/oauth2/auth";
import type { Playlist, Track } from "MusicPlayer";
import { convertSpotifyPlaylist, convertSpotifyTrackToMPTrack, convertApiPlaybackState } from "@/transforms/spotify";
import { Logger } from "@/logger";

export class SpotifyApiService {
  private logger = new Logger('SpotifyApiService');
  private api: SpotifyApiClient;
  private cache = new MemoryCache();

  constructor(authClient: AuthClient) {
    this.api = new SpotifyApiClient(authClient);
  }

  async getPlaylistItems(playlistId: string): Promise<Track[]> {
    const tracks = await this.api.getPlaylistItems(playlistId);
    return tracks.map(convertSpotifyTrackToMPTrack);
  }

  async getPlaylists(): Promise<Playlist[]> {
    const cached = this.cache.get<Playlist[]>('playlists');
    if (cached) {
      return cached;
    }
    try {
      const playlists = await this.api.userPlaylists();
      const converted = playlists.map(convertSpotifyPlaylist);
      this.cache.set('playlists', converted, MIN_5);
      return converted;
    } catch (error) {
      this.logger.error('Failed to retrieve playlists', error);
    }
    return [];
  }

  async toggleRepeatMode(repeatMode: string | number): Promise<void> {
    await this.api.toggleRepeatMode(repeatMode);
  }

  async availableDevices() {
    return this.api.availableDevices();
  }

  async transferPlaybackDevice(deviceId: string): Promise<boolean> {
    return this.api.transferPlaybackDevice(deviceId);
  }

  async play(contextUri?: string): Promise<void> {
    await this.api.play(contextUri);
  }

  async pause(): Promise<void> {
    await this.api.pause();
  }

  async nextTrack(): Promise<void> {
    await this.api.nextTrack();
  }

  async previousTrack(): Promise<void> {
    await this.api.previousTrack();
  }

  async setVolume(volume: number): Promise<void> {
    await this.api.setVolume(volume);
  }

  async seek(positionMs: number): Promise<void> {
    await this.api.seek(positionMs);
  }

  async getPlaybackState() {
    const playbackState = await this.api.getPlaybackState();
    if (playbackState) {
      return convertApiPlaybackState(playbackState);
    }
    return undefined;
  }

  async toggleShuffle(state: boolean): Promise<void> {
    await this.api.toggleShuffle(state);
  }
}
