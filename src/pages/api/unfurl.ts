import type { NextApiRequest, NextApiResponse } from 'next'
import Metascraper from 'metascraper'
import got from 'got'

const metascraper = Metascraper([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
])

export default async function unfurl(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.query.url as string
  const { body: html } = await got(url)
  const meta = await metascraper({ url, html })
  res.json(meta)
}
