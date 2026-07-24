/**
 * Task registry — import and export every concrete task here.
 * The TaskScheduler in index.ts will pick them all up automatically.
 *
 * To add a new task:
 *   1. Create `tasks/my-new-task.ts` extending ScheduledTask
 *   2. Export it from this file
 */
export { EmailTask } from './email-task.ts'
export { NotificationTask } from './notification-task.js'
