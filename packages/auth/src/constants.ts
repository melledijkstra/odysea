export const OAUTH_PROVIDERS = [
  'google',
  'github',
  'spotify',
  'google-health',
] as const

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]

export const GOOGLE_SCOPES = {
  PROFILE: 'profile',
  EMAIL: 'email',
  OPENID: 'openid',
  USERINFO_PROFILE: 'https://www.googleapis.com/auth/userinfo.profile',
  TASKS: 'https://www.googleapis.com/auth/tasks',
  CALENDAR_READONLY:
    'https://www.googleapis.com/auth/calendar.calendars.readonly',
  GMAIL_READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  FITNESS_ACTIVITY_READ:
    'https://www.googleapis.com/auth/fitness.activity.read',
  HEALTH_SLEEP_READONLY:
    'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
} as const

export type GoogleScope = (typeof GOOGLE_SCOPES)[keyof typeof GOOGLE_SCOPES]

export const SPOTIFY_SCOPES = {
  STREAMING: 'streaming',
  APP_REMOTE_CONTROL: 'app-remote-control',
  USER_READ_PLAYBACK_STATE: 'user-read-playback-state',
  USER_MODIFY_PLAYBACK_STATE: 'user-modify-playback-state',
  PLAYLIST_READ_PRIVATE: 'playlist-read-private',
} as const

export type SpotifyScope = (typeof SPOTIFY_SCOPES)[keyof typeof SPOTIFY_SCOPES]

export const GITHUB_SCOPES = {
  REPO: 'repo',
} as const

export type GithubScope = (typeof GITHUB_SCOPES)[keyof typeof GITHUB_SCOPES]
