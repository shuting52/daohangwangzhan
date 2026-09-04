// “最新上新/NEW”徽标与“本地文件书签”识别。
// 新增时间窗口内（默认 7 天）的书签视为上新；本地文件书签 URL 以 /api/file/ 开头。
import type { Bookmark } from '../../shared/types'

export const NEW_BADGE_DAYS = 7
export const RECENT_NEW_DAYS = 7
export const FILE_BOOKMARK_URL_PREFIX = '/api/file/'

export function isWithinNewWindow(createdAt: number | undefined, now: number = Date.now(), days: number = NEW_BADGE_DAYS): boolean {
  if (!createdAt || !Number.isFinite(createdAt)) return false
  if (createdAt > now) return false // 时钟偏差/未来时间戳一律不算上新
  return now - createdAt < days * 24 * 60 * 60 * 1000
}

export function isFileBookmarkUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return url.startsWith(FILE_BOOKMARK_URL_PREFIX)
}

export function isNewBookmark(bookmark: Pick<Bookmark, 'created_at' | 'url'>, now: number = Date.now()): boolean {
  // 本地文件书签不做“上新”徽标（上传行为本身足够显眼）。
  if (isFileBookmarkUrl(bookmark.url)) return false
  return isWithinNewWindow(bookmark.created_at, now)
}

// 在内存中对一组书签做“最近上新”排序裁剪，返回按新→旧排列的前 limit 条。
export function pickRecentNewBookmarks<T extends { created_at?: number }>(
  items: T[],
  limit = 10,
  now: number = Date.now(),
): T[] {
  return items
    .filter((item) => isWithinNewWindow(item.created_at, now, RECENT_NEW_DAYS))
    .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))
    .slice(0, limit)
}
