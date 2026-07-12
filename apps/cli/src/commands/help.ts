import type { Command } from '../types.js';
import { commands } from './index.js';

export const helpCommand: Command = {
  name: 'help',
  description: 'Show this help menu',
  execute() {
    console.log('Available commands:');
    for (const cmd of commands) {
      if (cmd.name === 'interactive') continue;
      console.log(`  ${cmd.name.padEnd(8)} - ${cmd.description}`);
    }
    console.log('  exit / quit  - Exit the CLI');
  }
};
