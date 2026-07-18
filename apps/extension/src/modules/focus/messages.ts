import type { Mode, PomodoroState } from '@/modules/focus/types'
import { createMessage } from '@/messaging'

export const startPomodoro = createMessage<void, void>('startPomodoro')

export const stopPomodoro = createMessage<void, void>('stopPomodoro')

export const getPomodoroState = createMessage<void, PomodoroState>(
  'getPomodoroState'
)

export const stateUpdate = createMessage<PomodoroState, void>(
  'pomodoroStateUpdate'
)

export const pomodoroComplete = createMessage<void, void>('pomodoroComplete')

export const switchMode = createMessage<Mode, boolean>('pomodoroSwitchMode')
