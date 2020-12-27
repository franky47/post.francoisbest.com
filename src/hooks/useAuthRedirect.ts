import React from 'react'
import { useRouter } from 'next/router'
import { settings } from 'src/settings'
import { useLocalSetting } from 'src/hooks/useLocalSetting'

export function useAuthRedirect() {
  const [token] = useLocalSetting(settings.TOKEN, undefined, false)
  const [repo] = useLocalSetting(settings.REPO_SLUG, undefined, false)
  const [filePath] = useLocalSetting(settings.FILE_PATH, undefined, false)
  const router = useRouter()

  React.useEffect(() => {
    if (token && repo && filePath) {
      return
    }
    router.push('/settings')
  }, [token])
}
