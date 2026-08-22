import type { AuthClient } from '@melledijkstra/auth'
import { TokenBaseClient } from '../../tokenbaseclient'
import { Logger } from '@melledijkstra/toolbox'
import type { GmailLabel } from '../../definitions/google'

const BASE_URL = 'https://gmail.googleapis.com/gmail/v1'

export class GoogleGmailApiClient extends TokenBaseClient {
  private logger = new Logger('GoogleGmailApiClient')

  constructor(private readonly auth: AuthClient) {
    super(BASE_URL, () => this.auth.getAuthToken())
  }

  /**
   * Retrieves label details including unread messages count.
   * @param labelId The label ID (default: 'INBOX')
   * @param userId The user ID (default: 'me')
   */
  async getLabel(
    labelId: string = 'INBOX',
    userId: string = 'me'
  ): Promise<GmailLabel | undefined> {
    try {
      const response = await this.request<GmailLabel>(
        `/users/${userId}/labels/${labelId}`
      )
      return response ?? undefined
    } catch (error) {
      this.logger.error(
        `Error requesting /users/${userId}/labels/${labelId}`,
        error
      )
      return undefined
    }
  }

  /**
   * Retrieves the number of unread emails for a specific label (default: 'INBOX').
   */
  async getUnreadCount(
    labelId: string = 'INBOX',
    userId: string = 'me'
  ): Promise<number | undefined> {
    const label = await this.getLabel(labelId, userId)
    return label?.messagesUnread
  }
}
