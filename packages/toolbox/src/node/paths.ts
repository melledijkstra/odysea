import os from 'node:os'
import path from 'node:path'
import { nonEmptyString } from '../parse'

export interface XdgDirs {
  configDir: string
  dataDir: string
}

/**
 * Expands a leading `~`, `~/`, or `~\` to the target home directory.
 * Does NOT alter `~user/...` paths or resolve relative paths.
 */
export function expandHomePath(
  filePath: string,
  homeDir: string = os.homedir()
): string {
  if (filePath === '~') {
    return homeDir
  }
  if (filePath.startsWith('~/') || filePath.startsWith('~\\')) {
    return path.join(homeDir, filePath.slice(2))
  }
  return filePath
}

/**
 * Resolves XDG Base Directory paths (`configDir` and `dataDir`) for `appName`.
 * Honors `XDG_CONFIG_HOME` and `XDG_DATA_HOME` (with tilde expansion),
 * falling back to `~/.config/<appName>` and `~/.local/share/<appName>`.
 */
export function resolveXdgDirs(
  appName: string,
  env: NodeJS.ProcessEnv = process.env,
  homeDir: string = os.homedir()
): XdgDirs {
  const xdgConfigHomeRaw = nonEmptyString(env['XDG_CONFIG_HOME'])
  const xdgConfigHome = xdgConfigHomeRaw
    ? path.resolve(expandHomePath(xdgConfigHomeRaw, homeDir))
    : path.join(homeDir, '.config')

  const xdgDataHomeRaw = nonEmptyString(env['XDG_DATA_HOME'])
  const xdgDataHome = xdgDataHomeRaw
    ? path.resolve(expandHomePath(xdgDataHomeRaw, homeDir))
    : path.join(homeDir, '.local', 'share')

  return {
    configDir: path.join(xdgConfigHome, appName),
    dataDir: path.join(xdgDataHome, appName),
  }
}
