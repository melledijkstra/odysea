import { Octokit } from '@octokit/rest'
import { AuthClient } from '@melledijkstra/extension'
import { GithubAuthProvider } from '@/oauth2/providers'
import type { Task, TaskList } from '@/interfaces/tasks'
import type { TaskControllerInterface } from './GoogleTasksController'
import type { ILogger } from '@/interfaces/logger.interface'
import { Logger } from '@/logger'
import { addNotification } from '@/stores/notifications.svelte'

export class GithubTasksController implements TaskControllerInterface, ILogger {
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
    this.auth = new AuthClient(new GithubAuthProvider())
  }

  async initialize() {
    const token = await this.auth.getAuthToken(false)
    if (token) {
      this.octokit = new Octokit({ auth: token })
    }
  }

  async getTaskLists(): Promise<TaskList[]> {
    return this.TASK_LISTS
  }

  async getTasks(taskListId?: string): Promise<Task[]> {
    if (!this.octokit) {
      this.logger.error('Octokit not initialized')
      return []
    }

    let query = 'is:issue'
    if (taskListId === 'assigned') {
      query = 'is:issue assignee:@me'
    } else if (taskListId === 'created') {
      query = 'is:issue author:@me'
    } else if (taskListId === 'mentioned') {
      query = 'is:issue mentions:@me'
    }

    try {
      const response = await this.octokit.search.issuesAndPullRequests({
        q: query,
        per_page: 50,
      })

      return response.data.items.map((issue) => {
        const repoUrlParts = issue.repository_url.split('/')
        const repo = repoUrlParts.pop()!
        const owner = repoUrlParts.pop()!
        return {
          id: `${owner}/${repo}/${issue.number}`,
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
    if (!this.octokit) return false
    const [owner, repo, numberStr] = taskId.split('/')
    try {
      await this.octokit.issues.update({
        owner,
        repo,
        issue_number: parseInt(numberStr, 10),
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
    if (!this.octokit) return false
    const [owner, repo, numberStr] = task.id.split('/')
    try {
      await this.octokit.issues.update({
        owner,
        repo,
        issue_number: parseInt(numberStr, 10),
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
