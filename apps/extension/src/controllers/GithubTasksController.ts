import { Octokit } from '@octokit/rest'
import { AuthClient } from '@melledijkstra/extension'
import { githubAuthClient } from '@/oauth2/clients'
import type { Task, TaskList } from '@/modules/tasks/types'
import type { TaskControllerInterface } from './TaskController.interface'
import type { ILogger } from '@/interfaces/logger.interface'
import { Logger } from '@/logger'
import { addNotification } from '@/stores/notifications.svelte'

type GithubIssueData = {
  owner: string
  repo: string
  number: number
}

export function githubDataFromId(id: string): GithubIssueData {
  const [owner, repo, numberStr] = id.split('/')
  return { owner, repo, number: parseInt(numberStr, 10) }
}

export function githubIdFromData(
  owner: string,
  repo: string,
  number: number
): string {
  return `${owner}/${repo}/${number}`
}

export class GithubTasksController implements TaskControllerInterface, ILogger {
  canCreateTask = false
  defaultListId = 'assigned'
  logger: Logger
  public readonly auth: AuthClient
  private octokit: Octokit | null = null

  private readonly TASK_LISTS: TaskList[] = [
    { id: 'assigned', title: 'Assigned to me' },
    { id: 'created', title: 'Created by me' },
    { id: 'mentioned', title: 'Mentioned' },
  ]

  constructor() {
    this.logger = new Logger('GithubTasksController')
    this.auth = githubAuthClient
  }

  private async getOctokit(): Promise<Octokit | null> {
    if (this.octokit) return this.octokit
    const token = await this.auth.getAuthToken(false)
    if (token) {
      this.octokit = new Octokit({ auth: token })
    }
    return this.octokit
  }

  async authenticate(): Promise<boolean> {
    return await this.auth.authenticate()
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.auth.isAuthenticated()
  }

  async initialize() {
    await this.getOctokit()
  }

  async isEnabled(): Promise<boolean> {
    const isAuthenticated = await this.isAuthenticated()
    return isAuthenticated
  }

  async getTaskLists(): Promise<TaskList[]> {
    return this.TASK_LISTS
  }

  async getTasks(taskListId?: string): Promise<Task[]> {
    const octokit = await this.getOctokit()
    if (!octokit) {
      this.logger.error('Octokit not initialized')
      return []
    }

    let query = 'is:issue is:open archived:false'
    if (taskListId === 'assigned') {
      query += ' assignee:@me'
    } else if (taskListId === 'created') {
      query += ' author:@me'
    } else if (taskListId === 'mentioned') {
      query += ' mentions:@me'
    }

    try {
      const response = await octokit.search.issuesAndPullRequests({
        q: query,
        per_page: 50,
      })

      return response.data.items.map((issue) => {
        const repoUrlParts = issue.repository_url.split('/')
        const repo = repoUrlParts.pop()!
        const owner = repoUrlParts.pop()!
        const target = githubIdFromData(owner, repo, issue.number)
        return {
          id: target,
          title: issue.title,
          status: issue.state === 'open' ? 'needsAction' : 'completed',
          webViewLink: issue.html_url,
        }
      })
    } catch (error) {
      this.logger.error('Error fetching github issues', error)
      addNotification('Error fetching GitHub issues', 'error')
      return []
    }
  }

  async createTask(): Promise<boolean> {
    this.logger.warn('Creating GitHub issues is not supported yet')
    return false
  }

  async setTaskStatus(taskId: string, status: boolean): Promise<boolean> {
    const octokit = await this.getOctokit()
    if (!octokit) return false
    const target = githubDataFromId(taskId)
    try {
      await octokit.issues.update({
        owner: target.owner,
        repo: target.repo,
        issue_number: target.number,
        state: status ? 'closed' : 'open',
      })
      return true
    } catch (e) {
      this.logger.error(e)
      addNotification('Failed to update issue status', 'error')
      return false
    }
  }

  async updateTask(task: Task): Promise<boolean> {
    const octokit = await this.getOctokit()
    if (!octokit) return false
    const target = githubDataFromId(task.id)
    try {
      await octokit.issues.update({
        owner: target.owner,
        repo: target.repo,
        issue_number: target.number,
        title: task.title,
      })
      return true
    } catch (e) {
      this.logger.error(e)
      addNotification('Failed to update issue', 'error')
      return false
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return this.setTaskStatus(taskId, true)
  }
}
