<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { themeTemplates, type ThemeTemplate } from '../../../shared/themeTemplates'

  export let activeThemePresetId: string = 'custom'
  export let activeTemplateId: string | null = null

  const dispatch = createEventDispatcher<{
    select: ThemeTemplate
    custom: void
  }>()

  $: templates = themeTemplates
  $: activeId = activeThemePresetId !== 'custom' ? activeThemePresetId : (activeTemplateId ?? null)

  function handleSelect(template: ThemeTemplate): void {
    dispatch('select', template)
  }
</script>

<div class="theme-template-panel">
  <div class="theme-template-header">
    <div>
      <strong>主题模板</strong>
      <p>一键切换整体风格（含背景、卡片、标题动态效果），以女孩风格为设计导向，选择后点击「保存设置」生效。</p>
    </div>
    <span>{activeId ? '已选模板' : '自定义'}</span>
  </div>

  <div class="theme-template-grid">
    {#each templates as template (template.id)}
      <button
        type="button"
        class="theme-template-option"
        class:active={activeId === template.id}
        style={`
          --tpl-bg: ${template.light.background.value};
          --tpl-card: ${template.light.card_background_color};
          --tpl-title: ${template.light.site_title_color};
          --tpl-dark-bg: ${template.dark.background.value};
          --tpl-dark-card: ${template.dark.card_background_color};
        `}
        title={`${template.name}：${template.description}`}
        on:click={() => handleSelect(template)}
      >
        <span class="tpl-preview" aria-hidden="true">
          <span class="tpl-scene light">
            <span class="tpl-title">♡ {template.name}</span>
            <span class="tpl-card"></span>
          </span>
          <span class="tpl-scene dark">
            <span class="tpl-title">{template.name}</span>
            <span class="tpl-card"></span>
          </span>
        </span>
        <span class="tpl-copy">
          <strong>{template.name}</strong>
          <small>{template.description}</small>
        </span>
        <span class="tpl-tag">{template.tag}</span>
      </button>
    {/each}

    <button
      type="button"
      class="theme-template-option custom"
      class:active={activeId === null}
      title="回到自定义配色，保留你手动设置的背景与卡片参数"
      on:click={() => dispatch('custom')}
    >
      <span class="tpl-preview" aria-hidden="true">
        <span class="tpl-scene custom-scene"><span class="tpl-title">自定义</span><span class="tpl-card"></span></span>
      </span>
      <span class="tpl-copy">
        <strong>自定义风格</strong>
        <small>关闭模板，使用下方配色方案与背景设置。</small>
      </span>
    </button>
  </div>
</div>

<style>
  .theme-template-panel {
    display: grid;
    gap: 10px;
    min-width: 0;
    border: 1px solid var(--sp-gradient-panel-border);
    border-radius: 16px;
    padding: 12px;
    background: var(--sp-gradient-panel-bg);
  }

  .theme-template-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .theme-template-header strong {
    display: block;
    color: var(--sp-heading);
    font-size: 14px;
  }

  .theme-template-header p {
    margin: 4px 0 0;
    color: var(--sp-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .theme-template-header > span {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--sp-chip-bg);
    color: var(--sp-chip-text);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 9px;
  }

  .theme-template-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .theme-template-option {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    border: 1px solid var(--sp-option-border);
    border-radius: 14px;
    padding: 10px;
    background: var(--sp-option-bg);
    text-align: left;
    cursor: pointer;
    transition:
      border-color var(--transition-base),
      box-shadow var(--transition-base),
      transform var(--transition-base),
      background var(--transition-base);
  }

  .theme-template-option:hover {
    border-color: rgba(236, 72, 153, 0.45);
    box-shadow: 0 12px 26px rgba(190, 24, 93, 0.12);
    transform: translateY(-2px);
  }

  .theme-template-option.active {
    border-color: rgba(236, 72, 153, 0.75);
    background: var(--sp-option-bg-active);
    box-shadow:
      0 0 0 3px rgba(236, 72, 153, 0.12),
      0 14px 28px rgba(15, 23, 42, 0.1);
  }

  .theme-template-option.active::after {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #ec4899;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    line-height: 18px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(236, 72, 153, 0.4);
  }

  .tpl-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    height: 74px;
    border-radius: 10px;
    overflow: hidden;
  }

  .tpl-scene {
    position: relative;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 8px;
  }

  .tpl-scene.light {
    background: var(--tpl-bg);
  }

  .tpl-scene.dark {
    background: var(--tpl-dark-bg);
  }

  .tpl-scene.custom-scene {
    background:
      linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
      linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
      linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
    background-color: #ffffff;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    background-size: 12px 12px;
    grid-column: 1 / -1;
  }

  .tpl-title {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--tpl-title);
    font-size: 11px;
    font-weight: 800;
  }

  .tpl-scene.dark .tpl-title {
    color: var(--tpl-title);
  }

  .tpl-card {
    display: block;
    width: 62%;
    height: 14px;
    border-radius: 5px;
    background: var(--tpl-card);
    opacity: 0.92;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
  }

  .tpl-scene.dark .tpl-card {
    background: var(--tpl-dark-card);
  }

  .tpl-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .tpl-copy strong {
    color: var(--sp-heading);
    font-size: 13px;
    line-height: 1.25;
  }

  .tpl-copy small {
    color: var(--sp-muted);
    font-size: 12px;
    line-height: 1.4;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .tpl-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 999px;
    background: rgba(236, 72, 153, 0.16);
    color: #db2777;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
  }

  .theme-template-option.custom .tpl-tag {
    display: none;
  }

  @media (max-width: 720px) {
    .theme-template-header {
      flex-direction: column;
    }

    .theme-template-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .theme-template-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
