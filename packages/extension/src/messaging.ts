import { Logger } from '@melledijkstra/toolbox'
import * as browser from 'webextension-polyfill'

const logger = new Logger('messaging')

type Message = {
  identifier: string
  data?: unknown
}

type Handler<Request, Response> = (
  request: Request,
) => Response | Promise<Response>

const isMessage = (msg: unknown): msg is Message => {
  return msg !== null && typeof msg === 'object' && 'identifier' in msg
}

export function createMessage<Request = void, Response = void>(identifier: string) {
  return {
    async send(data: Request): Promise<Response> {
      logger.log(identifier, 'sender data:', data)
      const response = await browser.runtime.sendMessage<Message, Response>({
        identifier,
        data,
      })
      logger.log(identifier, 'sender response:', response)
      return response
    },
    on(callback: Handler<Request, Response>) {
      browser.runtime.onMessage.addListener(
        (message, sender, sendResponse) => {
          if (isMessage(message) && message.identifier === identifier) {
            logger.log(identifier, 'listener message received', { message, sender })
            const promise = callback(message?.data as Request)
            Promise.resolve(promise).then((response) => {
              logger.log(identifier, 'listener response:', response)
              sendResponse(response)
            })
            return true
          }
          return true
        },
      )
    },
  }
}
