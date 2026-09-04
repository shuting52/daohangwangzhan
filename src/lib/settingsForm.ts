import type { BackgroundPresetId, BackgroundSetting, CustomTheme, MarqueeSetting, SearchEngine, SearchEngineSetting, ThemeMode, ThemeTemplate } from '../../shared/types'
import type { SettingsFormValue } from './appData'
import { parseCssColor, splitCssColorAlpha } from './color'
import {
  gradientPresets,
  type GradientPresetId,
  type ThemeGradientPreset,
} from './themePresets'

export type SettingsFormModel = SettingsFormValue

export const defaultMarquee: MarqueeSetting = {
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
  content_source: 'manual',
}

export const siteTitleEffects: Array<{ value: SettingsFormModel['site_title_effect']; label: string; hint: string }> = [
  { value: 'none', label: '无', hint: '静态标题。' },
  { value: 'typing', label: '打字机', hint: '逐字打出标题文字，生动有趣。' },
  { value: 'gradient', label: '渐变流光', hint: '渐变色彩流动，华丽吸睛。' },
  { value: 'wave', label: '波浪律动', hint: '文字上下波浪起伏。' },
  { value: 'shimmer', label: '闪烁光泽', hint: '高光扫过文字，梦幻闪耀。' },
  { value: 'glow', label: '柔光呼吸', hint: '文字柔光缓慢呼吸。' },
]

export const marqueeEffectOptions: Array<{ value: MarqueeSetting['effect']; label: string; hint: string }> = [
  { value: 'slide', label: '滑动', hint: '经典跑马灯，持续单向滚动。' },
  { value: 'alternate', label: '来回', hint: '左右来回滚动。' },
  { value: 'fade', label: '淡入淡出', hint: '文字逐条淡入淡出。' },
  { value: 'blink', label: '闪烁', hint: '文字闪烁提示。' },
]

export const themeOptions: Array<{ value: ThemeMode; label: string; hint: string }> = [
  { value: 'auto', label: '跟随系统', hint: '根据设备当前主题自动切换。' },
  { value: 'light', label: '浅色', hint: '始终使用浅色主题。' },
  { value: 'dark', label: '深色', hint: '始终使用深色主题。' },
]

export const backgroundTypeOptions: Array<{ value: BackgroundSetting['type']; label: string; hint: string }> = [
  { value: 'color', label: '纯色', hint: '支持 #hex、rgb()、rgba()，也可用颜色拾取器。' },
  { value: 'gradient', label: '渐变', hint: '支持完整 CSS 渐变，也可用下方两端颜色生成。' },
  { value: 'image', label: '图片', hint: '填写图片外链 URL；配置图床后可快速上传。' },
  { value: 'video', label: '视频', hint: '填写视频外链 URL（mp4/webm）；配置图床后可快速上传。' },
]

export const defaultLightBackground: BackgroundSetting = {
  type: 'color',
  value: '#f8fafc',
  blur: 0,
  mask: 0.18,
  maskColor: '#ffffff',
}

export const defaultDarkBackground: BackgroundSetting = {
  type: 'color',
  value: '#0f172a',
  blur: 0,
  mask: 0.3,
  maskColor: '#000000',
}

export const defaultLightGradient = { start: '#e0f2fe', end: '#f8fafc' }
export const defaultDarkGradient = { start: '#1e3a8a', end: '#0f172a' }

export const defaultSearchEngine: SearchEngineSetting = {
  current: 'Google',
  engines: [
    { name: 'Google', icon: '', url_template: 'https://www.google.com/search?q={q}' },
    { name: 'Bing', icon: '', url_template: 'https://www.bing.com/search?q={q}' },
  ],
}

export const emptySettingsForm: SettingsFormModel = {
  site_title: '',
  site_title_color: '#ffffff',
  site_title_font_size: 32,
  site_title_effect: 'none',
  marquee: { ...defaultMarquee },
  theme_preset_id: 'custom',
  public_mode: true,
  browser_sync_enabled: false,
  theme: 'auto',
  background_preset_id: 'custom',
  custom_css: '',
  custom_js: '',
  image_host_url: '',
  background: { ...defaultDarkBackground },
  backgrounds: {
    light: { ...defaultLightBackground },
    dark: { ...defaultDarkBackground },
  },
  search_engine: {
    current: defaultSearchEngine.current,
    engines: defaultSearchEngine.engines.map((engine) => ({ ...engine })),
  },
  card_size: { width: 80, height: 60 },
  card_style: 'info',
  card_icon_size: 60,
  card_show_description: true,
  card_description_mode: 'always',
  card_background_color: '#ffffff',
  card_background_opacity: 0.9,
  card_icon_show_title: true,
  card_text_color: '',
  search_box_show: true,
  search_engine_selector_show: true,
  content_layout: { max_width: 1200, max_width_unit: 'px', margin_x: 0, margin_top: 0, margin_bottom: 0 },
  navigation: { position: 'left', always_expanded: false, top_layout: 'scroll', show_icons: true, show_counts: true, show_site_name: true, nav_font_size: 14, nav_icon_size: 20, hide_empty_categories: false },
  footer_html: '',
  most_visited_count: 8,
  site_title_show: true,
}

export function cloneSettingsForm(source: SettingsFormModel): SettingsFormModel {
  return {
    site_title: source.site_title,
    site_title_color: source.site_title_color,
    site_title_font_size: source.site_title_font_size,
    site_title_effect: source.site_title_effect,
    marquee: { ...source.marquee },
    theme_preset_id: source.theme_preset_id,
    public_mode: source.public_mode,
    browser_sync_enabled: source.browser_sync_enabled,
    theme: source.theme,
    background_preset_id: source.background_preset_id,
    custom_css: source.custom_css,
    custom_js: source.custom_js,
    image_host_url: source.image_host_url,
    background: { ...source.background },
    backgrounds: {
      light: { ...source.backgrounds.light },
      dark: { ...source.backgrounds.dark },
    },
    search_engine: {
      current: source.search_engine.current,
      engines: source.search_engine.engines.map((engine) => ({ ...engine })),
    },
    card_size: { ...source.card_size },
    card_style: source.card_style,
    card_icon_size: source.card_icon_size,
    card_show_description: source.card_description_mode === 'always',
    card_description_mode: source.card_description_mode,
    card_background_color: source.card_background_color,
    card_background_opacity: source.card_background_opacity,
    card_icon_show_title: source.card_icon_show_title,
    card_text_color: source.card_text_color,
    search_box_show: source.search_box_show,
    search_engine_selector_show: source.search_engine_selector_show,
    content_layout: { ...source.content_layout },
    navigation: { ...source.navigation },
    footer_html: source.footer_html,
    most_visited_count: source.most_visited_count,
    site_title_show: source.site_title_show,
  }
}

export function normalizeBackgroundPresetId(input: unknown): BackgroundPresetId {
  return input === 'custom' || gradientPresets.some((preset) => preset.id === input)
    ? input as BackgroundPresetId
    : 'custom'
}

function resolveBackgroundPresetId(
  source: Partial<SettingsFormModel> | null | undefined,
  lightBackground: BackgroundSetting | undefined,
  darkBackground: BackgroundSetting | undefined,
): BackgroundPresetId {
  const storedPresetId = source?.background_preset_id
  const presetId = normalizeBackgroundPresetId(storedPresetId)
  if (storedPresetId === 'custom' || presetId !== 'custom') return presetId

  if (storedPresetId == null && lightBackground && darkBackground) {
    const normalizedLight = normalizeBackground(lightBackground, defaultLightBackground)
    const normalizedDark = normalizeBackground(darkBackground, defaultDarkBackground)
    const matched = gradientPresets.find((preset) => (
      backgroundPresetValueEquals(normalizedLight, preset.light) &&
      backgroundPresetValueEquals(normalizedDark, preset.dark)
    ))
    if (matched) return matched.id
  }

  return 'custom'
}

export function createSettingsFormState(
  source: Partial<SettingsFormModel> | null | undefined,
): SettingsFormModel {
  const background = source?.background
  const lightBackground = source?.backgrounds?.light ?? background
  const darkBackground = source?.backgrounds?.dark ?? background
  const searchEngine = source?.search_engine
  const cardSize = source?.card_size
  const contentLayout = source?.content_layout
  const navigation = source?.navigation
  return {
    site_title: source?.site_title ?? '',
    site_title_color: source?.site_title_color ?? '#ffffff',
    site_title_font_size: typeof source?.site_title_font_size === 'number' ? source.site_title_font_size : 32,
    site_title_effect: source?.site_title_effect ?? 'none',
    marquee: { ...defaultMarquee, ...(source?.marquee ?? {}) },
    theme_preset_id: source?.theme_preset_id ?? 'custom',
    public_mode: source?.public_mode ?? true,
    browser_sync_enabled: source?.browser_sync_enabled ?? false,
    theme: source?.theme ?? 'auto',
    background_preset_id: resolveBackgroundPresetId(source, lightBackground, darkBackground),
    custom_css: source?.custom_css ?? '',
    custom_js: source?.custom_js ?? '',
    image_host_url: source?.image_host_url ?? '',
    background: {
      type: background?.type ?? defaultDarkBackground.type,
      value: background?.value ?? defaultDarkBackground.value,
      blur: typeof background?.blur === 'number' ? background.blur : defaultDarkBackground.blur,
      mask: typeof background?.mask === 'number' ? background.mask : defaultDarkBackground.mask,
      maskColor: background?.maskColor ?? defaultDarkBackground.maskColor,
    },
    backgrounds: {
      light: {
        type: lightBackground?.type ?? defaultLightBackground.type,
        value: lightBackground?.value ?? defaultLightBackground.value,
        blur: typeof lightBackground?.blur === 'number' ? lightBackground.blur : defaultLightBackground.blur,
        mask: typeof lightBackground?.mask === 'number' ? lightBackground.mask : defaultLightBackground.mask,
        maskColor: lightBackground?.maskColor ?? defaultLightBackground.maskColor,
      },
      dark: {
        type: darkBackground?.type ?? defaultDarkBackground.type,
        value: darkBackground?.value ?? defaultDarkBackground.value,
        blur: typeof darkBackground?.blur === 'number' ? darkBackground.blur : defaultDarkBackground.blur,
        mask: typeof darkBackground?.mask === 'number' ? darkBackground.mask : defaultDarkBackground.mask,
        maskColor: darkBackground?.maskColor ?? defaultDarkBackground.maskColor,
      },
    },
    search_engine: {
      current: searchEngine?.current ?? defaultSearchEngine.current,
      engines:
        searchEngine?.engines && searchEngine.engines.length > 0
          ? searchEngine.engines.map((engine) => ({
              name: engine.name ?? '',
              icon: engine.icon ?? '',
              url_template: engine.url_template ?? '',
            }))
          : defaultSearchEngine.engines.map((engine) => ({ ...engine })),
    },
    card_size: {
      width: typeof cardSize?.width === 'number' ? cardSize.width : 80,
      height: typeof cardSize?.height === 'number' ? cardSize.height : 60,
    },
    card_style: source?.card_style ?? 'info',
    card_icon_size: typeof source?.card_icon_size === 'number' ? source.card_icon_size : 60,
    card_show_description: source?.card_show_description ?? true,
    card_description_mode: source?.card_description_mode ?? (source?.card_show_description === false ? 'hidden' : 'always'),
    card_background_color: source?.card_background_color ?? '#ffffff',
    card_background_opacity: typeof source?.card_background_opacity === 'number' ? source.card_background_opacity : 0.9,
    card_icon_show_title: source?.card_icon_show_title ?? true,
    card_text_color: source?.card_text_color ?? '',
    search_box_show: source?.search_box_show ?? true,
    search_engine_selector_show: source?.search_engine_selector_show ?? true,
    content_layout: {
      max_width: typeof contentLayout?.max_width === 'number' ? contentLayout.max_width : 1200,
      max_width_unit: contentLayout?.max_width_unit === '%' ? '%' : 'px',
      margin_x: typeof contentLayout?.margin_x === 'number' ? contentLayout.margin_x : 0,
      margin_top: typeof contentLayout?.margin_top === 'number' ? contentLayout.margin_top : 0,
      margin_bottom: typeof contentLayout?.margin_bottom === 'number' ? contentLayout.margin_bottom : 0,
    },
    navigation: {
      position: navigation?.position === 'top' ? 'top' : 'left',
      always_expanded: navigation?.always_expanded ?? false,
      top_layout: navigation?.top_layout === 'wrap' ? 'wrap' : 'scroll',
      show_icons: navigation?.show_icons ?? true,
      show_counts: navigation?.show_counts ?? true,
      show_site_name: navigation?.show_site_name ?? true,
      nav_font_size: navigation?.nav_font_size ?? 14,
      nav_icon_size: navigation?.nav_icon_size ?? 20,
      hide_empty_categories: navigation?.hide_empty_categories ?? false,
    },
    footer_html: source?.footer_html ?? '',
    most_visited_count: typeof source?.most_visited_count === 'number' ? source.most_visited_count : 8,
    site_title_show: source?.site_title_show ?? true,
  }
}

function normalizeEngines(engines: SearchEngine[]): SearchEngine[] {
  return engines.map((engine) => ({
    name: engine.name.trim(),
    icon: engine.icon.trim(),
    url_template: engine.url_template.trim(),
  }))
}

function normalizeBackground(source: BackgroundSetting, fallback: BackgroundSetting): BackgroundSetting {
  const maskColor = splitCssColorAlpha(source.maskColor, fallback.maskColor, source.mask)
  return {
    type: source.type,
    value: source.value.trim(),
    blur: clampNumber(source.blur, 0, 40),
    mask: clampNumber(maskColor.alpha, 0, 1),
    maskColor: maskColor.color,
  }
}

export function normalizeSettingsForm(source: SettingsFormModel): SettingsFormModel {
  const engines = normalizeEngines(source.search_engine.engines)
  const current = engines.some((engine) => engine.name === source.search_engine.current)
    ? source.search_engine.current
    : engines[0]?.name ?? ''
  const cardBackgroundColor = splitCssColorAlpha(
    source.card_background_color,
    '#ffffff',
    source.card_background_opacity,
  )
  const lightBackground = normalizeBackground(source.backgrounds.light, defaultLightBackground)
  const darkBackground = normalizeBackground(source.backgrounds.dark, defaultDarkBackground)
  return {
    site_title: source.site_title.trim(),
    site_title_color: source.site_title_color?.trim() ?? '',
    site_title_font_size: clampNumber(source.site_title_font_size, 16, 72),
    site_title_effect: ['none', 'typing', 'gradient', 'wave', 'shimmer', 'glow'].includes(source.site_title_effect)
      ? source.site_title_effect
      : 'none',
    marquee: {
      ...defaultMarquee,
      ...source.marquee,
      speed: clampNumber(source.marquee?.speed ?? defaultMarquee.speed, 1, 300),
      font_size: clampNumber(source.marquee?.font_size ?? defaultMarquee.font_size, 10, 48),
    },
    theme_preset_id: source.theme_preset_id === 'custom' || ['neo-brutalism', 'bouncy', 'cute-cartoon', 'new-year', 'neumorphism', 'frosted'].includes(source.theme_preset_id)
      ? source.theme_preset_id
      : 'custom',
    public_mode: source.public_mode,
    browser_sync_enabled: Boolean(source.browser_sync_enabled),
    theme: source.theme,
    background_preset_id: source.background_preset_id,
    custom_css: source.custom_css?.trim() ?? '',
    custom_js: source.custom_js?.trim() ?? '',
    image_host_url: source.image_host_url.trim(),
    background: source.theme === 'dark' ? darkBackground : lightBackground,
    backgrounds: {
      light: lightBackground,
      dark: darkBackground,
    },
    search_engine: { current, engines },
    card_size: {
      width: clampNumber(source.card_size.width, 80, 400),
      height: clampNumber(source.card_size.height, 0, 300),
    },
    card_style: source.card_style === 'icon' ? 'icon' : 'info',
    card_icon_size: clampNumber(source.card_icon_size, 40, 100),
    card_show_description: source.card_description_mode === 'always',
    card_description_mode: source.card_description_mode,
    card_background_color: cardBackgroundColor.color,
    card_background_opacity: clampNumber(cardBackgroundColor.alpha, 0, 1),
    card_icon_show_title: source.card_icon_show_title,
    card_text_color: source.card_text_color?.trim() ?? '',
    search_box_show: source.search_box_show,
    search_engine_selector_show: source.search_engine_selector_show,
    content_layout: {
      max_width: clampNumber(
        source.content_layout.max_width,
        source.content_layout.max_width_unit === '%' ? 40 : 640,
        source.content_layout.max_width_unit === '%' ? 100 : 2400,
      ),
      max_width_unit: source.content_layout.max_width_unit === '%' ? '%' : 'px',
      margin_x: clampNumber(source.content_layout.margin_x, 0, 100),
      margin_top: clampNumber(source.content_layout.margin_top, 0, 50),
      margin_bottom: clampNumber(source.content_layout.margin_bottom, 0, 50),
    },
    navigation: {
      position: source.navigation.position === 'top' ? 'top' : 'left',
      always_expanded: Boolean(source.navigation.always_expanded),
      top_layout: source.navigation.top_layout === 'wrap' ? 'wrap' : 'scroll',
      show_icons: source.navigation.show_icons ?? true,
      show_counts: source.navigation.show_counts ?? true,
      show_site_name: source.navigation.show_site_name ?? true,
      nav_font_size: source.navigation.nav_font_size ?? 14,
      nav_icon_size: source.navigation.nav_icon_size ?? 20,
      hide_empty_categories: source.navigation.hide_empty_categories ?? false,
    },
    footer_html: source.footer_html.trim(),
    most_visited_count: clampNumber(source.most_visited_count, 0, 20),
    site_title_show: Boolean(source.site_title_show),
  }
}

export function clampNumber(input: number, min: number, max: number): number {
  if (!Number.isFinite(input)) return min
  return Math.min(max, Math.max(min, input))
}

function gradientValue(start: string, end: string): string {
  return `linear-gradient(135deg, ${start}, ${end})`
}

function isGradientValue(input: string): boolean {
  return /gradient\s*\(/i.test(input)
}

export function normalizeBackgroundValueForType(
  currentValue: string,
  nextType: BackgroundSetting['type'],
  defaults: { color: string; gradientStart: string; gradientEnd: string },
): string {
  const trimmed = currentValue.trim()

  if (nextType === 'color') {
    return parseCssColor(trimmed) ? trimmed : defaults.color
  }

  if (nextType === 'gradient') {
    return isGradientValue(trimmed)
      ? trimmed
      : gradientValue(parseCssColor(trimmed) ? trimmed : defaults.gradientStart, defaults.gradientEnd)
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : ''
}

export function cloneBackgroundSetting(source: BackgroundSetting): BackgroundSetting {
  return { ...source }
}

export function shouldAutoExpandAppearanceAdvanced(
  source: Pick<SettingsFormModel, 'background_preset_id'> | null | undefined,
): boolean {
  return normalizeBackgroundPresetId(source?.background_preset_id) === 'custom'
}

export function applyBackgroundPreset(
  source: SettingsFormModel,
  preset: ThemeGradientPreset,
): SettingsFormModel {
  const next = cloneSettingsForm(source)
  next.background_preset_id = preset.id
  next.backgrounds = {
    light: cloneBackgroundSetting(preset.light),
    dark: cloneBackgroundSetting(preset.dark),
  }
  next.background = cloneBackgroundSetting(next.theme === 'dark' ? preset.dark : preset.light)
  next.card_background_color = preset.cardBackgroundColor
  next.card_background_opacity = preset.cardBackgroundOpacity
  next.card_text_color = preset.cardTextColor
  next.site_title_color = preset.siteTitleColor
  return next
}

export function markBackgroundPresetCustom(source: SettingsFormModel): SettingsFormModel {
  const next = cloneSettingsForm(source)
  next.background_preset_id = 'custom'
  return next
}

export function applyCustomThemeBackground(
  source: SettingsFormModel,
  theme: 'light' | 'dark',
  background: BackgroundSetting,
): SettingsFormModel {
  const next = markBackgroundPresetCustom(source)
  next.backgrounds[theme] = cloneBackgroundSetting(background)
  next.background = cloneBackgroundSetting(next.theme === 'dark' ? next.backgrounds.dark : next.backgrounds.light)
  return next
}

function comparableText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function backgroundPresetValueEquals(current: BackgroundSetting, target: BackgroundSetting): boolean {
  return (
    current.type === target.type &&
    comparableText(current.value) === comparableText(target.value) &&
    current.blur === target.blur &&
    current.mask === target.mask &&
    comparableText(current.maskColor).toLowerCase() === comparableText(target.maskColor).toLowerCase()
  )
}

export function getActiveGradientPresetId(source: SettingsFormModel): GradientPresetId | 'custom' {
  const presetId = normalizeBackgroundPresetId(source.background_preset_id)
  if (presetId !== 'custom' && gradientPresets.some((item) => item.id === presetId)) {
    return presetId
  }
  return 'custom'
}

// ===== 自定义主题（主题随心换）=====

export function createCustomThemeFromForm(source: SettingsFormModel, name: string): CustomTheme {
  return {
    id: `ct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || '未命名主题',
    theme: source.theme,
    background_preset_id: source.background_preset_id,
    backgrounds: {
      light: cloneBackgroundSetting(source.backgrounds.light),
      dark: cloneBackgroundSetting(source.backgrounds.dark),
    },
    card_background_color: source.card_background_color,
    card_background_opacity: source.card_background_opacity,
    card_text_color: source.card_text_color,
    created_at: Date.now(),
  }
}

export function applyCustomTheme(source: SettingsFormModel, customTheme: CustomTheme): SettingsFormModel {
  const next = cloneSettingsForm(source)
  next.background_preset_id = customTheme.background_preset_id
  next.backgrounds = {
    light: cloneBackgroundSetting(customTheme.backgrounds.light),
    dark: cloneBackgroundSetting(customTheme.backgrounds.dark),
  }
  next.background = cloneBackgroundSetting(next.theme === 'dark' ? customTheme.backgrounds.dark : customTheme.backgrounds.light)
  next.card_background_color = customTheme.card_background_color
  next.card_background_opacity = customTheme.card_background_opacity
  next.card_text_color = customTheme.card_text_color
  return next
}

// ===== 内置主题模板（外观与卡片）=====

export function applyThemeTemplate(
  source: SettingsFormModel,
  template: ThemeTemplate,
  mode: 'light' | 'dark' = source.theme === 'dark' ? 'dark' : 'light',
): SettingsFormModel {
  const next = cloneSettingsForm(source)
  const tpl = mode === 'dark' ? template.dark : template.light

  next.backgrounds = {
    light: cloneBackgroundSetting(template.light.background),
    dark: cloneBackgroundSetting(template.dark.background),
  }
  next.background = cloneBackgroundSetting(tpl.background)
  next.background_preset_id = 'custom'
  next.site_title_color = tpl.site_title_color
  next.site_title_effect = tpl.site_title_effect
  next.card_background_color = tpl.card_background_color
  next.card_background_opacity = tpl.card_background_opacity
  next.card_text_color = tpl.card_text_color
  if (template.marquee) {
    next.marquee = { ...next.marquee, ...template.marquee }
  }
  if (template.customCss) {
    next.custom_css = [next.custom_css.trim(), `\n/* ===== 模板 ${template.name} 注入 ===== */\n${template.customCss}`]
      .filter(Boolean)
      .join('\n')
  }
  if (template.customJs) {
    next.custom_js = [next.custom_js.trim(), `\n/* ===== 模板 ${template.name} 注入 ===== */\n${template.customJs}`]
      .filter(Boolean)
      .join('\n')
  }
  return next
}
