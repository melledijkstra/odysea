# 1. GitHub OAuth in Chrome Extension

Date: 2026-08-05

## Status

Accepted

## Context

We need to add GitHub OAuth to the Odysea Chrome Extension. This authentication will subsequently be used to integrate GitHub Issues and Pull Requests into the personal tasks module. Given the Chrome Extension environment and the desire to keep the architecture simple for a single-user productivity tool, we needed to decide how to handle the OAuth flow, requested scopes, and secure storage of the Client ID and Client Secret.

## Decisions

1. **Authentication Flow:** We will use `chrome.identity.launchWebAuthFlow` for a purely client-side OAuth flow. We will leverage the existing `AuthClient` provided by `@melledijkstra/auth` and `packages/extension/src/auth.ts`.
2. **Scopes:** We will request the `repo` scope to ensure the extension can read and manage tasks across both public and private repositories.
3. **Credentials Management:** Because GitHub's OAuth PKCE implementation still mandates a Client Secret, and we are not using a proxy backend for this integration, the user will manually supply both their GitHub OAuth App Client ID and Client Secret via the extension's Settings UI. These credentials will be stored locally in the extension using the existing `settingsStore.apiKeys`.

## Consequences

- **Positive:** We maintain a serverless, purely client-side architecture for the Chrome Extension which aligns with its current simplicity.
- **Negative:** The user must manually create their own GitHub OAuth App and paste two separate secrets into the extension settings to enable the feature. However, as a personal ecosystem tool, this friction is acceptable.
