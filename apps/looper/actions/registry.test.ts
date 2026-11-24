import { describe, expect, it, vi } from 'vitest'

vi.mock('../google-auth.js', () => ({
  authClient: null,
}))

import { actionRegistry } from './registry.js'

describe('actionRegistry', () => {
  it('throws an actionable error when invoking a Google action without credentials', async () => {
    const getUserInfo = actionRegistry['google.getUserInfo']
    expect(getUserInfo).toBeDefined()

    await expect(
      getUserInfo!(
        {
          workflowId: 'test-wf',
          workflowName: 'Test Workflow',
          reason: 'unit-test',
          port: 5050,
        },
        {}
      )
    ).rejects.toThrow(/Google authentication is not configured/)
  })
})
