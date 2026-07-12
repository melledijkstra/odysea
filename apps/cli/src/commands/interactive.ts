import type { Command } from '../types';
import { startInteractive } from '../interactive';

export const interactiveCommand: Command = {
  name: 'interactive',
  description: 'Start interactive mode',
  async execute() {
    await startInteractive();
  }
};
