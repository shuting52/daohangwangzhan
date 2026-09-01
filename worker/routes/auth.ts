import { Hono } from 'hono'
import type { ChangePasswordReq, LoginLogRecord, LoginReq, MeResp } from '../../shared/types'
import { ErrCode } from '../../shared/types'
import {
  authRequired,
  clearAllCachedSessions,
  clearAllSessions,
  clearCachedSession,
  extractBearerToken,
} from '../middleware/auth'
import { clearLoginFailures, getClientIp, loginRateLimit, recordLoginFailure } from '../middleware/rateLimit'
import { ensureAdminBootstrap, type AdminCredentials } from '../lib/bootstrap'
import { hashPassword, verifyPassword } from '../lib/crypto'
import { setSettingValue } from '../lib/db'
import { fail, ok } from '../lib/response'
import { createSession, getSessionTtlSeconds } from '../lib/session'
export { getSessionTtlSeconds } from '../lib/session'
import { revokeSession } from '../lib/sessionRevocation'
import type { HonoEnv } from '../types'

const ADMIN_PASSWORD_KEY = 'admin_password'
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 256
const LOGIN_LOG_KEY = 'login_log'

export function isValidNewPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH
}

async function recordLoginLog(env: HonoEnv['Bindings'], ip: string | null, userAgent: string | null): Promise<void> {
  if (!env.SESSION) return
  const record: LoginLogRecord = { ip, at: Date.now(), user_agent: userAgent }
  try {
    await env.SESSION.put(LOGIN_LOG_KEY, JSON.stringify(record), { expirationTtl: 90 * 24 * 60 * 60 })
  } catch {
    // 登录记录写入失败不阻塞登录
  }
}

async function readLoginLog(env: HonoEnv['Bindings']): Promise<LoginLogRecord | null> {
  if (!env.SESSION) return null
  try {
    const raw = await env.SESSION.get(LOGIN_LOG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LoginLogRecord
  } catch {
    return null
  }
}

export const authRoutes = new Hono<HonoEnv>()

authRoutes.post('/login', loginRateLimit, async (c) => {
  let credentials: AdminCredentials
  try {
    credentials = await ensureAdminBootstrap(c.env)
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'admin bootstrap failed'))
  }

  let body: LoginReq
  try {
    body = await c.req.json<LoginReq>()
  } catch {
    return c.json(fail(ErrCode.BAD_REQUEST, 'invalid request body'))
  }

  const username = body.username?.trim()
  const password = body.password
  if (!username || !password) {
    return c.json(fail(ErrCode.BAD_REQUEST, 'username and password are required'))
  }

  const ip = getClientIp(c)
  const passwordOk = username === credentials.username && (await verifyPassword(password, credentials.passwordHash))
  if (!passwordOk) {
    await recordLoginFailure(c.env, ip, c.get('loginRateLimitState'))
    return c.json(fail(ErrCode.UNAUTHORIZED, 'invalid credentials'))
  }

  const loginRateLimitState = c.get('loginRateLimitState')

  if (credentials.resetApplied) {
    await clearAllSessions(c.env)
    clearAllCachedSessions()
  }

  const sessionPromise = createSession(c.env, credentials.username)
  const loginFailurePromise = loginRateLimitState
    ? clearLoginFailures(c.env, ip)
    : Promise.resolve()
  const loginLogPromise = recordLoginLog(c.env, ip, c.req.header('User-Agent') ?? null)
  const [data] = await Promise.all([sessionPromise, loginFailurePromise, loginLogPromise])
  return c.json(ok(data))
})

authRoutes.post('/logout', authRequired, async (c) => {
  const token = extractBearerToken(c.req.header('Authorization'))
  if (token) {
    // 清内存缓存只影响当前 isolate，JWT 本身在 exp 之前照样有效。
    // 必须写撤销名单，否则「退出登录」在共享设备上等于什么都没做。
    if (c.env.SESSION) {
      try {
        await revokeSession(c.env.SESSION, token, c.get('sessionExpiresAt'))
      } catch {
        // KV 不可用时不要让退出登录失败：前端仍会清掉本地登录态，
        // token 也只是回到改动前的状态，不会变得更糟。
      }
    }
    clearCachedSession(token)
  }
  return c.json(ok(null))
})

authRoutes.post('/password', authRequired, async (c) => {
  let body: ChangePasswordReq
  try {
    body = await c.req.json<ChangePasswordReq>()
  } catch {
    return c.json(fail(ErrCode.BAD_REQUEST, 'invalid request body'))
  }

  if (typeof body.current_password !== 'string' || !body.current_password) {
    return c.json(fail(ErrCode.BAD_REQUEST, 'current password is required'))
  }

  if (!isValidNewPassword(body.new_password)) {
    return c.json(fail(ErrCode.BAD_REQUEST, `new password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`))
  }

  let credentials: AdminCredentials
  try {
    credentials = await ensureAdminBootstrap(c.env, { applyCredentialReset: false })
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'admin bootstrap failed'))
  }

  const currentPasswordOk = await verifyPassword(body.current_password, credentials.passwordHash)
  if (!currentPasswordOk) {
    return c.json(fail(ErrCode.BAD_REQUEST, 'current password is incorrect'))
  }

  try {
    await setSettingValue(c.env.DB, ADMIN_PASSWORD_KEY, await hashPassword(body.new_password))
    await clearAllSessions(c.env)
    clearAllCachedSessions()
    return c.json(ok(null))
  } catch {
    return c.json(fail(ErrCode.SERVER_ERROR, 'failed to update password'))
  }
})

authRoutes.post('/logout-all', authRequired, async (c) => {
  await clearAllSessions(c.env)
  clearAllCachedSessions()
  return c.json(ok(null))
})

authRoutes.get('/me', authRequired, async (c) => {
  const log = await readLoginLog(c.env)
  const me: MeResp = {
    username: c.get('username'),
    expires_at: c.get('sessionExpiresAt'),
    last_login_at: log?.at ?? null,
    last_login_ip: log?.ip ?? null,
    session_ttl_seconds: getSessionTtlSeconds(c.env.SESSION_TTL),
  }
  return c.json(ok(me))
})

export default authRoutes
