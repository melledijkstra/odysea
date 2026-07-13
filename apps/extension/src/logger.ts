import { Logger as BaseLogger } from '@melledijkstra/toolbox'

export class Logger extends BaseLogger {
  constructor(name: string, disabled?: boolean) {
    const isDevelopment = import.meta.env.MODE === 'development'
    super(name, disabled ?? !isDevelopment)
  }
}
