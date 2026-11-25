/**
 * Converts a string into a URL- and filename-safe ASCII kebab-case slug.
 */
export function slugify(input: string): string {
  if (!input) {
    return ''
  }

  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Capitalizes the first character of a string while leaving the remainder unchanged.
 */
export function capitalize(input: string): string {
  if (!input) {
    return ''
  }

  return input.charAt(0).toUpperCase() + input.slice(1)
}
