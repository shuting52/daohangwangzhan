import {
  BUILTIN_BACKGROUND_PRESET_IDS,
  type MarqueeSetting,
  type Settings,
  type SiteTitleEffect,
  type ThemePresetId,
} from '../../shared/types'
import { SETTINGS_KEYS } from '../../shared/settings'
import { isThemePresetId } from '../../shared/themeTemplates'

const DEFAULT_MARQUEE: MarqueeSetting = {
  enabled: false,
  text: '欢迎来到我的导航站 ♡',
  speed: 60,
  direction: 'left',
  font_size: 15,
  color: '#f472b6',
  background_color: '#fff0f6',
  show_date: true,
  date_format: 'YYYY-MM-DD',
  effect: 'slide',
  position: 'top',
}

// Keep these defaults aligned with schema.sql seed settings.
export const DEFAULT_SETTINGS: Settings = {
  site_title: 'CF-Navs',
  site_title_color: '',
  site_title_font_size: 32,
  site_title_effect: 'none',
  marquee: { ...DEFAULT_MARQUEE },
  theme_preset_id: 'custom',
  public_mode: true,
  browser_sync_enabled: false,
  theme: 'light',
  background_preset_id: 'ocean-depths',
  background: {
    type: 'gradient',
    value: 'radial-gradient(circle at 16% 12%, rgba(56, 189, 248, 0.5), transparent 44%), radial-gradient(circle at 84% 18%, rgba(45, 212, 191, 0.42), transparent 46%), radial-gradient(circle at 52% 96%, rgba(147, 197, 253, 0.46), transparent 50%), linear-gradient(145deg, #eff9ff 0%, #e7f5fe 46%, #e9f9f8 100%)',
    blur: 0,
    mask: 0.06,
    maskColor: '#ffffff',
  },
  backgrounds: {
    light: {
      type: 'gradient',
      value: 'radial-gradient(circle at 16% 12%, rgba(56, 189, 248, 0.5), transparent 44%), radial-gradient(circle at 84% 18%, rgba(45, 212, 191, 0.42), transparent 46%), radial-gradient(circle at 52% 96%, rgba(147, 197, 253, 0.46), transparent 50%), linear-gradient(145deg, #eff9ff 0%, #e7f5fe 46%, #e9f9f8 100%)',
      blur: 0,
      mask: 0.06,
      maskColor: '#ffffff',
    },
    dark: {
      type: 'gradient',
      value: 'radial-gradient(circle at 16% 12%, rgba(14, 165, 233, 0.44), transparent 48%), radial-gradient(circle at 84% 20%, rgba(20, 184, 166, 0.32), transparent 48%), radial-gradient(circle at 52% 96%, rgba(59, 130, 246, 0.3), transparent 54%), linear-gradient(145deg, #041828 0%, #06304a 50%, #0a2038 100%)',
      blur: 0,
      mask: 0.12,
      maskColor: '#000000',
    },
  },
  custom_css: '',
  custom_js: '',
  image_host_url: '',
  search_engine: {
    current: 'Google',
    engines: [
      { name: 'Google', icon: '', url_template: 'https://www.google.com/search?q={q}' },
      { name: 'Bing', icon: '', url_template: 'https://www.bing.com/search?q={q}' },
    ],
  },
  card_size: { width: 80, height: 60 },
  card_style: 'info',
  card_icon_size: 60,
  card_show_description: true,
  card_description_mode: 'always',
  card_background_color: '#ffffff',
  card_background_opacity: 0.42,
  card_icon_show_title: true,
  card_text_color: '',
  search_box_show: true,
  search_engine_selector_show: true,
  content_layout: {
    max_width: 1200,
    max_width_unit: 'px',
    margin_x: 0,
    margin_top: 0,
    margin_bottom: 0,
  },
  navigation: {
    position: 'left',
    always_expanded: false,
    top_layout: 'scroll',
    show_icons: true,
    show_counts: true,
    show_site_name: true,
    nav_font_size: 14,
    nav_icon_size: 20,
    hide_empty_categories: false,
  },
  footer_html: '',
  most_visited_count: 8,
  site_title_show: true,
  custom_themes: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeBackgroundSetting(value: unknown, fallback: Settings['background']): Settings['background'] {
  if (!isRecord(value)) return { ...fallback }

  const type = value.type === 'image' || value.type === 'video' || value.type === 'gradient' || value.type === 'color'
    ? value.type
    : fallback.type
  return {
    type,
    value: typeof value.value === 'string' ? value.value : fallback.value,
    blur: typeof value.blur === 'number' ? value.blur : fallback.blur,
    mask: typeof value.mask === 'number' ? value.mask : fallback.mask,
    maskColor: typeof value.maskColor === 'string' ? value.maskColor : fallback.maskColor,
  }
}

const SITE_TITLE_EFFECTS: SiteTitleEffect[] = ['none', 'typing', 'gradient', 'wave', 'shimmer', 'glow']

function normalizeSiteTitleEffect(value: unknown): SiteTitleEffect {
  return SITE_TITLE_EFFECTS.includes(value as SiteTitleEffect) ? value as SiteTitleEffect : 'none'
}

function normalizeThemePresetId(value: unknown): ThemePresetId | 'custom' {
  return isThemePresetId(value) ? value : 'custom'
}

function normalizeMarquee(value: unknown): MarqueeSetting {
  const fallback = DEFAULT_SETTINGS.marquee
  if (!isRecord(value)) return { ...fallback }
  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : fallback.enabled,
    text: typeof value.text === 'string' ? value.text : fallback.text,
    speed: typeof value.speed === 'number' && value.speed >= 1 ? Math.min(300, value.speed) : fallback.speed,
    direction: value.direction === 'right' ? 'right' : 'left',
    font_size: typeof value.font_size === 'number' && value.font_size >= 10 ? Math.min(48, value.font_size) : fallback.font_size,
    color: typeof value.color === 'string' ? value.color : fallback.color,
    background_color: typeof value.background_color === 'string' ? value.background_color : fallback.background_color,
    show_date: typeof value.show_date === 'boolean' ? value.show_date : fallback.show_date,
    date_format: typeof value.date_format === 'string' ? value.date_format : fallback.date_format,
    effect: value.effect === 'alternate' || value.effect === 'fade' || value.effect === 'blink' || value.effect === 'slide'
      ? value.effect
      : fallback.effect,
    position: value.position === 'bottom' ? 'bottom' : 'top',
    content_source: value.content_source === 'recent' || value.content_source === 'tools' ? value.content_source : 'manual',
  }
}

function normalizeThemeBackgroundSettings(value: unknown, fallbackBackground: Settings['background']): Settings['backgrounds'] {
  const fallback = isRecord(value) ? value : {}
  return {
    light: normalizeBackgroundSetting(fallback.light, fallbackBackground),
    dark: normalizeBackgroundSetting(fallback.dark, fallbackBackground),
  }
}

function normalizeBackgroundPresetId(value: unknown): Settings['background_preset_id'] {
  if (value === 'custom') return 'custom'
  return BUILTIN_BACKGROUND_PRESET_IDS.includes(value as typeof BUILTIN_BACKGROUND_PRESET_IDS[number])
    ? value as typeof BUILTIN_BACKGROUND_PRESET_IDS[number]
    : 'custom'
}

function normalizeNavigationSetting(value: unknown): Settings['navigation'] {
  if (!isValidNavigationSetting(value)) return { ...DEFAULT_SETTINGS.navigation }
  return {
    position: value.position,
    always_expanded: value.always_expanded,
    top_layout: value.top_layout,
    show_icons: value.show_icons ?? true,
    show_counts: value.show_counts ?? true,
    show_site_name: value.show_site_name ?? true,
    nav_font_size: typeof value.nav_font_size === 'number' && value.nav_font_size > 0 ? value.nav_font_size : 14,
    nav_icon_size: typeof value.nav_icon_size === 'number' && value.nav_icon_size > 0 ? value.nav_icon_size : 20,
    hide_empty_categories: typeof value.hide_empty_categories === 'boolean' ? value.hide_empty_categories : false,
  }
}

export function isValidNavigationSetting(value: unknown): value is Settings['navigation'] {
  if (!isRecord(value)) return false
  if (value.position !== 'left' && value.position !== 'top') return false
  if (typeof value.always_expanded !== 'boolean') return false
  // 旧数据无 top_layout：缺失/非法安全降级为 'scroll'，不丢弃 navigation
  if (value.top_layout === undefined) value.top_layout = 'scroll'
  else if (value.top_layout !== 'scroll' && value.top_layout !== 'wrap') value.top_layout = 'scroll'
  return true
}

export function readRawSettingsRows(rows: Array<{ key: string; value: string | null }>): Map<string, unknown> {
  const map = new Map<string, unknown>()
  for (const row of rows) {
    if (row.value == null) continue
    try {
      map.set(row.key, JSON.parse(row.value))
    } catch {
      map.set(row.key, row.value)
    }
  }
  return map
}

export function settingsFromRawMap(raw: Map<string, unknown>): Settings {
  const out = { ...DEFAULT_SETTINGS } as Settings
  const assignSetting = <K extends keyof Settings>(key: K) => {
    if (raw.has(key)) {
      out[key] = raw.get(key) as Settings[K]
    }
  }
  for (const key of SETTINGS_KEYS) assignSetting(key)
  out.background_preset_id = normalizeBackgroundPresetId(out.background_preset_id)
  const rawMode = raw.get('card_description_mode')
  const rawLegacy = raw.get('card_show_description')
  out.card_description_mode = rawMode === 'hover' || rawMode === 'hidden' || rawMode === 'always'
    ? rawMode
    : rawLegacy === false ? 'hidden' : 'always'
  out.card_show_description = out.card_description_mode === 'always'
  out.background = normalizeBackgroundSetting(out.background, DEFAULT_SETTINGS.background)
  out.backgrounds = normalizeThemeBackgroundSettings(raw.get('backgrounds'), out.background)
  out.navigation = normalizeNavigationSetting(raw.get('navigation'))
  out.most_visited_count = Math.min(20, Math.max(0, Math.round(Number(out.most_visited_count) || 0)))
  out.site_title_show = raw.has('site_title_show') ? Boolean(raw.get('site_title_show')) : true
  out.site_title_effect = normalizeSiteTitleEffect(out.site_title_effect)
  out.theme_preset_id = normalizeThemePresetId(out.theme_preset_id)
  out.marquee = normalizeMarquee(raw.get('marquee'))
  return out
}

export function settingsFromRows(
  rows: Array<{ key: string; value: string | null }>,
  base: Partial<Settings> = {},
): Settings {
  const raw = readRawSettingsRows(rows)
  for (const key of SETTINGS_KEYS) {
    if (base[key] !== undefined) {
      raw.set(key, base[key])
    }
  }
  return settingsFromRawMap(raw)
}

export function settingsFromPatchDefaults(patch: Partial<Settings>): Settings {
  const raw = new Map<string, unknown>()
  for (const key of SETTINGS_KEYS) {
    if (patch[key] !== undefined) {
      raw.set(key, patch[key])
    }
  }
  return settingsFromRawMap(raw)
}
