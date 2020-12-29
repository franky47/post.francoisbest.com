import type { NextApiRequest, NextApiResponse } from 'next'
import Metascraper from 'metascraper'
import got from 'got'
import type Cheerio from 'cheerio'

interface RuleArgs {
  htmlDom: typeof Cheerio
  url: string
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
        $('meta[property="twitter:creator"]')
          .attr('content')
          ?.replace(/^@/, ''),
      ({ htmlDom: $ }: RuleArgs) =>
        $('meta[name="twitter:creator"]').attr('content')?.replace(/^@/, ''),
    ],
  },
])

export default async function unfurl(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.query.url as string
  const { body: html } = await got(url)
  const { publisher, ...meta } = await metascraper({ url, html })
  res.json({
    ...meta,
    author: meta.author || publisher,
  })
}
