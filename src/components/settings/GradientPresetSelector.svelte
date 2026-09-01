<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { gradientPresets, type ThemeGradientPreset } from '../../lib/themePresets'
  import type { CustomTheme } from '../../../shared/types'

  export let activeGradientPresetId = 'custom'
  export let activeCustomThemeId: string | null = null
  export let customThemes: CustomTheme[] = []
  export let savingTheme = false

  const dispatch = createEventDispatcher<{
    custom: void
    select: ThemeGradientPreset
    selectCustomTheme: CustomTheme
    saveCustomTheme: string
    deleteCustomTheme: string
  }>()

  $: glassPresets = gradientPresets.filter((preset) => preset.surface === 'glass')
  $: flatPresets = gradientPresets.filter((preset) => preset.surface === 'flat')
  $: presetGroups = [
    { label: '毛玻璃氛围', hint: '渐变背景、半透明卡片与柔和光晕', items: glassPresets },
    { label: '护眼纯色', hint: '低饱和纯色背景与不透明卡片', items: flatPresets },
  ]

  let presetsExpanded = false
  let saveThemeOpen = false
  let saveThemeName = ''

  function openSaveTheme(): void {
    saveThemeName = ''
    saveThemeOpen = true
  }

  function confirmSaveTheme(): void {
    if (saveThemeName.trim().length === 0) return
    const name = saveThemeName.trim()
    saveThemeOpen = false
    dispatch('saveCustomTheme', name)
  }
</script>

<div class="gradient-preset-panel">
  <div class="gradient-preset-header">
    <div>
      <strong>内置配色方案</strong>
      <p>每套方案包含浅色/深色两种背景，选中后会一并套用遮罩和推荐的卡片透明度、文字颜色。</p>
    </div>
    {#if activeGradientPresetId === 'custom'}
      <span>自定义</span>
    {:else}
      <span>已选方案</span>
    {/if}
  </div>

  <div id="builtin-preset-groups" class="builtin-preset-groups">
  {#each presetGroups as group (group.label)}
    <div class="gradient-preset-group" class:collapsed={!presetsExpanded}>
      <div class="gradient-preset-group-title"><strong>{group.label}</strong><span>{group.hint}</span></div>
      <div class="gradient-preset-grid">
      {#each group.items as preset (preset.id)}
      <label
        class="gradient-preset-option"
        class:active={activeGradientPresetId === preset.id}
        style={`--preset-light-bg: ${preset.light.value}; --preset-dark-bg: ${preset.dark.value};`}
        title={`${preset.label}：${preset.description}`}
        aria-label={`${preset.label}：${preset.description}`}
      >
        <input
          type="radio"
          name="gradient-preset"
          checked={activeGradientPresetId === preset.id}
          on:change={() => dispatch('select', preset)}
        />
        <span class="preset-preview" aria-hidden="true">
          <span class="preset-swatch light"></span>
          <span class="preset-swatch dark"></span>
        </span>
        <span class="preset-copy">
          <strong>{preset.label}</strong>
        </span>
      </label>
      {/each}
      </div>
    </div>
  {/each}
  </div>

  <button
    type="button"
    class="preset-expand-toggle"
    aria-expanded={presetsExpanded}
    aria-controls="builtin-preset-groups"
    data-testid="gradient-preset-toggle"
    on:click={() => presetsExpanded = !presetsExpanded}
  >
    <span>{presetsExpanded ? '收起其他方案' : '查看更多方案'}</span>
    <span aria-hidden="true">{presetsExpanded ? '⌃' : '⌄'}</span>
  </button>

  {#if customThemes.length > 0}
    <div class="gradient-preset-group my-themes">
      <div class="gradient-preset-group-title">
        <strong>我的主题</strong>
        <span>保存喜欢的配色，一键随心切换（保存设置后生效）</span>
      </div>
      <div class="gradient-preset-grid">
        {#each customThemes as theme (theme.id)}
          <div
            class="gradient-preset-option my-theme"
            class:active={activeGradientPresetId === 'custom' && activeCustomThemeId === theme.id}
            style={`--preset-light-bg: ${theme.backgrounds.light.value}; --preset-dark-bg: ${theme.backgrounds.dark.value};`}
            title={theme.name}
          >
            <input
              type="radio"
              name="gradient-preset"
              checked={activeGradientPresetId === 'custom' && activeCustomThemeId === theme.id}
              on:change={() => dispatch('selectCustomTheme', theme)}
            />
            <span class="preset-preview" aria-hidden="true">
              <span class="preset-swatch light"></span>
              <span class="preset-swatch dark"></span>
            </span>
            <span class="preset-copy">
              <strong>{theme.name}</strong>
              <small>点击应用 · {new Date(theme.created_at).toLocaleDateString()} 创建</small>
            </span>
            <button
              type="button"
              class="my-theme-delete"
              title="删除该主题"
              aria-label={`删除主题 ${theme.name}`}
              on:click|stopPropagation={(e) => { e.preventDefault(); dispatch('deleteCustomTheme', theme.id) }}
            >×</button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if saveThemeOpen}
    <div class="save-theme-pop">
      <label for="save-theme-name">主题名称</label>
      <div class="save-theme-row">
        <input
          id="save-theme-name"
          type="text"
          maxlength="30"
          placeholder="例如：我的夜晚配色"
          bind:value={saveThemeName}
          on:keydown={(e) => { if (e.key === 'Enter') confirmSaveTheme() }}
        />
        <button type="button" class="save-theme-confirm" disabled={!saveThemeName.trim()} on:click={confirmSaveTheme}>保存</button>
        <button type="button" class="save-theme-cancel" on:click={() => saveThemeOpen = false}>取消</button>
      </div>
    </div>
  {:else}
    <button
      type="button"
      class="preset-expand-toggle save-theme-toggle"
      data-testid="gradient-preset-save-theme"
      disabled={savingTheme}
      on:click={openSaveTheme}
    >
      <span>{savingTheme ? '保存中…' : '💾 将当前配色保存为我的主题'}</span>
    </button>
  {/if}

  <div class="gradient-preset-group">
    <div class="gradient-preset-group-title"><strong>自定义</strong><span>手动维护浅色/深色背景与卡片参数</span></div>
    <label class="gradient-preset-option custom" class:active={activeGradientPresetId === 'custom'}>
      <input
        type="radio"
        name="gradient-preset"
        checked={activeGradientPresetId === 'custom'}
        on:change={() => dispatch('custom')}
      />
      <span class="preset-preview custom-preview" aria-hidden="true">
        <span></span>
        <span></span>
      </span>
      <span class="preset-copy">
        <strong>自定义背景</strong>
        <small>分别设置浅色和深色背景，可使用纯色、渐变或图片。</small>
      </span>
    </label>
  </div>
</div>

<style>
  .gradient-preset-panel {
    display: grid;
    gap: 10px;
    min-width: 0;
    border: 1px solid var(--sp-gradient-panel-border);
    border-radius: 16px;
    padding: 12px;
    background: var(--sp-gradient-panel-bg);
  }

  .gradient-preset-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .gradient-preset-header strong {
    display: block;
    color: var(--sp-heading);
    font-size: 14px;
  }

  .gradient-preset-header p {
    margin: 4px 0 0;
    color: var(--sp-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .gradient-preset-header > span {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--sp-chip-bg);
    color: var(--sp-chip-text);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 9px;
  }

  .gradient-preset-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .gradient-preset-group { display: grid; gap: 8px; }
  .builtin-preset-groups { display: grid; gap: 10px; }
  .gradient-preset-group.collapsed .gradient-preset-option:nth-child(n + 5) { display: none; }
  .gradient-preset-group-title { display: flex; align-items: baseline; gap: 10px; }
  .gradient-preset-group-title strong { color: var(--sp-heading); font-size: 13px; }
  .gradient-preset-group-title span { color: var(--sp-muted); font-size: 12px; }

  .gradient-preset-option {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    min-width: 0;
    min-height: 62px;
    border: 1px solid var(--sp-option-border);
    border-radius: 12px;
    padding: 8px 10px;
    background: var(--sp-option-bg);
    cursor: pointer;
    transition:
      border-color var(--transition-base),
      box-shadow var(--transition-base),
      transform var(--transition-base),
      background var(--transition-base);
  }

  .preset-expand-toggle {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    padding: 2px 0;
    background: transparent;
    color: var(--sp-accent);
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .preset-expand-toggle:focus-visible {
    outline: 2px solid var(--sp-accent);
    outline-offset: 3px;
    border-radius: 4px;
  }

  .gradient-preset-option:hover {
    border-color: rgba(37, 99, 235, 0.42);
    box-shadow: 0 12px 26px rgba(30, 64, 175, 0.1);
    transform: translateY(-1px);
  }

  .gradient-preset-option.active {
    border-color: rgba(37, 99, 235, 0.72);
    background: var(--sp-option-bg-active);
    box-shadow:
      0 0 0 3px rgba(37, 99, 235, 0.1),
      0 14px 28px rgba(15, 23, 42, 0.1);
  }

  .gradient-preset-option.active::after {
    content: '';
    position: absolute;
    top: 9px;
    right: 9px;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--sp-accent);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }

  .gradient-preset-option:focus-within {
    border-color: rgba(37, 99, 235, 0.72);
    box-shadow:
      0 0 0 3px rgba(37, 99, 235, 0.13),
      0 10px 22px rgba(15, 23, 42, 0.08);
  }

  .gradient-preset-option input[type='radio'] {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .preset-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    height: 28px;
  }

  .preset-swatch,
  .custom-preview span {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 10px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .preset-swatch.light {
    background: var(--preset-light-bg);
  }

  .preset-swatch.dark {
    background: var(--preset-dark-bg);
  }

  .custom-preview span:first-child {
    background:
      linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
      linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
      linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
    background-color: #ffffff;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    background-size: 12px 12px;
  }

  .custom-preview span:last-child {
    background:
      linear-gradient(45deg, rgba(148, 163, 184, 0.22) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(148, 163, 184, 0.22) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.22) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.22) 75%);
    background-color: #0f172a;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    background-size: 12px 12px;
  }

  .preset-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .preset-copy strong {
    color: var(--sp-heading);
    font-size: 13px;
    line-height: 1.25;
  }

  .preset-copy small {
    color: var(--sp-muted);
    font-size: 12px;
    line-height: 1.35;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .gradient-preset-option:hover .preset-copy small,
  .gradient-preset-option:focus-within .preset-copy small {
    overflow: visible;
    display: block;
    -webkit-line-clamp: unset;
    line-clamp: unset;
  }

  .my-theme {
    position: relative;
  }

  .my-theme-delete {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.55);
    color: #fff;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--transition-base), background var(--transition-base);
  }

  .my-theme:hover .my-theme-delete,
  .my-theme:focus-within .my-theme-delete {
    opacity: 1;
  }

  .my-theme-delete:hover {
    background: rgba(220, 38, 38, 0.9);
  }

  .save-theme-pop {
    display: grid;
    gap: 6px;
    border: 1px solid var(--sp-option-border);
    border-radius: 12px;
    padding: 10px 12px;
    background: var(--sp-option-bg);
  }

  .save-theme-pop label {
    color: var(--sp-heading);
    font-size: 13px;
    font-weight: 650;
  }

  .save-theme-row {
    display: flex;
    gap: 8px;
  }

  .save-theme-row input {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--sp-option-border);
    border-radius: 10px;
    padding: 7px 10px;
    background: var(--sp-input-bg, #ffffff);
    color: var(--sp-heading);
    font: inherit;
    font-size: 13px;
  }

  .save-theme-row input:focus-visible {
    outline: 2px solid var(--sp-accent);
    outline-offset: 1px;
  }

  .save-theme-confirm,
  .save-theme-cancel {
    border-radius: 10px;
    padding: 7px 12px;
    border: 1px solid var(--sp-option-border);
    background: transparent;
    color: var(--sp-heading);
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
  }

  .save-theme-confirm {
    background: var(--sp-accent);
    border-color: var(--sp-accent);
    color: #fff;
  }

  .save-theme-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .save-theme-toggle {
    color: var(--sp-accent);
  }

  .save-theme-toggle:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media (max-width: 720px) {
    .gradient-preset-header {
      flex-direction: column;
    }

    .gradient-preset-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .gradient-preset-group.collapsed .gradient-preset-option:nth-child(n + 3) {
      display: none;
    }

    .save-theme-row {
      flex-wrap: wrap;
    }
  }

  @media (max-width: 960px) and (min-width: 721px) {
    .gradient-preset-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .gradient-preset-group.collapsed .gradient-preset-option:nth-child(n + 4) { display: none; }
  }

  @media (max-width: 480px) {
    .gradient-preset-grid { grid-template-columns: 1fr; }
    .gradient-preset-group.collapsed .gradient-preset-option:nth-child(n + 2) { display: none; }
  }
</style>
