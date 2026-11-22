import { describe, it, expect } from 'vitest'
import {
  GMAIL_SCOPE,
  SLEEP_SCOPE,
  TASKS_SCOPE,
  getAllGoogleServiceScopes,
  scopeRegistry,
} from './scope-registry'

describe('scope-registry', () => {
  describe('getAllGoogleServiceScopes', () => {
    it('returns all scopes defined in scopeRegistry without duplicates', () => {
      const scopes = getAllGoogleServiceScopes()
      const expectedScopes = Object.values(scopeRegistry).flatMap(
        (entry) => entry.scopes
      )

      expect(scopes).toEqual(Array.from(new Set(expectedScopes)))
      expect(scopes).toContain(TASKS_SCOPE)
      expect(scopes).toContain(GMAIL_SCOPE)
      expect(scopes).toContain(
        'https://www.googleapis.com/auth/calendar.calendars.readonly'
      )
    })

    it('does not include Google Health scopes that require a separate OAuth client', () => {
      const scopes = getAllGoogleServiceScopes()

      expect(scopes).not.toContain(SLEEP_SCOPE)
    })
  })
})
