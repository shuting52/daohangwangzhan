<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { PublicSettings } from '../../shared/types'
  import SearchBox from './SearchBox.svelte'

  export let pageTitle = ''
  export let siteTitleColor = 'inherit'
  export let siteTitleFontSize = 32
  export let settings: PublicSettings | null = null
  export let query = ''
  export let topNavigation = false
  export let preview = false
  export let themeOverride: 'light' | 'dark' | null = null

  $: effect = settings?.site_title_effect ?? 'none'

  // 打字机效果状态（持续循环：打字 → 停顿 → 删除 → 停顿 → 重新打字）
  let typingText = pageTitle
  let typingTimer: ReturnType<typeof setInterval> | null = null
  let typingTimeout: ReturnType<typeof setTimeout> | null = null
  let typingStarted = false

  $: if (effect === 'typing' && !typingStarted && typeof window !== 'undefined') {
    typingStarted = true
    startTyping()
  }

  function stopTypingTimers(): void {
    if (typingTimer) clearInterval(typingTimer)
    if (typingTimeout) clearTimeout(typingTimeout)
    typingTimer = null
    typingTimeout = null
  }

  function startTyping(): void {
    const full = pageTitle
    let index = 0
    let deleting = false
    stopTypingTimers()
    typingTimer = setInterval(() => {
      if (!deleting) {
        index += 1
        typingText = full.slice(0, index)
        if (index >= full.length) {
          // 打字完成后停顿 1.6 秒，再进入删除阶段
          stopTypingTimers()
          typingTimeout = setTimeout(() => {
            deleting = true
            typingTimer = setInterval(() => {
              index -= 1
              typingText = full.slice(0, index)
              if (index <= 0) {
                // 删除完成后停顿 0.6 秒，重新开始打字
                stopTypingTimers()
                typingTimeout = setTimeout(startTyping, 600)
              }
            }, 60)
          }, 1600)
        }
      }
    }, 120)
  }

  onDestroy(() => {
    stopTypingTimers()
  })
</script>

<section
  class="hero-search"
  class:top-navigation={topNavigation}
  class:preview
  class:preview-light={preview && themeOverride === 'light'}
  aria-label="站点搜索"
>
  {#if settings?.site_title_show ?? true}
    <h1
      class="site-title"
      class:title-typing={effect === 'typing'}
      class:title-gradient={effect === 'gradient'}
      class:title-wave={effect === 'wave'}
      class:title-shimmer={effect === 'shimmer'}
      class:title-glow={effect === 'glow'}
      style={`
        color: ${siteTitleColor};
        font-size: ${siteTitleFontSize}px;
        ${effect === 'gradient' ? '-webkit-text-fill-color: transparent; background: linear-gradient(90deg, var(--title-gradient-a, #ec4899), var(--title-gradient-b, #8b5cf6), var(--title-gradient-c, #06b6d4), var(--title-gradient-a, #ec4899)); background-size: 300% auto; -webkit-background-clip: text; background-clip: text;' : '-webkit-text-fill-color: initial; background: none; -webkit-background-clip: unset;'}
      `}
    >{effect === 'typing' ? typingText : pageTitle}</h1>
  {/if}
  {#if settings?.search_box_show ?? true}
    <div class="search-card">
      <SearchBox
        searchEngine={settings?.search_engine ?? null}
        bind:query
        showEngineSelector={settings?.search_engine_selector_show ?? true}
        {preview}
        {themeOverride}
      />
    </div>
  {/if}
</section>

<style>
  .hero-search {
    display: grid;
    gap: 0.85rem;
    max-width: 680px;
    margin: calc(3rem + var(--content-margin-top, 0%)) auto 1.25rem;
    text-align: center;
  }

  .hero-search.top-navigation {
    margin-top: calc(3.5rem + var(--content-margin-top, 0%));
  }

  .site-title {
    margin: 0;
    font-weight: 700;
    line-height: 1.1;
    overflow-wrap: anywhere;
    text-shadow: 0 2px 12px rgba(15, 23, 42, 0.22);
  }

  /* 打字机效果 */
  .site-title.title-typing::after {
    content: '▌';
    display: inline-block;
    margin-left: 2px;
    color: inherit;
    animation: title-caret-blink 0.8s step-end infinite;
  }

  @keyframes title-caret-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* 渐变流光 */
  .site-title.title-gradient {
    animation: title-gradient-flow 5s linear infinite;
    text-shadow: 0 2px 14px rgba(236, 72, 153, 0.18);
  }

  @keyframes title-gradient-flow {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }

  /* 波浪律动 */
  .site-title.title-wave {
    animation: title-wave-bounce 1.6s ease-in-out infinite;
    transform-origin: 50% 100%;
  }

  @keyframes title-wave-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    30% { transform: translateY(-4px) scale(1.015); }
    60% { transform: translateY(2px) scale(0.99); }
  }

  /* 扫光闪烁 */
  .site-title.title-shimmer {
    animation: title-shimmer-pulse 2.2s ease-in-out infinite;
  }

  @keyframes title-shimmer-pulse {
    0%, 100% { opacity: 1; text-shadow: 0 0 0 rgba(255, 255, 255, 0); }
    50% { opacity: 0.82; text-shadow: 0 0 18px rgba(255, 255, 255, 0.55); }
  }

  /* 呼吸发光 */
  .site-title.title-glow {
    animation: title-glow-breath 2.6s ease-in-out infinite;
  }

  @keyframes title-glow-breath {
    0%, 100% { text-shadow: 0 2px 12px rgba(15, 23, 42, 0.22); }
    50% { text-shadow: 0 0 22px currentColor, 0 0 46px rgba(236, 72, 153, 0.35); }
  }

  .search-card {
    max-width: 680px;
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: 1.5rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(255, 255, 255, 0.68);
  }

  :global([data-theme='dark']) .search-card {
    border-color: transparent;
    background: transparent;
  }

  .hero-search.preview {
    gap: 0.65rem;
    width: min(100%, 34rem);
    margin: calc(1.5rem + var(--content-margin-top, 0%)) auto 1rem;
    padding: 0 0.75rem;
    box-sizing: border-box;
  }

  .hero-search.preview.top-navigation {
    margin-top: calc(3.2rem + var(--content-margin-top, 0%));
  }

  .hero-search.preview .search-card {
    padding: 0.55rem;
    border-radius: 1rem;
  }

  .hero-search.preview-light .search-card {
    border-color: rgba(148, 163, 184, 0.18);
    background: rgba(255, 255, 255, 0.68);
  }

  @media (max-width: 720px) {
    .hero-search {
      gap: 0.75rem;
      margin-top: 3.5rem;
      padding: 0 0.25rem;
    }

    .hero-search.top-navigation {
      margin-top: 3rem;
    }

    .search-card {
      margin-top: 0.75rem;
      padding: 0.6rem;
      border-radius: 1rem;
    }
  }

  @media (max-width: 420px) {
    .search-card {
      padding: 0.55rem;
      border-radius: 0.95rem;
    }
  }
</style>
