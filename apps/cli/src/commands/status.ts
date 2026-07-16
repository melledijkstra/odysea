import type { Command } from '../types'

export const statusCommand: Command = {
  name: 'status',
  description: 'Show the CLI status',
  execute() {
    console.log('Status: CLI is active and ready.')
  },
}
