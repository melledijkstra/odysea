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
  health: {
    icon: '/icons/google-health.svg',
    scopes: [HEALTH_SCOPE, SLEEP_SCOPE],
  },
}
