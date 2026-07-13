export type TimerTick = (remainingTime: number, tickCount: number) => void

export type TimerCallback = (remainingTime: number) => void

export type TimerOptions = {
  duration: number // Duration of the timer in milliseconds
  onTick?: TimerCallback // Callback for each tick
  onStart?: TimerCallback
  onStop?: TimerCallback
  onComplete?: TimerCallback // Callback when the timer completes
  interval?: number // Interval for tick updates in milliseconds (default: 1000ms)
}

export type TimerEvent = 'tick' | 'start' | 'stop' | 'complete'

export class Timer {
  private duration: number
  private interval: number
  private tickCount: number = 1
  private onTick?: TimerTick
  private onStart?: TimerCallback
  private onStop?: TimerCallback
  private onComplete?: TimerCallback
  private timerId: number | NodeJS.Timeout | null = null
  private startTime: number = 0
  private remainingTime: number = 0

  constructor(options: TimerOptions) {
    this.duration = options.duration
    this.interval = options.interval ?? 1000
    this.onTick = options.onTick
    this.onStart = options.onStart
    this.onStop = options.onStop
    this.onComplete = options.onComplete
    this.remainingTime = this.duration
  }

  start() {
    if (this.timerId) {
      return // timer is already running
    }

    this.onStart?.(this.remainingTime)

    this.startTime = Date.now()
    this.remainingTime = this.duration
    this.runTick()
  }

  // self adjusting timer, read the below article to understand why
  // @link https://www.sitepoint.com/creating-accurate-timers-in-javascript/
  private runTick() {
    const now = Date.now()
    const elapsedTime = now - this.startTime
    this.remainingTime = Math.max(this.duration - elapsedTime, 0)

    this.onTick?.(this.remainingTime, this.tickCount)

    if (this.remainingTime <= 0) {
      this.stop()
      this.onComplete?.(0)
    }
    else {
      const drift = Math.min(elapsedTime % this.interval, 200)
      const delay = this.interval - drift
      this.timerId = setTimeout(() => this.runTick(), delay)
    }

    this.tickCount++
  }

  static formatRemainingTime(milliseconds: number) {
    const seconds = Math.ceil(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  on(event: 'tick', callback: TimerTick): void
  on(event: Exclude<TimerEvent, 'tick'>, callback: TimerCallback): void

  on(event: TimerEvent, callback: TimerCallback | TimerTick) {
    switch (event) {
      case 'start':
        this.onStart = callback as TimerCallback
        break
      case 'stop':
        this.onStop = callback as TimerCallback
        break
      case 'tick':
        this.onTick = callback as TimerTick
        break
      case 'complete':
        this.onComplete = callback as TimerCallback
        break
    }
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    this.remainingTime = this.duration
    if (this.onStop) {
      this.onStop(this.remainingTime)
    }
  }

  setDuration(duration: number) {
    this.stop()
    this.duration = duration
    this.remainingTime = duration
  }

  formatRemainingTime() {
    return Timer.formatRemainingTime(this.remainingTime)
  }

  formatRemainingMinutes() {
    return `${Math.ceil(this.remainingTime / 1000 / 60)}m`
  }

  formatRemainingSeconds() {
    return `${Math.ceil(this.remainingTime / 1000)}s`
  }

  reset(newDuration?: number) {
    this.stop()
    this.duration = newDuration ?? this.duration
    this.remainingTime = this.duration
  }

  pause() {
    this.stop()
    // save the remaining time for resumption
    this.duration = this.remainingTime
  }

  resume() {
    this.start()
  }
}
