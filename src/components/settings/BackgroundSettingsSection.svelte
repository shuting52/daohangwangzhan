<script lang="ts">
  import {
    applyBackgroundPreset,
    applyCustomTheme,
    getActiveGradientPresetId,
    markBackgroundPresetCustom,
    type SettingsFormModel,
  } from '../../lib/settingsForm'
  import type { ThemeGradientPreset } from '../../lib/themePresets'
  import type { CustomTheme } from '../../../shared/types'
  import GradientPresetSelector from './GradientPresetSelector.svelte'

  export let form: SettingsFormModel
  export let saving = false
  export let customThemes: CustomTheme[] = []
  export let savingTheme = false
  export let activeCustomThemeId: string | null = null
  export let onAdvancedChange: ((open: boolean) => void) | undefined = undefined
  export let onSaveCustomTheme: ((name: string) => void) | undefined = undefined
  export let onDeleteCustomTheme: ((id: string) => void) | undefined = undefined

  $: activeGradientPresetId = getActiveGradientPresetId(form)

  function setAdvancedOpen(open: boolean): void {
    onAdvancedChange?.(open)
  }

  function selectCustomPreset(): void {
    form = markBackgroundPresetCustom(form)
    setAdvancedOpen(true)
  }

  function selectPreset(preset: ThemeGradientPreset): void {
    form = applyBackgroundPreset(form, preset)
    setAdvancedOpen(false)
  }

  function selectCustomTheme(theme: CustomTheme): void {
    form = applyCustomTheme(form, theme)
    setAdvancedOpen(false)
  }
</script>

<fieldset id="settings-section-appearance" class="group group-wide group-background" disabled={saving}>
  <legend>配色方案</legend>
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
