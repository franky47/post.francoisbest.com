import React from 'react'
import { useRouter } from 'next/router'
import { settings } from 'src/client/settings'
import { useLocalSetting } from 'src/hooks/useLocalSetting'

export function useAuthRedirect() {
  const [token] = useLocalSetting(settings.TOKEN, undefined, false)
  const [fileURL] = useLocalSetting(settings.FILE_URL, undefined, false)
  const router = useRouter()

  React.useEffect(() => {
    if (token && fileURL) {
      return
    }
    router.push('/settings')
  }, [token, fileURL])
}
