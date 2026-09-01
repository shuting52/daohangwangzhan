// 内置外观主题模板（以女孩风格为设置导向）
import type { ThemePresetId, ThemeTemplate } from './types'
export type { ThemeTemplate } from './types'

export const THEME_PRESET_IDS: ThemePresetId[] = [
  'neo-brutalism',
  'bouncy',
  'cute-cartoon',
  'new-year',
  'neumorphism',
  'frosted',
]

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'neo-brutalism',
    name: '新粗野',
    description: '高饱和撞色 + 粗边框 + 硬阴影，张扬有个性',
    tag: '个性',
    light: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #fff3b0 0%, #ffd166 50%, #ffb4a2 100%)',
        blur: 0,
        mask: 0.06,
        maskColor: '#ffffff',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 1,
      card_text_color: '#1f1f1f',
      site_title_color: '#ff5d8f',
      site_title_effect: 'wave',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #3a0ca3 0%, #7209b7 45%, #f72585 100%)',
        blur: 0,
        mask: 0.16,
        maskColor: '#000000',
      },
      card_background_color: '#2b2d42',
      card_background_opacity: 1,
      card_text_color: '#f8f9fa',
      site_title_color: '#ffd166',
      site_title_effect: 'wave',
    },
  },
  {
    id: 'bouncy',
    name: '膨胀风',
    description: '圆润胖乎乎 + 柔和粉彩，Q 弹可爱的膨胀质感',
    tag: '软萌',
    light: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 20% 20%, #ffd6e8 0%, transparent 50%), radial-gradient(circle at 80% 25%, #d6f5ff 0%, transparent 50%), radial-gradient(circle at 50% 90%, #fff3d6 0%, transparent 55%), linear-gradient(160deg, #fff0f6 0%, #fdf2ff 100%)',
        blur: 0,
        mask: 0.05,
        maskColor: '#ffffff',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 0.85,
      card_text_color: '#5c4a5e',
      site_title_color: '#ff8fab',
      site_title_effect: 'shimmer',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 20% 20%, rgba(255, 141, 171, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 25%, rgba(140, 220, 255, 0.22) 0%, transparent 50%), linear-gradient(160deg, #2b1f2e 0%, #1a1220 100%)',
        blur: 0,
        mask: 0.2,
        maskColor: '#000000',
      },
      card_background_color: '#3b2b40',
      card_background_opacity: 0.9,
      card_text_color: '#ffe3f0',
      site_title_color: '#ffc2d9',
      site_title_effect: 'shimmer',
    },
  },
  {
    id: 'cute-cartoon',
    name: '可爱卡通动态',
    description: '糖果色 + 动感彩球，活泼灵动少女心满满',
    tag: '少女',
    light: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 12% 18%, rgba(255, 190, 220, 0.55) 0%, transparent 38%), radial-gradient(circle at 88% 12%, rgba(180, 240, 255, 0.5) 0%, transparent 36%), radial-gradient(circle at 78% 88%, rgba(255, 235, 160, 0.5) 0%, transparent 40%), linear-gradient(150deg, #ffe9f3 0%, #eef8ff 55%, #fff7e6 100%)',
        blur: 0,
        mask: 0.04,
        maskColor: '#ffffff',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 0.88,
      card_text_color: '#6b4a5e',
      site_title_color: '#ff6fb5',
      site_title_effect: 'gradient',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 12% 18%, rgba(255, 111, 181, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 12%, rgba(92, 196, 255, 0.2) 0%, transparent 36%), linear-gradient(150deg, #251a2e 0%, #141b2e 60%, #2a1f14 100%)',
        blur: 0,
        mask: 0.18,
        maskColor: '#000000',
      },
      card_background_color: '#33243b',
      card_background_opacity: 0.9,
      card_text_color: '#ffd9ec',
      site_title_color: '#ff9ecf',
      site_title_effect: 'gradient',
    },
  },
  {
    id: 'new-year',
    name: '新年主题',
    description: '中国红 + 金箔流光，喜庆热闹年味十足',
    tag: '喜庆',
    light: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 15% 20%, rgba(255, 215, 120, 0.4) 0%, transparent 40%), linear-gradient(140deg, #fff3e0 0%, #ffe0e0 45%, #ffd6c7 100%)',
        blur: 0,
        mask: 0.06,
        maskColor: '#ffffff',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 0.92,
      card_text_color: '#7a2e2e',
      site_title_color: '#d92332',
      site_title_effect: 'glow',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'radial-gradient(circle at 15% 20%, rgba(255, 190, 80, 0.2) 0%, transparent 40%), linear-gradient(140deg, #3d0d0d 0%, #5c1212 55%, #3a1010 100%)',
        blur: 0,
        mask: 0.22,
        maskColor: '#000000',
      },
      card_background_color: '#6e1a1a',
      card_background_opacity: 0.9,
      card_text_color: '#ffe9d2',
      site_title_color: '#ffd166',
      site_title_effect: 'glow',
    },
    marquee: {
      speed: 60,
      font_size: 15,
      color: '#d92332',
      background_color: '#fff7e6',
      effect: 'slide',
    },
  },
  {
    id: 'neumorphism',
    name: '新拟态',
    description: '同色系柔光凹陷质感，简约高级又温柔',
    tag: '高级',
    light: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(145deg, #e8ecf4 0%, #f2f6fb 50%, #e6ebf5 100%)',
        blur: 0,
        mask: 0,
        maskColor: '#ffffff',
      },
      card_background_color: '#eef1f8',
      card_background_opacity: 1,
      card_text_color: '#3d4a63',
      site_title_color: '#5b6b8c',
      site_title_effect: 'none',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(145deg, #232a3a 0%, #2c3447 50%, #1f2634 100%)',
        blur: 0,
        mask: 0.1,
        maskColor: '#000000',
      },
      card_background_color: '#2a3244',
      card_background_opacity: 1,
      card_text_color: '#c9d4e8',
      site_title_color: '#a5b6d6',
      site_title_effect: 'none',
    },
  },
  {
    id: 'frosted',
    name: '磨砂系列',
    description: '通透毛玻璃 + 柔雾渐变，清冷高级氛围感',
    tag: '清透',
    light: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 40%, #fce7f3 100%)',
        blur: 0,
        mask: 0.08,
        maskColor: '#ffffff',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 0.55,
      card_text_color: '#4c556c',
      site_title_color: '#7c6fd0',
      site_title_effect: 'typing',
    },
    dark: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #1e1b3a 0%, #241d38 45%, #2a1f33 100%)',
        blur: 0,
        mask: 0.25,
        maskColor: '#000000',
      },
      card_background_color: '#ffffff',
      card_background_opacity: 0.12,
      card_text_color: '#e4def5',
      site_title_color: '#c4b5fd',
      site_title_effect: 'typing',
    },
  },
]

export function getThemeTemplate(id: string): ThemeTemplate | undefined {
  return themeTemplates.find((template) => template.id === id)
}

export function isThemePresetId(value: unknown): value is ThemePresetId {
  return typeof value === 'string' && THEME_PRESET_IDS.includes(value as ThemePresetId)
}
