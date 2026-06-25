import { Logger as BaseLogger } from '@melledijkstra/toolbox'

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

const customPrinter = {
  log,
  error,
  warn,
  debug,
  time: console.time.bind(console),
  timeEnd: console.timeEnd.bind(console),
}

export class Logger extends BaseLogger {
  constructor(name: string, disabled?: boolean) {
    const isDevelopment = import.meta.env.MODE === 'development'
    super(name, disabled ?? !isDevelopment, customPrinter)
  }
}
