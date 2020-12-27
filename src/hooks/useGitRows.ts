import React from 'react'
import { settings, settingsDefaults } from 'src/settings'
import { useLocalSetting } from 'src/hooks/useLocalSetting'

export interface GitRowsResult {
  code: number
  description: string
}

declare global {
  export interface Window {
    Gitrows: Gitrows
  }
}

declare class Gitrows {
  constructor(options: any)
  options: (options: any) => void
  get: (path: string) => Promise<GitRowsResult>
  put: (path: string, data: any) => Promise<GitRowsResult>
  test: (path: string, constraints?: any) => Promise<GitRowsResult>
}

export function useGitRows() {
  const [token] = useLocalSetting(settings.TOKEN)
  const [author] = useLocalSetting(settings.AUTHOR, settingsDefaults.AUTHOR)
  const [branch] = useLocalSetting(settings.BRANCH, settingsDefaults.BRANCH)
  const [user] = useLocalSetting(settings.USERNAME)
  const [gitrows, setGitrows] = React.useState<Gitrows | null>(null)
  React.useEffect(() => {
    const instance = new Gitrows({
      user,
      token,
      branch,
      author,
      strict: true,
    })
    setGitrows(instance)
  }, [token, author, branch, user])
  return gitrows
}

export function useGitRowsPath(repo: string, branch: string, filePath: string) {
  const filePathNoSlash = (filePath ?? '').replace(/^\//, '')
  return `@github/${repo}#${branch}/${filePathNoSlash}`
}

export function useGitRowsTest(constraints?: any) {
  const [repo] = useLocalSetting(settings.REPO_SLUG)
  const [branch] = useLocalSetting(settings.BRANCH, settingsDefaults.BRANCH)
  const gitrows = useGitRows()
  return (filePath: string) => {
    const path = useGitRowsPath(repo, branch, filePath)
    return gitrows!.test(path, constraints)
  }
}

export function useGitRowsPush<T>(filePath: string, columns: (keyof T)[]) {
  const [repo] = useLocalSetting(settings.REPO_SLUG)
  const [branch] = useLocalSetting(settings.BRANCH, settingsDefaults.BRANCH)
  const gitrows = useGitRows()
  return (data: Partial<T>, options: object = {}) => {
    const path = useGitRowsPath(repo, branch, filePath)
    const _options = {
      columns: ['timestamp', ...columns],
      ...options,
    }
    gitrows!.options(_options)
    const payload = { timestamp: Date.now(), ...data }
    // todo: Remove this when gitrows/gitrows#12 is fixed
    for (const column of columns) {
      if (!payload[column]) {
        continue
      }
      // @ts-ignore
      payload[column] = encodeURIComponent(payload[column])
    }
    return gitrows!.put(path, payload)
  }
}
