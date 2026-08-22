export const TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks'
export const HEALTH_SCOPE =
  'https://www.googleapis.com/auth/fitness.activity.read'
export const SLEEP_SCOPE =
  'https://www.googleapis.com/auth/googlehealth.sleep.readonly'
export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'

export type ScopeRegistry = {
  [key: string]: {
    icon: string
    scopes: string[]
    message?: string
  }
}

export const scopeRegistry: ScopeRegistry = {
  tasks: {
    icon: '/icons/google-tasks.svg',
    scopes: [TASKS_SCOPE],
  },
  // Google Health API needs a separate OAuth client and can't be mixed
  // with other scopes, so we can't include it in the scope registry.
  // health: {
  //   icon: '/icons/google-health.svg',
  //   scopes: [HEALTH_SCOPE, SLEEP_SCOPE],
  // },
  // Unfortunately, Google Keep API is not available for public use
  // so we cannot include it in the scope registry.
  // keep: {
  //   icon: '/icons/google-keep.svg',
  //   scopes: ['https://www.googleapis.com/auth/keep'],
  // },
  calendar: {
    icon: '/icons/google-calendar.svg',
    scopes: ['https://www.googleapis.com/auth/calendar.calendars.readonly'],
    message:
      'This app only reads your Google Calendar events.\n' +
      'It will not modify or delete any events.\n' +
      'This is purely to show you your upcoming events in your Google Calendar.',
  },
  gmail: {
    icon: '/icons/google-gmail.svg',
    scopes: [GMAIL_SCOPE],
    message:
      'This app only reads your unread Gmail email messages count.\n' +
      'It will not modify or delete any messages.\n' +
      'This is purely to show you how many unread messages you have in your Gmail inbox.',
  },
}
