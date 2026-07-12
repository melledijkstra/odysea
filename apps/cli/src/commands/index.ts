import type { Command } from '../types';
import { pingCommand } from './ping';
import { statusCommand } from './status';
import { helpCommand } from './help';
import { interactiveCommand } from './interactive';

export const commands: Command[] = [
  pingCommand,
  statusCommand,
  helpCommand,
  interactiveCommand
];
