import type { Command } from '../types';

export const pingCommand: Command = {
  name: 'ping',
  description: 'Respond with pong',
  execute() {
    console.log('pong');
  }
};
