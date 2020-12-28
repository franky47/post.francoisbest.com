import React from 'react'

export interface GitHubURLParts {
  owner: string
  repo: string
  slug: string
  branch: string
  path: string
}

export function useGitHubURL(url: string): GitHubURLParts | null {
  return React.useMemo(() => {
    const regex = /^https:\/\/[\w\.]*(?<ns>github)[\w]*\.com\/(?<owner>[\w-]+)\/(?<repo>[\w\.-]+)\/(?:(?:blob\/)?(?<branch>[\w]+)\/)(?<path>[\w\/\.-]+.(?:csv))/
    const res = regex.exec(url)
    return res
      ? {
          owner: res!.groups!.owner,
          repo: res.groups!.repo,
          slug: `${res.groups!.owner}/${res.groups!.repo}`,
          branch: res.groups!.branch,
          path: res.groups!.path,
        }
      : null
  }, [url])
}
