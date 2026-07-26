import { WorkflowEngine } from './engine.js'
import type { Workflow } from './types/workflow.js'
import { actionRegistry } from './actions/registry.js'
import * as db from './database.js'

vi.mock('./database.js', () => ({
  updateLastExecutedTimestamp: vi.fn(),
  getLastExecutedTimestamp: vi.fn(),
}))

describe('WorkflowEngine Interpolation', () => {
  it('should interpolate simple strings', () => {
    const context = { step1: { output: { email: 'test@example.com' } } }
    const result = WorkflowEngine.interpolate(
      'Send to {{ step1.output.email }}',
      context
    )
    expect(result).toBe('Send to test@example.com')
  })

  it('should return exact type when full match', () => {
    const context = { step1: { output: { age: 25 } } }
    const result = WorkflowEngine.interpolate('{{ step1.output.age }}', context)
    expect(result).toBe(25)
  })

  it('should interpolate objects and arrays recursively', () => {
    const context = { step1: { output: { user: 'Alice' } } }
    const input = {
      message: 'Hello {{ step1.output.user }}',
      tags: ['{{ step1.output.user }}', 'test'],
    }
    const result = WorkflowEngine.interpolate(input, context)
    expect(result).toEqual({
      message: 'Hello Alice',
      tags: ['Alice', 'test'],
    })
  })

  it('should handle undefined paths', () => {
    const context = {}
    const result = WorkflowEngine.interpolate(
      'Send to {{ step1.output.email }}',
      context
    )
    expect(result).toBe('Send to {{ step1.output.email }}')
  })
})

describe('WorkflowEngine Execution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    actionRegistry['test.action1'] = vi.fn().mockResolvedValue({ status: 'ok' })
    actionRegistry['test.action2'] = vi.fn().mockResolvedValue('result2')
  })

  it('should execute steps sequentially and update database on success', async () => {
    const workflow: Workflow = {
      id: 'test-wf',
      name: 'Test Workflow',
      trigger: { type: 'webhook' },
      steps: [
        { id: 's1', action: 'test.action1', args: { input: 'hello' } },
        {
          id: 's2',
          action: 'test.action2',
          args: { prev: '{{ s1.output.status }}' },
        },
      ],
    }

    await WorkflowEngine.execute(workflow, 'test run')

    expect(actionRegistry['test.action1']).toHaveBeenCalledTimes(1)
    expect(actionRegistry['test.action2']).toHaveBeenCalledTimes(1)
    expect(actionRegistry['test.action2']).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'test-wf' }),
      { prev: 'ok' }
    )
    expect(db.updateLastExecutedTimestamp).toHaveBeenCalledWith(
      'test-wf',
      expect.any(Number),
      'SUCCESS',
      'Test Workflow'
    )
  })

  it('should mark as FAILED in database if an action throws', async () => {
    actionRegistry['test.error'] = vi
      .fn()
      .mockRejectedValue(new Error('Test error'))

    const workflow: Workflow = {
      id: 'error-wf',
      name: 'Error Workflow',
      trigger: { type: 'webhook' },
      steps: [{ id: 's1', action: 'test.error' }],
    }

    await WorkflowEngine.execute(workflow, 'test run')

    expect(db.updateLastExecutedTimestamp).toHaveBeenCalledWith(
      'error-wf',
      expect.any(Number),
      'FAILED',
      'Error Workflow'
    )
  })
})
