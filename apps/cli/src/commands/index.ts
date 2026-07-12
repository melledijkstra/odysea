import type { Command } from '../types';
import { pingCommand } from './ping';
import { statusCommand } from './status';
import { helpCommand } from './help';

export const commands: Command[] = [
  pingCommand,
  statusCommand,
  helpCommand
];
