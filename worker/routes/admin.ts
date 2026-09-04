import { Hono } from 'hono'
import { ErrCode } from '../../shared/types'
import { getAdminData, getDataVersion } from '../lib/db'
import { shouldBypassRequestCache } from '../lib/requestCache'
import { fail, ok } from '../lib/response'
import { getCachedAdminData, setCachedAdminData } from '../lib/runtimeCache'
import type { HonoEnv } from '../types'

export const adminRoutes = new Hono<HonoEnv>()

type StatsStorageRow = { storage: string; n: number }

// 站点数据中心：实时聚合统计（分类 / 书签 / 点击 / 上传存储）
adminRoutes.get('/stats', async (c) => {
  try {
    const [categoriesResult, bookmarksResult, clickResult, uploadsResult, storageResult] = await c.env.DB.batch([
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM categories'),
      c.env.DB.prepare(
        'SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN is_private = 1 THEN 1 ELSE 0 END), 0) AS private_n FROM bookmarks',
      ),
      c.env.DB.prepare('SELECT COALESCE(SUM(click_count), 0) AS total FROM bookmarks'),
      c.env.DB.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS bytes FROM uploads'),
      c.env.DB.prepare('SELECT storage, COUNT(*) AS n FROM uploads GROUP BY storage'),
    ])

    const toRow = (result: { results?: unknown[] }): Record<string, number | string | null> =>
      (result.results?.[0] ?? {}) as Record<string, number | string | null>

    const categoriesRow = toRow(categoriesResult)
    const bookmarksRow = toRow(bookmarksResult)
    const clickRow = toRow(clickResult)
    const uploadsRow = toRow(uploadsResult)

    const bookmarks = Number(bookmarksRow.n ?? 0)
    const privateBookmarks = Number(bookmarksRow.private_n ?? 0)
    const uploads = Number(uploadsRow.n ?? 0)
    const bytes = Number(uploadsRow.bytes ?? 0)
    const storageMap = new Map<string, number>()
    for (const row of (storageResult.results ?? []) as StatsStorageRow[]) {
      storageMap.set(row.storage, Number(row.n))
    }

    const stats = {
      categories: Number(categoriesRow.n ?? 0),
      bookmarks,
      publicBookmarks: Math.max(0, bookmarks - privateBookmarks),
      clicks: Number(clickRow.total ?? 0),
      uploads: {
        files: uploads,
        bytes,
        d1Files: storageMap.get('d1') ?? 0,
        r2Files: storageMap.get('r2') ?? 0,
      },
      version: await getDataVersion(c.env.DB),
      generatedAt: Date.now(),
    }

    return c.json(ok(stats), 200, {
      'Cache-Control': 'no-store',
    })
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'failed to load admin stats'))
  }
})

adminRoutes.get('/data', async (c) => {
  try {
    const bypassCache = shouldBypassRequestCache(c.req.header('Cache-Control'), c.req.header('Pragma'))
    if (!bypassCache) {
      const cached = getCachedAdminData()
      if (cached) {
        return c.json(ok(cached), 200, {
          'Cache-Control': 'no-store',
        })
      }
    }

    const data = {
      ...await getAdminData(c.env.DB),
      version: await getDataVersion(c.env.DB),
    }
    if (!bypassCache) {
      setCachedAdminData(data)
    }

    return c.json(ok(data), 200, {
      'Cache-Control': 'no-store',
    })
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'failed to load admin data'))
  }
})

export default adminRoutes
