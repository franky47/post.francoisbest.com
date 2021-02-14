// @ts-ignore
import Gitrows from 'gitrows'
import type { Metadata } from '../client/unfurl'
import { unfurl } from '../pages/api/unfurl'

interface Article extends Metadata {
  url: string
}

function decodeArticle(article: Article): Article {
  for (const key of Object.keys(article) as (keyof Article)[]) {
    if (typeof article[key] !== 'string') {
      continue
    }
    // @ts-ignore
    article[key] = decodeURIComponent(article[key])
  }
  return article
}

// --

export interface LeaderboardEntry<K = string> {
  key: K
  score: number
  percent: number
}

export class CounterMap<K = string> {
  private _map: Map<K, number>

  constructor() {
    this._map = new Map()
  }

  public count(key: K) {
    this._map.set(key, (this._map.get(key) || 0) + 1)
  }

  public get leaderboard(): LeaderboardEntry<K>[] {
    const sum = Array.from(this._map.values()).reduce((s, c) => s + c, 0)
    return Array.from(this._map.entries())
      .map(([key, count]) => ({
        key,
        score: count,
        percent: (100 * count) / sum,
      }))
      .sort((a, b) => b.score - a.score)
  }
}

// --

async function main() {
  const gitrows = new Gitrows()

  console.info('Pulling list of saved articles...')
  const savedArticles: Article[] = (
    (await gitrows.get(
      'https://github.com/franky47/cms/blob/main/reading-list.csv'
    )) ?? []
  ).map(decodeArticle)

  console.info(`Loaded list of saved articles (${savedArticles.length} items)`)

  const failedToLoad: string[] = []

  const liveArticles = (await Promise.all(
    savedArticles.map(async (article) => {
      try {
        return await unfurl(article.url)
      } catch (error) {
        failedToLoad.push(article.url)
        return {}
      }
    })
  )) as Article[]

  console.info(`Loaded live articles metadata (${liveArticles.length} items)`)

  // --

  const minMaxAvgLength = (property: keyof Article, articles: Article[]) => {
    const dataset = articles.filter((article) => !!article[property])
    const { min, max, sum } = dataset.reduce(
      (stats, article) => {
        const length = article[property]!.length
        return {
          min: Math.min(stats.min, length),
          max: Math.max(stats.max, length),
          sum: stats.sum + length,
        }
      },
      { min: Infinity, max: 0, sum: 0 }
    )
    return {
      min,
      max,
      avg: sum / dataset.length,
    }
  }

  const countMissing = (property: keyof Article, articles: Article[]) =>
    articles.filter((article) => !article[property]).length

  const countPresent = (property: keyof Article, articles: Article[]) =>
    articles.filter((article) => !!article[property]).length

  const domainCounter = new CounterMap()
  savedArticles.forEach((article) =>
    domainCounter.count(new URL(article.url).hostname)
  )
  const authorCounter = new CounterMap()
  savedArticles.forEach((article) => {
    if (article.author) {
      authorCounter.count(article.author)
    }
  })

  const stats = {
    articlesCount: savedArticles.length - failedToLoad.length,
    missing: {
      title: countMissing('title', liveArticles),
      description: countMissing('description', liveArticles),
      author: countMissing('author', liveArticles),
      image: countMissing('image', liveArticles),
    },
    unsafeImage: liveArticles.filter((article) =>
      article.image?.startsWith('http://')
    ).length,
    stats: {
      titleLength: minMaxAvgLength('title', savedArticles),
      descriptionLength: minMaxAvgLength('description', savedArticles),
      hasTwitter: countPresent('twitter', liveArticles),
      date: {
        none: countMissing('date', savedArticles),
        dateOnly: liveArticles.filter((article) => {
          if (!article.date) {
            return false
          }
          return article.date.slice(10) === 'T00:00:00.000Z'
        }).length,
        dateTime: liveArticles.filter((article) => {
          if (!article.date) {
            return false
          }
          return article.date.slice(10) !== 'T00:00:00.000Z'
        }).length,
      },
    },
    failedToLoad,
    leaderboards: {
      domain: domainCounter.leaderboard.slice(0, 10),
      author: authorCounter.leaderboard.slice(0, 10),
    },
  }

  console.log(JSON.stringify(stats))
}

main()
