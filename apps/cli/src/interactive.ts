import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { commands } from './commands';

export async function startInteractive() {
  const rl = readline.createInterface({ input, output });

  // Handle Ctrl+C gracefully
  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
    process.exit(0);
  });

  console.log('\n🌟 Welcome to the Odysea Interactive CLI 🌟');
  console.log('Type "help" for a list of commands, or "exit" to quit.\n');

  try {
    while (true) {
      const line = await rl.question('odysea > ');
      const inputLine = line.trim();

      if (!inputLine) continue;

      const [cmd, ...args] = inputLine.split(/\s+/);
      const commandName = cmd.toLowerCase();

      if (commandName === 'exit' || commandName === 'quit') {
        console.log('Goodbye!');
        break;
      }

      // Check if command is registered
      const command = commands.find(c => c.name === commandName);
      if (command) {
        if (commandName === 'interactive') {
          console.log('You are already in interactive mode.');
          continue;
        }
        await command.execute(args);
      } else {
        console.log(`Unknown command: "${cmd}". Type "help" for a list of commands.`);
      }
    }
  } catch (error) {
    console.error('An error occurred in interactive mode:', error);
  } finally {
    rl.close();
  }
}
