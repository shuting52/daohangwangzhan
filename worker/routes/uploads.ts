// 文件上传与文件管理（任意文件：图片/视频/md/APK/文档等）
//
// 存储策略：
//  - 配置了 R2（env.UPLOADS）时优先写入 R2，元数据存 D1；
//  - 未配置 R2 时回退 D1 base64 存储（单文件上限 25MB）。
import { Hono } from 'hono'
import { ErrCode, type UploadFile, type UploadKind, type UploadListResp } from '../../shared/types'
import { fail, ok } from '../lib/response'
import { badRequest, parseId } from '../lib/routeHelpers'
import type { HonoEnv } from '../types'

// D1 回退存储单文件上限（base64 后约 33MB，D1 单值可承受；超出请配置 R2）
const D1_MAX_BYTES = 25 * 1024 * 1024
// R2 模式单文件上限（R2 本身无限制，此值仅为防滥用兜底）
const R2_MAX_BYTES = 512 * 1024 * 1024
const PAGE_SIZE = 24

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/ico', 'image/x-icon'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'])
const MD_TYPES = new Set(['text/markdown', 'text/plain', 'text/x-markdown', 'application/octet-stream'])
const APK_TYPES = new Set(['application/vnd.android.package-archive', 'application/x-apk', 'application/octet-stream'])
const APK_EXT = /\.(apk|ipa|xapk)$/

function detectKind(contentType: string, filename: string): UploadKind {
  const lower = filename.toLowerCase()
  if (IMAGE_TYPES.has(contentType) || /\.(jpe?g|png|gif|webp|svg|bmp|ico)$/.test(lower)) return 'image'
  if (VIDEO_TYPES.has(contentType) || /\.(mp4|webm|ogv|mov|avi|mkv)$/.test(lower)) return 'video'
  if (MD_TYPES.has(contentType) || /\.(md|markdown|mdown|txt)$/.test(lower)) return 'md'
  if (APK_TYPES.has(contentType) || APK_EXT.test(lower)) return 'other'
  // 其余任意文件统一归类为 other，不做类型限制
  return 'other'
}

function safeFilename(filename: string): string {
  const base = filename.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(-200)
  return base || 'unnamed'
}

function toUploadFile(row: {
  id: number
  filename: string
  content_type: string
  size: number
  kind: string
  storage: string
  created_at: number
}): UploadFile {
  return {
    id: row.id,
    filename: row.filename,
    content_type: row.content_type,
    size: row.size,
    kind: row.kind as UploadKind,
    storage: row.storage as UploadFile['storage'],
    created_at: row.created_at,
  }
}

export const uploadsRoutes = new Hono<HonoEnv>()

// 上传文件（multipart/form-data，字段名 file）
uploadsRoutes.post('/', async (c) => {
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    return badRequest(c, 'invalid form data')
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return badRequest(c, 'missing file')
  }

  const filename = safeFilename(file.name || 'upload')
  const contentType = file.type || 'application/octet-stream'
  const kind = detectKind(contentType, filename)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const size = bytes.byteLength
  const useR2 = Boolean(c.env.UPLOADS)

  if (useR2) {
    if (size > R2_MAX_BYTES) {
      return badRequest(c, 'file too large (max 512MB)')
    }
    const r2Key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`
    await c.env.UPLOADS!.put(r2Key, bytes, { httpMetadata: { contentType } })

    const created = await c.env.DB.prepare(
      'INSERT INTO uploads (filename, content_type, size, kind, storage, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(filename, contentType, size, kind, 'r2', r2Key, Date.now())
      .run()
    const id = created.meta.last_row_id

    const row = await c.env.DB.prepare(
      'SELECT id, filename, content_type, size, kind, storage, created_at FROM uploads WHERE id = ?',
    ).bind(id).first<{
      id: number
      filename: string
      content_type: string
      size: number
      kind: string
      storage: string
      created_at: number
    }>()
    return c.json(ok(row ? toUploadFile(row) : null))
  }

  // D1 回退：base64 存储
  if (size > D1_MAX_BYTES) {
    return badRequest(c, 'file too large for D1 storage (max 25MB), configure R2 for bigger files')
  }

  let base64 = ''
  try {
    base64 = bytesToBase64(bytes)
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'failed to encode file'))
  }

  const created = await c.env.DB.prepare(
    'INSERT INTO uploads (filename, content_type, size, kind, storage, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(filename, contentType, size, kind, 'd1', base64, Date.now())
    .run()
  const id = created.meta.last_row_id

  const row = await c.env.DB.prepare(
    'SELECT id, filename, content_type, size, kind, storage, created_at FROM uploads WHERE id = ?',
  ).bind(id).first<{
    id: number
    filename: string
    content_type: string
    size: number
    kind: string
    storage: string
    created_at: number
  }>()
  return c.json(ok(row ? toUploadFile(row) : null))
})

// 文件列表（分页，按时间倒序）
uploadsRoutes.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const [{ results }, countRow] = await Promise.all([
    c.env.DB.prepare(
      'SELECT id, filename, content_type, size, kind, storage, created_at FROM uploads ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
    ).bind(PAGE_SIZE, offset).all<{
      id: number
      filename: string
      content_type: string
      size: number
      kind: string
      storage: string
      created_at: number
    }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS total FROM uploads').first<{ total: number }>(),
  ])

  const resp: UploadListResp = {
    items: (results ?? []).map(toUploadFile),
    total: Number(countRow?.total ?? 0),
  }
  return c.json(ok(resp))
})

// 读取文件内容（公开，用于预览/引用）
export const uploadContentRoutes = new Hono<HonoEnv>()

uploadContentRoutes.get('/:id/content', async (c) => {
  const id = parseId(c)
  if (!id) return badRequest(c, 'invalid id')

  const row = await c.env.DB.prepare(
    'SELECT filename, content_type, storage, r2_key, data FROM uploads WHERE id = ?',
  ).bind(id).first<{
    filename: string
    content_type: string
    storage: string
    r2_key: string | null
    data: string | null
  }>()
  if (!row) return c.json(fail(ErrCode.NOT_FOUND, 'not found'))

  if (row.storage === 'r2' && row.r2_key && c.env.UPLOADS) {
    const obj = await c.env.UPLOADS.get(row.r2_key)
    if (!obj) return c.json(fail(ErrCode.NOT_FOUND, 'not found'))
    const headers = new Headers()
    headers.set('content-type', row.content_type)
    headers.set('cache-control', 'public, max-age=31536000, immutable')
    return new Response(obj.body, { headers })
  }

  if (row.storage === 'd1' && row.data) {
    const headers = new Headers()
    headers.set('content-type', row.content_type)
    headers.set('cache-control', 'public, max-age=31536000, immutable')
    return new Response(new Blob([base64ToBytes(row.data)]), { headers })
  }

  return c.json(fail(ErrCode.NOT_FOUND, 'not found'))
})

// 删除文件
uploadsRoutes.delete('/:id', async (c) => {
  const id = parseId(c)
  if (!id) return badRequest(c, 'invalid id')

  const row = await c.env.DB.prepare(
    'SELECT storage, r2_key FROM uploads WHERE id = ?',
  ).bind(id).first<{ storage: string; r2_key: string | null }>()
  if (!row) return c.json(fail(ErrCode.NOT_FOUND, 'not found'))

  if (row.storage === 'r2' && row.r2_key && c.env.UPLOADS) {
    await c.env.UPLOADS.delete(row.r2_key)
  }
  await c.env.DB.prepare('DELETE FROM uploads WHERE id = ?').bind(id).run()

  return c.json(ok({ deleted: true }))
})

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
