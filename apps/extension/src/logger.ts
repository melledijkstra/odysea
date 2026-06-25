export function log(...data: unknown[]) {
  if (import.meta.env.MODE === 'development') {
    console.log(...data)
  }
}

function error(...data: unknown[]) {
  if (import.meta.env.MODE === 'development') {
    console.error(...data)
  }
}

function warn(...data: unknown[]) {
  if (import.meta.env.MODE === 'development') {
    console.warn(...data)
  }
}

function debug(...data: unknown[]) {
  if (import.meta.env.MODE === 'development') {
    console.debug(...data)
  }
}

export class Logger {
  public name: string
  public disabled = false

  constructor(name: string, disabled = false) {
    this.name = name
    this.disabled = disabled
  }

  log(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    if (typeof data?.[0] === 'string' && data[0].includes('%c')) {
      // If the first argument contains a style, we assume it's a styled log
      // and we use console.log directly to preserve the styles
      data[0] = `[${this.name}] ${data[0]}`
      log(...data)
      return
    }
    log(`[${this.name}]`, ...data)
  }

  error(...data: unknown[]) {
    error(`[${this.name}]`, ...data)
  }

  warn(...data: unknown[]) {
    warn(`[${this.name}]`, ...data)
  }

  debug(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    debug(`[${this.name}]`, ...data)
  }

  private generateLabel(label?: string): string {
    return label ? `[${this.name}] ${label}` : `[${this.name}]`
  }

  time(label?: string) {
    if (this.disabled) {
      return
    }
    console.time(this.generateLabel(label))
  }

  timeEnd(label?: string) {
    if (this.disabled) {
      return
    }
    console.timeEnd(this.generateLabel(label))
  }
}
