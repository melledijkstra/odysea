# Looper Workflow Guide

This document explains how to author, configure, and manage automation workflows in **Looper** (`apps/looper`).

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow File Structure](#workflow-file-structure)
3. [Triggers](#triggers)
   - [Cron Trigger](#1-cron-trigger)
   - [Webhook Trigger](#2-webhook-trigger)
   - [Active Time Trigger](#3-active-time-trigger)
4. [Steps & Actions](#steps--actions)
   - [Built-in Actions](#built-in-actions)
   - [Step Execution Context](#step-execution-context)
5. [Arguments & Template Interpolation](#arguments--template-interpolation)
   - [How Interpolation Works](#how-interpolation-works)
   - [Interpolation Modes](#interpolation-modes)
   - [Deep & Nested Structures](#deep--nested-structures)
   - [Step-by-Step Data Flow Example](#step-by-step-data-flow-example)
6. [Registering New Actions](#registering-new-actions)
7. [Running & Debugging Workflows](#running--debugging-workflows)

---

## Overview

Looper executes declarative workflows defined in YAML files located in the `apps/looper/workflows/` directory.

- **Dynamic Loading & Hot Reloading**: The workflow scheduler uses [Chokidar](https://github.com/paulmillr/chokidar) to watch the `workflows/` directory. Creating, modifying, or removing `.yaml` / `.yml` files automatically registers, updates, or unregisters workflows in real time without restarting the application.
- **Persistent Execution State**: Execution history (timestamps, status, names) is tracked in SQLite (`state.db`) via `better-sqlite3`.
- **Clock Drift & Sleep Detection**: Looper monitors system sleep/wake events. If the system wakes up and scheduled runs were missed during sleep, Looper automatically triggers catch-up executions.

---

## Workflow File Structure

Workflows are authored as YAML files placed in `apps/looper/workflows/`.

```yaml
id: simple-reminder
name: Simple Hourly Reminder
trigger:
  type: active_time
  duration: 2700 # 45 minutes
steps:
  - id: notifyStep
    action: system.notify
    args:
      title: 'Hourly Check-in'
      message: 'Time for your check-in! Stay hydrated and take a quick stretch.'
```

### Top-Level Schema

| Field     | Type     | Required | Description                                                                                                                             |
| :-------- | :------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | `string` | No       | Unique workflow identifier. If omitted, defaults to the filename without the file extension (e.g. `daily-check.yaml` -> `daily-check`). |
| `name`    | `string` | **Yes**  | Human-readable name displayed in logs, emails, notifications, and the `/status` API.                                                    |
| `trigger` | `object` | **Yes**  | Trigger definition configuration (see [Triggers](#triggers)).                                                                           |
| `steps`   | `array`  | **Yes**  | Ordered list of sequential actions to execute (see [Steps & Actions](#steps--actions)).                                                 |

---

## Triggers

Looper currently supports three trigger types: `cron`, `webhook`, and `active_time`.

### 1. Cron Trigger

Runs workflows according to a standard 5-part cron expression.

```yaml
trigger:
  type: cron
  expression: '0 8 * * *' # Every day at 8:00 AM
```

- **Timezone**: Set the `TZ` environment variable (e.g. `TZ=Europe/Amsterdam`) in `.env` or system environment to execute at the appropriate local time.
- **Missed Run Catch-up**: On scheduler startup or after system wake, Looper calculates if a scheduled run was missed since the last recorded execution in `state.db`. If missed, it immediately triggers a catch-up execution.

### 2. Webhook Trigger

Allows a workflow to be triggered on-demand by sending an HTTP `POST` request to Looper's Express server.

```yaml
trigger:
  type: webhook
```

#### Triggering via HTTP:

Send a `POST` request to `/webhook` with the target `workflowId`:

```bash
curl -X POST http://localhost:5050/webhook \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "simple-webhook"}'
```

Response:

```json
{
  "success": true,
  "message": "Workflow simple-webhook triggered via webhook.",
  "timestamp": 1725724800000
}
```

### 3. Active Time Trigger

Tracks the user's active keyboard/mouse usage and triggers when accumulated screen-time reaches a given duration.

> [!NOTE]
> Active time tracking currently monitors HID idle time via `ioreg` and is supported on **macOS**.

```yaml
trigger:
  type: active_time
  duration: 2700 # Target active time in seconds (e.g., 45 minutes)
  idleLimit: 60 # (Optional) Seconds of inactivity before pausing accumulation (default: 60)
  resetLimit: 300 # (Optional) Seconds of inactivity before resetting timer to 0 (default: 300)
```

- **Accumulation**: While system idle time is less than `idleLimit` (default 60s), active seconds accumulate.
- **Pausing**: When idle time exceeds `idleLimit`, active accumulation pauses.
- **Resetting**: If the user is away from their computer for longer than `resetLimit` (default 300s / 5 minutes), the accumulated active time resets back to 0.
- **Trigger**: Once accumulated active seconds reach `duration`, the workflow executes, and the counter resets.

---

## Steps & Actions

The `steps` field is a sequential array of action steps. Each step executes in order:

```yaml
steps:
  - id: stepOne
    action: google.getUserInfo
  - id: stepTwo
    action: system.notify
    args:
      title: 'Hello'
      message: 'User is {{ stepOne.output.name }}'
```

### Step Schema

| Field    | Type     | Required | Description                                                                                                                |
| :------- | :------- | :------- | :------------------------------------------------------------------------------------------------------------------------- |
| `id`     | `string` | **Yes**  | Identifier for the step. Outputs from this step are saved under `context[id].output` and can be referenced in later steps. |
| `action` | `string` | **Yes**  | The key of the registered action in `actionRegistry`.                                                                      |
| `args`   | `object` | No       | Arguments passed to the action function. Supports interpolation.                                                           |

### Built-in Actions

| Action               | Required Arguments                            | Description                                                                                   | Output                              |
| :------------------- | :-------------------------------------------- | :-------------------------------------------------------------------------------------------- | :---------------------------------- |
| `system.notify`      | `message: string`<br>`title?: string`         | Dispatches a native desktop notification with sound. Default title: `Looper: <workflowName>`. | `void`                              |
| `google.getUserInfo` | _(None required in YAML)_                     | Calls Google OAuth2 UserInfo API using stored tokens.                                         | `{ email?: string, name?: string }` |
| `google.sendEmail`   | `userInfo: { email?: string, name?: string }` | Sends an execution notification email via the Gmail API to the specified recipient.           | `void`                              |

### Step Execution Context

Every action function receives an `ActionContext` (`ctx`) object containing runtime metadata:

- `ctx.workflowName`: Name of the active workflow.
- `ctx.workflowId`: ID of the active workflow.
- `ctx.reason`: Trigger reason (e.g., `"cron Scheduled Run"`, `"Webhook Trigger"`, `"Catch-up Cron Scheduled Run"`).
- `ctx.port`: HTTP port Looper is listening on (useful for OAuth callback URLs).

---

## Arguments & Template Interpolation

Looper features a runtime template interpolation engine (`WorkflowEngine.interpolate`) that resolves variable placeholders before passing arguments to action functions.

### How Interpolation Works

When a step completes, its return value is stored in the execution context under the step's `id`:

```typescript
context[step.id] = { output: result }
```

Subsequent steps can access properties on `output` using dot-notation paths enclosed in double curly braces:

```
{{ <stepId>.output.<propertyName> }}
```

### Interpolation Modes

#### 1. Exact Match (Type-Preserving)

If an argument value is a string containing **only** a template expression (with optional surrounding whitespace), the engine resolves the path and **preserves the original type** (object, number, boolean, array, etc.):

```yaml
steps:
  - id: getUser
    action: google.getUserInfo

  - id: sendMail
    action: google.sendEmail
    args:
      # Passes the exact UserInfo object returned by getUser, not a string
      userInfo: '{{ getUser.output }}'
```

```yaml
# Resolves to a number (25), not the string "25"
count: '{{ fetchStats.output.totalCount }}'
```

#### 2. Embedded String Interpolation

If a template expression is mixed with other text, or if multiple expressions exist in a single string, the engine replaces each occurrence with its stringified value:

```yaml
args:
  title: 'Welcome {{ getUserInfo.output.name }}!'
  message: 'Notification sent to {{ getUserInfo.output.email }}.'
```

#### 3. Unresolved Placeholders

If a path does not exist in the context (resolves to `undefined`), the placeholder is left as-is (e.g. `'{{ unknown.output }}'`) to avoid crashing or silently swallowing missing parameters.

### Deep & Nested Structures

Interpolation recursively traverses nested objects and arrays:

```yaml
args:
  userInfo:
    email: '{{ getUserInfo.output.email }}'
    name: '{{ getUserInfo.output.name }}'
  tags:
    - '{{ getMetadata.output.primaryTag }}'
    - 'automated'
```

### Step-by-Step Data Flow Example

Here is a complete multi-step workflow illustrating how outputs flow from one step to the next:

```yaml
id: daily-digest
name: Daily Summary Email
trigger:
  type: cron
  expression: '0 9 * * 1-5' # Weekdays at 9:00 AM

steps:
  # Step 1: Query Google user information
  - id: userInfoStep
    action: google.getUserInfo

  # Step 2: Display desktop notification using user details
  - id: notifyStep
    action: system.notify
    args:
      title: 'Good Morning'
      message: 'Running morning digest for {{ userInfoStep.output.name }}'

  # Step 3: Send an email passing the extracted userInfo object
  - id: emailStep
    action: google.sendEmail
    args:
      userInfo:
        email: '{{ userInfoStep.output.email }}'
        name: '{{ userInfoStep.output.name }}'
```

**Context Evolution during Execution:**

1. **Before Step 1**:
   ```javascript
   context = {}
   ```
2. **After Step 1 (`userInfoStep`)**:
   ```javascript
   context = {
     userInfoStep: {
       output: {
         name: 'Melle Dijkstra',
         email: 'melle@example.com',
       },
     },
   }
   ```
3. **Step 2 (`notifyStep`) Args Interpolation**:
   - `title`: `'Good Morning'`
   - `message`: `'Running morning digest for Melle Dijkstra'`
4. **Step 3 (`emailStep`) Args Interpolation**:
   - `userInfo.email`: `'melle@example.com'`
   - `userInfo.name`: `'Melle Dijkstra'`

---

## Registering New Actions

To add a new action that workflows can call:

1. **Implement the Action**:
   Create a function in `apps/looper/actions/<action-name>.ts`:

   ```typescript
   import type { ActionContext } from '../types/actions.js'
   import { Logger } from '@melledijkstra/toolbox'

   const logger = new Logger('MyCustomAction')

   interface MyActionArgs {
     targetUrl: string
   }

   export async function myCustomAction(
     ctx: ActionContext,
     args: MyActionArgs
   ) {
     logger.log(`Executing ${ctx.workflowName} with target: ${args.targetUrl}`)
     const response = await fetch(args.targetUrl)
     const data = await response.json()
     return { status: response.status, data }
   }
   ```

2. **Register the Action**:
   In `apps/looper/actions/registry.ts`, add the action to `actionRegistry`:

   ```typescript
   import { myCustomAction } from './my-custom-action.js'

   export const actionRegistry: ActionRegistry = {
     // ... existing actions
     'custom.fetchData': myCustomAction,
   }
   ```

   > [!TIP]
   > For Google API actions requiring authentication, wrap the handler using the `withGoogleAuth` helper in `registry.ts`.

3. **Use in Workflow**:
   ```yaml
   steps:
     - id: fetchStep
       action: custom.fetchData
       args:
         targetUrl: 'https://api.github.com/zen'
   ```

---

## Running & Debugging Workflows

### Development Server

Start Looper in watch mode:

```bash
pnpm --filter looper dev
# Or from apps/looper:
pnpm dev
```

### Inspecting Workflow Status

Looper exposes a status endpoint at `http://localhost:5050/status` (or port specified via `--port`):

```bash
curl http://localhost:5050/status
```

The response includes:

- All loaded workflows and their parsed triggers.
- Human-readable cron schedule descriptions.
- `nextRunAt` timestamps.
- `lastExecutedAt` timestamps and elapsed milliseconds.
- Google OAuth authentication status and login URL.

### Triggering Webhooks Manually

```bash
curl -X POST http://localhost:5050/webhook \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "<workflow-id>"}'
```

### Google OAuth Setup

If your workflows use Google actions (`google.getUserInfo`, `google.sendEmail`):

1. Open `http://localhost:5050/auth/google` in your browser.
2. Complete the OAuth consent flow.
3. Looper stores the refresh and access tokens locally in `.tokens.json`.
