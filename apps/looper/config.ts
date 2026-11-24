import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import dotenv from 'dotenv'
import yaml from 'js-yaml'
import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('LooperConfig')

export type CredentialsSource = 'env' | 'app-env' | 'shared-secrets' | 'none'

export interface LooperPaths {
  configDir: string
  dataDir: string
  workflowsDir: string
  configFile: string | null
  appEnvFile: string
  sharedSecretsFile: string
  dbPath: string
  tokensPath: string
  logsDir: string
}

export interface LooperGoogleConfig {
  configured: boolean
  clientId: string | null
  clientSecret: string | undefined
  redirectUri: string
  scopes: string[]
  credentialsSource: CredentialsSource
}

export interface LooperConfig {
  port: number
  timezone: string | undefined
  paths: LooperPaths
  google: LooperGoogleConfig
}

export interface LoadConfigOptions {
  env?: NodeJS.ProcessEnv
  argv?: string[]
  homeDir?: string
  cwd?: string
}

interface RawGoogleConfigFile {
  redirectUri?: unknown
  scopes?: unknown
}

interface RawConfigFile {
  port?: unknown
  timezone?: unknown
  workflowsDir?: unknown
  dataDir?: unknown
  secretsFile?: unknown
  google?: unknown
}

const DEFAULT_PORT = 5050
const DEFAULT_GOOGLE_SCOPES = ['openid', 'profile', 'email']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function expandPath(rawPath: string, homeDir: string, baseDir: string): string {
  if (rawPath === '~') return homeDir
  if (rawPath.startsWith('~/') || rawPath.startsWith('~\\')) {
    return path.join(homeDir, rawPath.slice(2))
  }
  return path.resolve(baseDir, rawPath)
}

function parsePort(value: unknown): number | undefined {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 65535
  ) {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10)
      if (parsed > 0 && parsed <= 65535) return parsed
    }
  }
  return undefined
}

function parseScopes(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const scopes = value
      .map((item) => nonEmptyString(item))
      .filter((item): item is string => item !== undefined)
    return scopes.length > 0 ? scopes : undefined
  }
  const asString = nonEmptyString(value)
  if (asString) {
    const scopes = asString.split(/\s+/).filter(Boolean)
    return scopes.length > 0 ? scopes : undefined
  }
  return undefined
}

function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {}
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return dotenv.parse(content)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to read env file ${filePath}: ${message}`)
    return {}
  }
}

function findConfigFile(configDir: string): string | null {
  for (const filename of ['config.yaml', 'config.yml']) {
    const candidate = path.join(configDir, filename)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function readConfigFile(filePath: string | null): RawConfigFile {
  if (!filePath) return {}
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed: unknown = yaml.load(content)
    if (parsed === null || parsed === undefined) return {}
    if (!isRecord(parsed)) {
      logger.error(`Invalid config file (expected YAML mapping): ${filePath}`)
      return {}
    }
    return parsed as RawConfigFile
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to parse config file ${filePath}: ${message}`)
    return {}
  }
}

function readCliPort(argv: string[]): number | undefined {
  const cliPortIndex = argv.indexOf('--port')
  if (cliPortIndex === -1) return undefined
  return parsePort(argv[cliPortIndex + 1])
}

/**
 * Loads Looper configuration, paths, and layered secrets without mutating global state.
 *
 * Precedence (highest to lowest):
 * 1. CLI flags (`--port`) & process environment variables
 * 2. App-specific `.env` (`<configDir>/.env`)
 * 3. Shared Odysea secrets (`~/.config/odysea/secrets.env` or `ODYSEA_SECRETS_FILE`)
 * 4. Non-secret config file (`<configDir>/config.yaml`)
 * 5. Built-in defaults
 */
export function loadConfig(options: LoadConfigOptions = {}): LooperConfig {
  const env = options.env ?? process.env
  const argv = options.argv ?? process.argv
  const homeDir = options.homeDir ?? os.homedir()
  const cwd = options.cwd ?? process.cwd()

  const xdgConfigHome = nonEmptyString(env['XDG_CONFIG_HOME'])
    ? expandPath(env['XDG_CONFIG_HOME'] as string, homeDir, cwd)
    : path.join(homeDir, '.config')

  const xdgDataHome = nonEmptyString(env['XDG_DATA_HOME'])
    ? expandPath(env['XDG_DATA_HOME'] as string, homeDir, cwd)
    : path.join(homeDir, '.local', 'share')

  const configDir = nonEmptyString(env['LOOPER_CONFIG_DIR'])
    ? expandPath(env['LOOPER_CONFIG_DIR'] as string, homeDir, cwd)
    : path.join(xdgConfigHome, 'looper')

  const configFile = findConfigFile(configDir)
  const fileConfig = readConfigFile(configFile)

  const fileGoogle: RawGoogleConfigFile = isRecord(fileConfig.google)
    ? (fileConfig.google as RawGoogleConfigFile)
    : {}

  const dataDir = nonEmptyString(env['LOOPER_DATA_DIR'])
    ? expandPath(env['LOOPER_DATA_DIR'] as string, homeDir, cwd)
    : nonEmptyString(fileConfig.dataDir)
      ? expandPath(fileConfig.dataDir as string, homeDir, configDir)
      : path.join(xdgDataHome, 'looper')

  const workflowsDir = nonEmptyString(env['LOOPER_WORKFLOWS_DIR'])
    ? expandPath(env['LOOPER_WORKFLOWS_DIR'] as string, homeDir, cwd)
    : nonEmptyString(fileConfig.workflowsDir)
      ? expandPath(fileConfig.workflowsDir as string, homeDir, configDir)
      : path.join(configDir, 'workflows')

  const appEnvFile = path.join(configDir, '.env')
  const sharedSecretsFile = nonEmptyString(env['ODYSEA_SECRETS_FILE'])
    ? expandPath(env['ODYSEA_SECRETS_FILE'] as string, homeDir, cwd)
    : nonEmptyString(fileConfig.secretsFile)
      ? expandPath(fileConfig.secretsFile as string, homeDir, configDir)
      : path.join(xdgConfigHome, 'odysea', 'secrets.env')

  const appEnvVars = readEnvFile(appEnvFile)
  const sharedSecretsVars = readEnvFile(sharedSecretsFile)

  const resolveEnvVar = (
    key: string
  ): { value: string | undefined; source: CredentialsSource } => {
    const fromProcess = nonEmptyString(env[key])
    if (fromProcess !== undefined) {
      return { value: fromProcess, source: 'env' }
    }
    const fromAppEnv = nonEmptyString(appEnvVars[key])
    if (fromAppEnv !== undefined) {
      return { value: fromAppEnv, source: 'app-env' }
    }
    const fromShared = nonEmptyString(sharedSecretsVars[key])
    if (fromShared !== undefined) {
      return { value: fromShared, source: 'shared-secrets' }
    }
    return { value: undefined, source: 'none' }
  }

  const port =
    readCliPort(argv) ??
    parsePort(resolveEnvVar('PORT').value) ??
    parsePort(fileConfig.port) ??
    DEFAULT_PORT

  const timezone =
    resolveEnvVar('TZ').value ?? nonEmptyString(fileConfig.timezone)

  const clientIdResult = resolveEnvVar('GOOGLE_CLIENT_ID')
  const clientId = clientIdResult.value ?? null
  const clientSecret = resolveEnvVar('GOOGLE_CLIENT_SECRET').value
  const redirectUri =
    resolveEnvVar('GOOGLE_REDIRECT_URI').value ??
    nonEmptyString(fileGoogle.redirectUri) ??
    `http://localhost:${port}/oauth/callback`

  const scopes =
    parseScopes(resolveEnvVar('GOOGLE_SCOPES').value) ??
    parseScopes(fileGoogle.scopes) ??
    DEFAULT_GOOGLE_SCOPES

  return {
    port,
    timezone,
    paths: {
      configDir,
      dataDir,
      workflowsDir,
      configFile,
      appEnvFile,
      sharedSecretsFile,
      dbPath: path.join(dataDir, 'state.db'),
      tokensPath: path.join(dataDir, '.tokens.json'),
      logsDir: path.join(dataDir, 'logs'),
    },
    google: {
      configured: clientId !== null,
      clientId,
      clientSecret,
      redirectUri,
      scopes,
      credentialsSource: clientIdResult.source,
    },
  }
}

export const config: LooperConfig = loadConfig()
