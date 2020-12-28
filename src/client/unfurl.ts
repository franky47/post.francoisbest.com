import type { Metadata } from 'metascraper'

export async function unfurl(url: string): Promise<Metadata> {
  const apiUrl = `/api/unfurl?url=${encodeURIComponent(url)}`
  const res = await fetch(apiUrl)
  return await res.json()
}
