import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { AuthFlowHandler } from './auth-client'

export class CliAuthFlowHandler implements AuthFlowHandler {
  async open(url: URL): Promise<URL> {
    console.log('\n========================================')
    console.log('Authentication Required')
    console.log('========================================\n')
    console.log('Please visit the following URL to authenticate:\n')
    console.log(url.href)
    console.log('\nAfter authentication, you will be redirected.')

    const rl = readline.createInterface({ input, output })
    try {
      const answer = await rl.question('\nPaste the redirect URL here: ')
      return new URL(answer.trim())
    }
    finally {
      rl.close()
    }
  }
}
