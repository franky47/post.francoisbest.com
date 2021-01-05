import React from 'react'
import { settings, settingsDefaults } from 'src/client/settings'
import { useLocalSetting } from 'src/hooks/useLocalSetting'
import { useGitHubURL } from 'src/hooks/useGitHubURL'
import { Metadata } from 'src/client/unfurl'

export interface GitRowsResult {
  code: number
  description: string
}

declare global {
  export interface Window {
    Gitrows: Gitrows
  }
}

export interface Row extends Metadata {
  url: string
  timestamp: number
}

declare class Gitrows {
  constructor(options: any)
  options: (options: any) => void
  get: (path: string, filters?: any) => Promise<Row[]>
  put: (path: string, data: any) => Promise<GitRowsResult>
  test: (path: string, constraints?: any) => Promise<GitRowsResult>
}

export function useGitRows() {
  const [token] = useLocalSetting(settings.TOKEN)
  const [fileURL] = useLocalSetting(settings.FILE_URL)
  const [author] = useLocalSetting(settings.AUTHOR, settingsDefaults.AUTHOR)
  const [user] = useLocalSetting(settings.USERNAME)
  const [gitrows, setGitrows] = React.useState<Gitrows | null>(null)
  const meta = useGitHubURL(fileURL)
  React.useEffect(() => {
    const instance = new Gitrows({
      user,
      token,
      branch: meta?.branch ?? undefined,
      author,
      strict: true,
    })
    setGitrows(instance)
  }, [token, author, user, meta])
  return gitrows
}

export function useGitRowsTest() {
  const [fileUrl] = useLocalSetting(settings.FILE_URL)
  const gitrows = useGitRows()
  return () => {
    return gitrows!.test(fileUrl)
  }
}

export function useGitRowsGet() {
  const [fileUrl] = useLocalSetting(settings.FILE_URL)
  const gitrows = useGitRows()
  return React.useCallback(async () => {
    return (await gitrows?.get(fileUrl)) ?? []
  }, [gitrows])
}

export function useGitRowsHasURL() {
  const get = useGitRowsGet()
  return React.useCallback(
    async (url: string) => {
      const ref = encodeURIComponent(url)
      const res = await get()
      return res.some((row) => row.url === ref)
    },
    [get]
  )
}

export function useGitRowsPush<T>(columns: (keyof T)[]) {
  const [fileUrl] = useLocalSetting(settings.FILE_URL)
  const gitrows = useGitRows()
  return (data: Partial<T>, options: object = {}) => {
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
    return gitrows!.put(fileUrl, payload)
  }
}
