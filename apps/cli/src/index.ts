#!/usr/bin/env tsx
import { Command as Commander } from 'commander'
import { commands } from './commands/index'
import { startInteractive } from './interactive'

const program = new Commander()

program
  .name('odysea')
  .description('Odysea CLI tool')
  .version('0.0.1')

// Register all commands to commander
for (const cmd of commands) {
  program
    .command(cmd.name)
    .description(cmd.description)
    .action(async (...args) => {
      // Commander actions receive [arg1, arg2, ..., options, command]
      // We extract only string arguments to pass to command execution
      const cleanArgs = args.filter((a): a is string => typeof a === 'string')
      await cmd.execute(cleanArgs)
    })
}

// Bootstrap
if (process.argv.length <= 2) {
  // If run with no arguments, default to interactive mode
  await startInteractive()
}
else {
  program.parse(process.argv)
}
