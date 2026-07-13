export const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = new Uint8Array(length)
  let result = ''

  // To avoid modulo bias, we reject values >= maxValid
  // 256 % 62 = 8. maxValid = 248.
  // We accept [0, 247], which maps evenly to [0, 61] (4 times each).
  const maxValid = 256 - (256 % possible.length)

  while (result.length < length) {
    crypto.getRandomValues(values)
    for (const value of values) {
      if (result.length >= length) break
      if (value < maxValid) {
        result += possible[value % possible.length]
      }
    }
  }

  return result
}

export const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return await crypto.subtle.digest('SHA-256', data)
}

export const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}
