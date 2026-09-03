export interface AuthFlowHandler {
  /**
   * Opens the authentication URL and returns the redirect URL with the code.
   * @param url The authorization URL to open
   */
  open(url: URL): Promise<URL>
}
