export type Cookie = {
  name: string

  value: string

  /**
   * Either `url` or both `domain` and `path` are required. Optional.
   */
  url?: string

  /**
   * For the cookie to apply to all subdomains as well, prefix domain with a dot, like this: ".example.com". Either
   * `url` or both `domain` and `path` are required. Optional.
   */
  domain?: string

  /**
   * Either `url` or both `domain` and `path` are required. Optional.
   */
  path?: string

  /**
   * Unix time in seconds. Optional.
   */
  expires?: number

  /**
   * Optional.
   */
  httpOnly?: boolean

  /**
   * Optional.
   */
  secure?: boolean

  /**
   * Optional.
   */
  sameSite?: 'Strict' | 'Lax' | 'None'

  /**
   * For partitioned third-party cookies (aka
   * [CHIPS](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies)), the
   * partition key. Optional.
   */
  partitionKey?: string
}
