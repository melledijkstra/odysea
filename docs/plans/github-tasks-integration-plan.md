# GitHub Tasks Integration Plan

This document outlines the step-by-step implementation plan for integrating GitHub Issues into the existing Tasks module, leveraging the newly added GitHub OAuth integration.

## 1. SDK Installation

We will use the official Octokit REST SDK to interact with the GitHub API directly within the extension.

- Install `@octokit/rest` in the `apps/extension` workspace:
  ```bash
  pnpm --filter=@odysea/extension add @octokit/rest
  ```

## 2. Extension Architecture Updates (`apps/extension`)

### A. Extract Abstract Task Definitions

Currently, the UI relies on the `Task` and `TaskList` types from `packages/api` which are tightly coupled to Google's API definitions.

- Create a shared `apps/extension/src/interfaces/tasks.ts` file.
- Define a generic, abstract `Task` and `TaskList` model in this file that represents the unified domain model for the UI, regardless of the provider.
- Update `TasksPanelContent.svelte`, `TaskList.svelte`, and the `TaskControllerInterface` to use this new abstract extension-level `Task` definition instead of the one from `@melledijkstra/api`.
- (The `packages/api` definitions should be left as exact representations of the Google API responses).

### B. Rename `google-tasks` Module to `tasks`

Since the module will now support multiple providers, the naming should be provider-agnostic.

- Rename the `apps/extension/src/modules/google-tasks` directory to `apps/extension/src/modules/tasks`.
- Update all corresponding imports in `apps/extension/src/modules/index.ts` and throughout the app to point to the `tasks` module.

### C. Implement `GithubTasksController`

Create `apps/extension/src/controllers/GithubTasksController.ts`.

- Implement the updated `TaskControllerInterface` (using the new generic `Task` types).
- Inside the controller, initialize `@octokit/rest` directly using the auth token from `AuthClient(new GithubAuthProvider())`.
- **Task Lists mapping:** Map "Task Lists" to predefined GitHub Issue queries:
  1. `assigned`: Issues assigned to the user (`is:issue assignee:@me`)
  2. `created`: Issues created by the user (`is:issue author:@me`)
  3. `mentioned`: Issues mentioning the user (`is:issue mentions:@me`)
- **Mapping GitHub Issues to the generic `Task`:**
  - `id`: Issue `node_id` or `number`
  - `title`: Issue `title`
  - `status`: If `state === 'open'` then `'needsAction'`, else `'completed'`
  - `webViewLink`: Issue `html_url`
- **Implement Interface Methods:**
  - `getTaskLists()`: Return the hardcoded lists (Assigned, Created, Mentioned).
  - `getTasks(taskListId)`: Use Octokit's search API to fetch issues based on the selected list query and map them to the generic `Task` interface.
  - `setTaskStatus()`: Use Octokit to close/reopen the issue.
  - `createTask()`: Do not implement issue creation for now (e.g., return `false` or throw a "Not supported" error).
  - `updateTask()`: Use Octokit to update the issue title.
  - `deleteTask()`: Close the issue or return `false`.

### D. UI Component Refactoring (Unified Tasks Module)

Integrate GitHub directly into the newly renamed `tasks` module.

- **Update `TasksPanel.svelte` / `TasksPanelContent.svelte`:**
  - Add a UI mechanism (e.g., a dropdown, tabs, or segmented control) to allow the user to switch the active provider between "Google Tasks" and "GitHub Issues".
  - Manage state for the active controller (`GoogleTasksController` or `GithubTasksController`) based on the user's provider selection.
- **Cache Isolation:**
  - Update the Tanstack Query `queryKey` definitions in `TasksPanelContent.svelte` to dynamically include a `providerId` (e.g., `['tasks', providerId, 'lists']`) to isolate the cache between Google Tasks and GitHub.

## 3. Testing

- Run `pnpm run local:ci` to verify types and formatting.
- Test the UI: ensure the unified Tasks panel correctly renders both providers and that you can switch between them. Verify that GitHub issues load properly, can be closed/reopened, and navigating to the issue via `webViewLink` works.
