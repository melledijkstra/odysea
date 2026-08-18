export const TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks'
export const HEALTH_SCOPE =
  'https://www.googleapis.com/auth/fitness.activity.read'
export const SLEEP_SCOPE =
  'https://www.googleapis.com/auth/googlehealth.sleep.readonly'

export const scopeRegistry = {
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
  },
}
