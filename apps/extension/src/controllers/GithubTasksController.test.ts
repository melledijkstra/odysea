import { describe, it, expect, vi } from 'vitest'
import {
  GithubTasksController,
  githubDataFromId,
  githubIdFromData,
} from './GithubTasksController'

vi.mock('@melledijkstra/extension')

describe('GithubTasksController', () => {
  describe('GithubIssueTarget', () => {
    it('should correctly parse issue target from string', () => {
      const target = githubDataFromId('octocat/Hello-World/1337')
      expect(target.owner).toBe('octocat')
      expect(target.repo).toBe('Hello-World')
      expect(target.number).toBe(1337)
    })

    it('should correctly stringify to ID', () => {
      const target = githubIdFromData('octocat', 'Hello-World', 1337)
      expect(target).toBe('octocat/Hello-World/1337')
    })
  })

  describe('Capabilities', () => {
    it('should declare correct capabilities', () => {
      const controller = new GithubTasksController()
      expect(controller.canCreateTask).toBe(false)
      expect(controller.defaultListId).toBe('assigned')
    })
  })
})
