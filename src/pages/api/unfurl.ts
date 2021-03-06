import type Cheerio from 'cheerio'
import got from 'got'
import Metascraper from 'metascraper'
import type { NextApiRequest, NextApiResponse } from 'next'

interface RuleArgs {
  htmlDom: typeof Cheerio
  url: string
}

function sanitizeTwitterHandle(handle: string | undefined): string | undefined {
  if (!handle) {
    return undefined
  }
  if (handle.includes(' ')) {
    return undefined // Author name rather than handle
  }
  return handle.replace(/^@/, '')
}

const metascraper = Metascraper([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-logo-favicon')(),
  {
    twitter: [
      ({ htmlDom: $ }: RuleArgs) =>
        sanitizeTwitterHandle(
          $('meta[property="twitter:creator"]').attr('content')
        ),
      ({ htmlDom: $ }: RuleArgs) =>
        sanitizeTwitterHandle(
          $('meta[name="twitter:creator"]').attr('content')
        ),
    ],
  },
])

// --

export async function unfurl(url: string) {
  const { body: html } = await got(url, {
    headers: {
      'user-agent': `post.francoisbest.com/api/unfurl (https://github.com/franky47/post.francoisbest.com)`,
    },
  })
  const { publisher, ...meta } = await metascraper({ url, html })
  return {
    ...meta,
    author: meta.author || publisher,
  }
}

// --

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const url = req.query.url as string
  const result = await unfurl(url)
  res.setHeader('cache-control', 'public, max-age:86400')
  res.json(result)
}
