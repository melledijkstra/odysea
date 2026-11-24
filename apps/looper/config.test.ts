import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadConfig } from './config.js'
import { createGoogleAuthClient } from './google-auth.js'

describe('loadConfig', () => {
  let tmpDir: string
  let homeDir: string
  let cwdDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'looper-config-test-'))
    homeDir = path.join(tmpDir, 'home')
    cwdDir = path.join(tmpDir, 'cwd')
    fs.mkdirSync(homeDir, { recursive: true })
    fs.mkdirSync(cwdDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('defaults to XDG paths and built-in settings when no files or env vars exist', () => {
    const cfg = loadConfig({ env: {}, argv: [], homeDir, cwd: cwdDir })

    expect(cfg.port).toBe(5050)
    expect(cfg.timezone).toBeUndefined()
    expect(cfg.paths.configDir).toBe(path.join(homeDir, '.config', 'looper'))
    expect(cfg.paths.dataDir).toBe(
      path.join(homeDir, '.local', 'share', 'looper')
    )
    expect(cfg.paths.workflowsDir).toBe(
      path.join(homeDir, '.config', 'looper', 'workflows')
    )
    expect(cfg.paths.dbPath).toBe(
      path.join(homeDir, '.local', 'share', 'looper', 'state.db')
    )
    expect(cfg.paths.tokensPath).toBe(
      path.join(homeDir, '.local', 'share', 'looper', '.tokens.json')
    )
    expect(cfg.paths.logsDir).toBe(
      path.join(homeDir, '.local', 'share', 'looper', 'logs')
    )
    expect(cfg.paths.sharedSecretsFile).toBe(
      path.join(homeDir, '.config', 'odysea', 'secrets.env')
    )
    expect(cfg.paths.configFile).toBeNull()
    expect(cfg.google).toEqual({
      configured: false,
      clientId: null,
      clientSecret: undefined,
      redirectUri: 'http://localhost:5050/oauth/callback',
      scopes: ['openid', 'profile', 'email'],
      credentialsSource: 'none',
    })
  })

  it('respects XDG_CONFIG_HOME and XDG_DATA_HOME', () => {
    const cfg = loadConfig({
      env: {
        XDG_CONFIG_HOME: path.join(tmpDir, 'custom-config'),
        XDG_DATA_HOME: path.join(tmpDir, 'custom-data'),
      },
      argv: [],
      homeDir,
      cwd: cwdDir,
    })

    expect(cfg.paths.configDir).toBe(
      path.join(tmpDir, 'custom-config', 'looper')
    )
    expect(cfg.paths.dataDir).toBe(path.join(tmpDir, 'custom-data', 'looper'))
    expect(cfg.paths.sharedSecretsFile).toBe(
      path.join(tmpDir, 'custom-config', 'odysea', 'secrets.env')
    )
  })

  it('loads non-secret settings from config.yaml and resolves relative paths against configDir', () => {
    const configDir = path.join(homeDir, '.config', 'looper')
    fs.mkdirSync(configDir, { recursive: true })
    fs.writeFileSync(
      path.join(configDir, 'config.yaml'),
      [
        'port: 6060',
        'timezone: Europe/Amsterdam',
        'workflowsDir: ./my-workflows',
        'dataDir: ~/custom-looper-data',
        'google:',
        '  redirectUri: http://localhost:6060/oauth/callback',
        '  scopes:',
        '    - openid',
        '    - https://www.googleapis.com/auth/gmail.send',
      ].join('\n'),
      'utf8'
    )

    const cfg = loadConfig({ env: {}, argv: [], homeDir, cwd: cwdDir })

    expect(cfg.port).toBe(6060)
    expect(cfg.timezone).toBe('Europe/Amsterdam')
    expect(cfg.paths.workflowsDir).toBe(path.join(configDir, 'my-workflows'))
    expect(cfg.paths.dataDir).toBe(path.join(homeDir, 'custom-looper-data'))
    expect(cfg.google.redirectUri).toBe('http://localhost:6060/oauth/callback')
    expect(cfg.google.scopes).toEqual([
      'openid',
      'https://www.googleapis.com/auth/gmail.send',
    ])
  })

  it('falls back through layered secrets: env > app .env > shared secrets.env', () => {
    const sharedDir = path.join(homeDir, '.config', 'odysea')
    const configDir = path.join(homeDir, '.config', 'looper')
    fs.mkdirSync(sharedDir, { recursive: true })
    fs.mkdirSync(configDir, { recursive: true })

    fs.writeFileSync(
      path.join(sharedDir, 'secrets.env'),
      [
        'GOOGLE_CLIENT_ID=shared-client-id',
        'GOOGLE_CLIENT_SECRET=shared-secret',
      ].join('\n'),
      'utf8'
    )

    // 1. Picks up shared dotfiles secrets automatically
    const fromShared = loadConfig({ env: {}, argv: [], homeDir, cwd: cwdDir })
    expect(fromShared.google.configured).toBe(true)
    expect(fromShared.google.clientId).toBe('shared-client-id')
    expect(fromShared.google.clientSecret).toBe('shared-secret')
    expect(fromShared.google.credentialsSource).toBe('shared-secrets')

    // 2. App-specific .env overrides shared secrets (while blank lines fall back)
    fs.writeFileSync(
      path.join(configDir, '.env'),
      ['GOOGLE_CLIENT_ID=app-client-id', 'GOOGLE_CLIENT_SECRET='].join('\n'),
      'utf8'
    )

    const fromAppEnv = loadConfig({ env: {}, argv: [], homeDir, cwd: cwdDir })
    expect(fromAppEnv.google.clientId).toBe('app-client-id')
    expect(fromAppEnv.google.clientSecret).toBe('shared-secret')
    expect(fromAppEnv.google.credentialsSource).toBe('app-env')

    // 3. Process environment overrides both files
    const fromEnv = loadConfig({
      env: {
        GOOGLE_CLIENT_ID: 'env-client-id',
        GOOGLE_CLIENT_SECRET: 'env-secret',
      },
      argv: [],
      homeDir,
      cwd: cwdDir,
    })
    expect(fromEnv.google.clientId).toBe('env-client-id')
    expect(fromEnv.google.clientSecret).toBe('env-secret')
    expect(fromEnv.google.credentialsSource).toBe('env')
  })

  it('prioritizes CLI --port over PORT env var and config.yaml', () => {
    const configDir = path.join(homeDir, '.config', 'looper')
    fs.mkdirSync(configDir, { recursive: true })
    fs.writeFileSync(path.join(configDir, 'config.yaml'), 'port: 7000\n')

    const cfg = loadConfig({
      env: { PORT: '7001' },
      argv: ['node', 'index.ts', '--port', '7002'],
      homeDir,
      cwd: cwdDir,
    })

    expect(cfg.port).toBe(7002)
    expect(cfg.google.redirectUri).toBe('http://localhost:7002/oauth/callback')
  })

  it('supports isolated dev overrides using relative LOOPER_CONFIG_DIR and LOOPER_DATA_DIR', () => {
    const cfg = loadConfig({
      env: {
        LOOPER_CONFIG_DIR: '.',
        LOOPER_DATA_DIR: '.',
      },
      argv: [],
      homeDir,
      cwd: cwdDir,
    })

    expect(cfg.paths.configDir).toBe(cwdDir)
    expect(cfg.paths.dataDir).toBe(cwdDir)
    expect(cfg.paths.workflowsDir).toBe(path.join(cwdDir, 'workflows'))
    expect(cfg.paths.dbPath).toBe(path.join(cwdDir, 'state.db'))
  })

  it('returns null from createGoogleAuthClient when credentials are not configured', () => {
    const cfg = loadConfig({ env: {}, argv: [], homeDir, cwd: cwdDir })
    expect(createGoogleAuthClient(cfg)).toBeNull()
  })

  it('constructs GoogleAuthClient when credentials are configured', () => {
    const cfg = loadConfig({
      env: {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
      },
      argv: [],
      homeDir,
      cwd: cwdDir,
    })

    const client = createGoogleAuthClient(cfg)
    expect(client).not.toBeNull()
    expect(fs.existsSync(cfg.paths.dataDir)).toBe(true)
  })
})
