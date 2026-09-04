<script lang="ts">
  import { tick } from 'svelte'
  import {
    cloneSettingsForm,
    defaultMarquee,
    marqueeEffectOptions,
    type SettingsFormModel,
  } from '../../lib/settingsForm'
  import Switch from '../ui/Switch.svelte'
  import Slider from '../ui/Slider.svelte'
  import ColorAlphaInput from '../ColorAlphaInput.svelte'
  import Tooltip from '../ui/Tooltip.svelte'

  export let form: SettingsFormModel
  export let saving = false

  async function syncForm(): Promise<void> {
    await tick()
    form = cloneSettingsForm(form)
  }

  $: marquee = form.marquee ?? defaultMarquee
</script>

<fieldset id="settings-section-marquee" class="group group-wide" disabled={saving}>
  <legend>跑马灯公告</legend>
  <p class="group-desc">在页面顶部或底部显示滚动公告，可自定义文字、速度、日期与动态效果。</p>

  <div class="form-grid marquee-grid">
    <div class="field-switch field-toggle field-marquee-toggle">
      <span class="switch-copy">启用跑马灯 <Tooltip text="开启后在首页顶部/底部显示滚动公告条。" /></span>
      <Switch
        checked={marquee.enabled}
        ariaLabel="启用跑马灯公告"
        on:change={(event) => { form.marquee.enabled = event.detail; void syncForm() }}
      />
    </div>

    <div class="field field-marquee-source">
      <span class="field-label">公告内容来源</span>
      <div class="segmented-control marquee-source-control" role="radiogroup" aria-label="公告内容来源">
        <label class:active={!marquee.content_source || marquee.content_source === 'manual'}>
          <input type="radio" bind:group={marquee.content_source} value="manual" on:change={() => void syncForm()} />
          <span>手动文本</span>
        </label>
        <label class:active={marquee.content_source === 'recent'}>
          <input type="radio" bind:group={marquee.content_source} value="recent" on:change={() => void syncForm()} />
          <span>自动·最近上新</span>
        </label>
        <label class:active={marquee.content_source === 'tools'}>
          <input type="radio" bind:group={marquee.content_source} value="tools" on:change={() => void syncForm()} />
          <span>自动·全站工具</span>
        </label>
      </div>
      {#if marquee.content_source === 'recent'}
        <p class="field-hint">自动拼接最近 7 天上新的工具名（如“🆕 新上架：站点A、站点B”），无需手动维护。</p>
      {:else if marquee.content_source === 'tools'}
        <p class="field-hint">自动汇总当前全站可见工具清单，作为站点资源公告。</p>
      {/if}
    </div>

    <label class="field field-marquee-text">
      <span>手动公告文本</span>
      <input
        bind:value={marquee.text}
        type="text"
        maxlength="120"
        placeholder="输入公告内容，如：欢迎来到我的导航站 ♡"
        disabled={marquee.content_source === 'recent' || marquee.content_source === 'tools'}
        on:input={() => void syncForm()}
      />
      {#if marquee.content_source === 'recent' || marquee.content_source === 'tools'}
        <p class="field-hint">已选自动来源，此文本仅在暂无新增内容时作为兜底展示。</p>
      {/if}
    </label>

    <div class="field field-marquee-speed">
      <Slider
        label="滚动速度"
        format="count"
        countUnit="px/s"
        min={10}
        max={200}
        step={5}
        bind:value={marquee.speed}
        on:input={() => void syncForm()}
      />
    </div>

    <div class="field field-marquee-size">
      <Slider
        label="字号"
        format="px"
        min={12}
        max={32}
        step={1}
        bind:value={marquee.font_size}
        on:input={() => void syncForm()}
      />
    </div>

    <div class="field field-marquee-direction">
      <span class="field-label">滚动方向</span>
      <div class="segmented-control" role="radiogroup" aria-label="滚动方向">
        <label class:active={marquee.direction === 'left'}>
          <input type="radio" bind:group={marquee.direction} value="left" on:change={() => void syncForm()} />
          <span>向左</span>
        </label>
        <label class:active={marquee.direction === 'right'}>
          <input type="radio" bind:group={marquee.direction} value="right" on:change={() => void syncForm()} />
          <span>向右</span>
        </label>
      </div>
    </div>

    <div class="field field-marquee-effect">
      <span class="field-label">动态效果</span>
      <div class="segmented-control effect-control" role="radiogroup" aria-label="动态效果">
        {#each marqueeEffectOptions as option (option.value)}
          <label class:active={marquee.effect === option.value} title={option.hint}>
            <input type="radio" bind:group={marquee.effect} value={option.value} on:change={() => void syncForm()} />
            <span>{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <div class="field field-marquee-position">
      <span class="field-label">显示位置</span>
      <div class="segmented-control" role="radiogroup" aria-label="显示位置">
        <label class:active={marquee.position === 'top'}>
          <input type="radio" bind:group={marquee.position} value="top" on:change={() => void syncForm()} />
          <span>顶部</span>
        </label>
        <label class:active={marquee.position === 'bottom'}>
          <input type="radio" bind:group={marquee.position} value="bottom" on:change={() => void syncForm()} />
          <span>底部</span>
        </label>
      </div>
    </div>

    <div class="field field-marquee-color">
      <span>文字颜色</span>
      <ColorAlphaInput
        bind:value={marquee.color}
        on:change={() => void syncForm()}
        placeholder="#f472b6"
        inputLabel="公告文字颜色"
        swatchTitle="选择公告文字颜色"
        alphaText="公告文字透明度"
      />
    </div>

    <div class="field field-marquee-bg">
      <span>背景颜色</span>
      <ColorAlphaInput
        bind:value={marquee.background_color}
        on:change={() => void syncForm()}
        placeholder="#fff0f6"
        inputLabel="公告背景颜色"
        swatchTitle="选择公告背景颜色"
        alphaText="公告背景透明度"
      />
    </div>

    <div class="field-switch field-toggle field-marquee-date">
      <span class="switch-copy">显示日期 <Tooltip text="在公告开头显示当前日期。" /></span>
      <Switch
        checked={marquee.show_date}
        ariaLabel="显示日期"
        on:change={(event) => { form.marquee.show_date = event.detail; void syncForm() }}
      />
    </div>

    <label class="field field-marquee-date-format">
      <span>日期格式 <Tooltip text="支持 YYYY（年）、MM（月）、DD（日）、ddd（周几）。" /></span>
      <input
        bind:value={marquee.date_format}
        type="text"
        maxlength="40"
        placeholder="YYYY-MM-DD"
        on:input={() => void syncForm()}
      />
    </label>
  </div>
</fieldset>

<style>
  .marquee-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .field-marquee-toggle {
    grid-column: span 6;
  }

  .field-marquee-source {
    grid-column: span 12;
  }

  .field-marquee-text {
    grid-column: span 12;
  }

  .field-marquee-speed,
  .field-marquee-size {
    grid-column: span 4;
  }

  .field-marquee-direction,
  .field-marquee-position {
    grid-column: span 4;
  }

  .field-marquee-effect {
    grid-column: span 4;
  }

  .field-marquee-color,
  .field-marquee-bg {
    grid-column: span 4;
  }

  .field-marquee-date {
    grid-column: span 4;
  }

  .field-marquee-date-format {
    grid-column: span 4;
  }

  .field-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid var(--sp-toggle-border);
    border-radius: 12px;
    padding: 13px 15px;
    background: var(--sp-toggle-bg);
  }

  .switch-copy {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--sp-label);
    font-size: 14px;
    font-weight: 600;
  }

  .segmented-control {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .marquee-source-control {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field-hint {
    grid-column: 1 / -1;
    margin-top: 8px;
    color: var(--sp-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .effect-control {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 960px) {
    .field-marquee-toggle,
    .field-marquee-text,
    .field-marquee-source,
    .field-marquee-speed,
    .field-marquee-size,
    .field-marquee-direction,
    .field-marquee-effect,
    .field-marquee-position,
    .field-marquee-color,
    .field-marquee-bg,
    .field-marquee-date,
    .field-marquee-date-format {
      grid-column: 1 / -1;
    }
  }

  @container settings-editor (max-width: 620px) {
    .field-marquee-toggle,
    .field-marquee-text,
    .field-marquee-source,
    .field-marquee-speed,
    .field-marquee-size,
    .field-marquee-direction,
    .field-marquee-effect,
    .field-marquee-position,
    .field-marquee-color,
    .field-marquee-bg,
    .field-marquee-date,
    .field-marquee-date-format {
      grid-column: 1 / -1;
    }

    .marquee-source-control {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .effect-control {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
