import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { expandHomePath, resolveXdgDirs } from './paths'

describe('expandHomePath', () => {
  it('should expand "~" to the given or default home directory', () => {
    expect(expandHomePath('~', '/custom/home')).toBe('/custom/home')
    expect(expandHomePath('~')).toBe(os.homedir())
  })

  it('should expand "~/" and "~\\" paths against homeDir', () => {
    expect(expandHomePath('~/foo/bar', '/custom/home')).toBe(
      path.join('/custom/home', 'foo/bar')
    )
    expect(expandHomePath('~\\foo\\bar', '/custom/home')).toBe(
      path.join('/custom/home', 'foo\\bar')
    )
  })

  it('should not alter "~user" paths', () => {
    expect(expandHomePath('~alice/foo.json', '/custom/home')).toBe(
      '~alice/foo.json'
    )
    expect(expandHomePath('~user', '/custom/home')).toBe('~user')
  })

  it('should return absolute and relative paths untouched', () => {
    expect(expandHomePath('/etc/config', '/custom/home')).toBe('/etc/config')
    expect(expandHomePath('./local/file', '/custom/home')).toBe('./local/file')
    expect(expandHomePath('foo/bar', '/custom/home')).toBe('foo/bar')
  })

  it('should compose cleanly with path.resolve for FileStorage paths', () => {
    expect(path.resolve(expandHomePath('~/test.json', '/custom/home'))).toBe(
      path.resolve('/custom/home', 'test.json')
    )
    expect(
      path.resolve(expandHomePath('~user/test.json', '/custom/home'))
    ).toBe(path.resolve('~user/test.json'))
    expect(path.resolve(expandHomePath('./test.json', '/custom/home'))).toBe(
      path.resolve('./test.json')
    )
  })
})

describe('resolveXdgDirs', () => {
  it('should default to ~/.config/<appName> and ~/.local/share/<appName>', () => {
    const dirs = resolveXdgDirs('odysea', {}, '/home/alice')
    expect(dirs).toEqual({
      configDir: path.join('/home/alice', '.config', 'odysea'),
      dataDir: path.join('/home/alice', '.local', 'share', 'odysea'),
    })
  })

  it('should respect XDG_CONFIG_HOME and XDG_DATA_HOME overrides', () => {
    const dirs = resolveXdgDirs(
      'looper',
      {
        XDG_CONFIG_HOME: '/srv/config',
        XDG_DATA_HOME: '/srv/data',
      },
      '/home/alice'
    )
    expect(dirs).toEqual({
      configDir: path.join(path.resolve('/srv/config'), 'looper'),
      dataDir: path.join(path.resolve('/srv/data'), 'looper'),
    })
  })

  it('should fall back to defaults when XDG env vars are empty or whitespace-only', () => {
    const dirs = resolveXdgDirs(
      'looper',
      {
        XDG_CONFIG_HOME: '',
        XDG_DATA_HOME: '   ',
      },
      '/home/alice'
    )
    expect(dirs).toEqual({
      configDir: path.join('/home/alice', '.config', 'looper'),
      dataDir: path.join('/home/alice', '.local', 'share', 'looper'),
    })
  })

  it('should trim whitespace and expand leading "~/" in XDG overrides', () => {
    const dirs = resolveXdgDirs(
      'looper',
      {
        XDG_CONFIG_HOME: '  ~/my-config  ',
        XDG_DATA_HOME: '  ~/my-data  ',
      },
      '/home/alice'
    )
    expect(dirs).toEqual({
      configDir: path.join(path.resolve('/home/alice', 'my-config'), 'looper'),
      dataDir: path.join(path.resolve('/home/alice', 'my-data'), 'looper'),
    })
  })
})
