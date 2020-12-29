import type { Metadata as MetascraperData } from 'metascraper'

export type Metadata = Pick<
  Partial<MetascraperData>,
  'title' | 'description' | 'author' | 'date' | 'image'
> & {
  logo?: string
  lang?: string
}

export async function unfurl(url: string): Promise<Metadata> {
  const apiUrl = `/api/unfurl?url=${encodeURIComponent(url)}`
  const res = await fetch(apiUrl)
  return await res.json()
}
