export interface LoggerPrinter {
  log(...data: unknown[]): void
  error(...data: unknown[]): void
  warn(...data: unknown[]): void
  debug(...data: unknown[]): void
  time(label?: string): void
  timeEnd(label?: string): void
}

export class Logger {
  public name: string
  public disabled = false
  private printer: LoggerPrinter

  constructor(name: string, disabled?: boolean, printer: LoggerPrinter = console) {
    this.name = name
    this.printer = printer
    if (typeof disabled !== 'undefined') {
      this.disabled = disabled
    }
    else {
      this.disabled = this.isDisabledByEnv()
    }
  }

  private isDisabledByEnv(): boolean {
    const envVar = process.env.NODE_ENV
    return envVar?.toLowerCase() === 'test'
  }

  log(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    if (typeof data?.[0] === 'string' && data[0].includes('%c')) {
      // If the first argument contains a style, we assume it's a styled log
      // and we use console.log directly to preserve the styles
      // Note: This might not work perfectly with custom printers that don't support %c
      data[0] = `[${this.name}] ${data[0]}`
      this.printer.log(...data)
      return
    }
    this.printer.log(`[${this.name}]`, ...data)
  }

  error(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    this.printer.error(`[${this.name}]`, ...data)
  }

  warn(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    this.printer.warn(`[${this.name}]`, ...data)
  }

  debug(...data: unknown[]) {
    if (this.disabled) {
      return
    }
    this.printer.debug(`[${this.name}]`, ...data)
  }

  private generateLabel(label?: string): string {
    return label ? `[${this.name}] ${label}` : `[${this.name}]`
  }

  time(label?: string) {
    if (this.disabled) {
      return
    }
    this.printer.time(this.generateLabel(label))
  }

  timeEnd(label?: string) {
    if (this.disabled) {
      return
    }
    this.printer.timeEnd(this.generateLabel(label))
  }
}
