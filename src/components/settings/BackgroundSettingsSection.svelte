<script lang="ts">
  import {
    applyBackgroundPreset,
    applyCustomTheme,
    applyThemeTemplate,
    getActiveGradientPresetId,
    markBackgroundPresetCustom,
    type SettingsFormModel,
  } from '../../lib/settingsForm'
  import type { ThemeGradientPreset } from '../../lib/themePresets'
  import type { CustomTheme, ThemeTemplate } from '../../../shared/types'
  import GradientPresetSelector from './GradientPresetSelector.svelte'
  import ThemeTemplateSelector from './ThemeTemplateSelector.svelte'

  export let form: SettingsFormModel
  export let saving = false
  export let customThemes: CustomTheme[] = []
  export let savingTheme = false
  export let activeCustomThemeId: string | null = null
  export let onAdvancedChange: ((open: boolean) => void) | undefined = undefined
  export let onSaveCustomTheme: ((name: string) => void) | undefined = undefined
  export let onDeleteCustomTheme: ((id: string) => void) | undefined = undefined

  $: activeGradientPresetId = getActiveGradientPresetId(form)
  $: activeTemplateId = form.theme_preset_id !== 'custom' ? form.theme_preset_id : null

  function setAdvancedOpen(open: boolean): void {
    onAdvancedChange?.(open)
  }

  function selectCustomPreset(): void {
    form = markBackgroundPresetCustom(form)
    form.theme_preset_id = 'custom'
    setAdvancedOpen(true)
  }

  function selectPreset(preset: ThemeGradientPreset): void {
    form = applyBackgroundPreset(form, preset)
    form.theme_preset_id = 'custom'
    setAdvancedOpen(false)
  }

  function selectCustomTheme(theme: CustomTheme): void {
    form = applyCustomTheme(form, theme)
    form.theme_preset_id = 'custom'
    setAdvancedOpen(false)
  }

  function selectTemplate(template: ThemeTemplate): void {
    form = applyThemeTemplate(form, template)
    form.theme_preset_id = template.id
    setAdvancedOpen(true)
  }

  function selectCustomTemplate(): void {
    form.theme_preset_id = 'custom'
    setAdvancedOpen(true)
  }
</script>

<fieldset id="settings-section-appearance" class="group group-wide group-background" disabled={saving}>
  <legend>主题模板</legend>
  <ThemeTemplateSelector
    activeThemePresetId={form.theme_preset_id}
    activeTemplateId={activeTemplateId}
    on:select={(event) => selectTemplate(event.detail)}
    on:custom={selectCustomTemplate}
  />

  <div class="template-divider">
    <span>配色方案（自定义时生效）</span>
  </div>
  <GradientPresetSelector
    {activeGradientPresetId}
    {customThemes}
    {savingTheme}
    {activeCustomThemeId}
    on:custom={selectCustomPreset}
    on:select={(event) => selectPreset(event.detail)}
    on:selectCustomTheme={(event) => selectCustomTheme(event.detail)}
    on:saveCustomTheme={(event) => onSaveCustomTheme?.(event.detail)}
    on:deleteCustomTheme={(event) => onDeleteCustomTheme?.(event.detail)}
  />
</fieldset>

<style>
  .template-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 6px 0 2px;
  }

  .template-divider::before,
  .template-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--sp-subsection-border, #e2e8f0);
  }

  .template-divider span {
    color: var(--sp-muted);
    font-size: 12px;
    font-weight: 650;
    white-space: nowrap;
  }
</style>
