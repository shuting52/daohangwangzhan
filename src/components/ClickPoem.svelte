<script lang="ts">
  // 点击飘字特效 —— 灵感来自 daott.cn「不找了」导航站的 clicktip 插件
  // 点击页面空白处（非链接）时，从鼠标位置向上飘出社会主义核心价值观词语
  import { onDestroy, onMount } from 'svelte'

  // 可自定义的词语库（按顺序循环）
  const WORDS = ['富强', '民主', '文明', '和谐', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善']

  // 同时允许通过全局变量覆盖词语库，便于站长自定义
  type GlobalWithWords = { __clickPoemWords?: string[] }
  const globalThisTyped = globalThis as unknown as GlobalWithWords
  const words = (globalThisTyped.__clickPoemWords && globalThisTyped.__clickPoemWords.length > 0)
    ? globalThisTyped.__clickPoemWords
    : WORDS

  let wordIndex = 0
  let enabled = true
  let container: HTMLDivElement | null = null

  function handlePointerDown(event: MouseEvent) {
    if (!enabled) return
    // 点击链接、按钮、输入框时不触发（与 daott 行为一致：点击空白处才飘字）
    const target = event.target as HTMLElement | null
    if (!target) return
    const isInteractive = target.closest('a, button, input, textarea, select, [data-no-poem]')
    if (isInteractive) return

    const word = words[wordIndex]
    wordIndex = (wordIndex + 1) % words.length

    const el = document.createElement('span')
    el.className = 'click-poem-word'
    el.textContent = word
    // 用 pointerdown 的坐标，跟随手指/鼠标
    el.style.left = `${event.clientX}px`
    el.style.top = `${event.clientY}px`
    container?.appendChild(el)

    // 动画结束后移除节点，避免 DOM 无限累积
    window.setTimeout(() => {
      el.remove()
    }, 900)
  }

  onMount(() => {
    document.addEventListener('pointerdown', handlePointerDown)
  })

  onDestroy(() => {
    document.removeEventListener('pointerdown', handlePointerDown)
  })
</script>

<div
  class="click-poem-layer"
  bind:this={container}
  aria-hidden="true"
  data-no-poem
></div>

<style>
  .click-poem-layer {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    pointer-events: none;
    overflow: hidden;
  }

  .click-poem-word {
    position: absolute;
    transform: translate(-50%, -100%);
    font-size: 16px;
    font-weight: 700;
    color: #ff4d4f;
    font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
    pointer-events: none;
    user-select: none;
    text-shadow:
      0 1px 2px rgba(255, 77, 79, 0.35),
      0 0 8px rgba(255, 77, 79, 0.2);
    /* 上浮 + 淡出 + 轻微放大 */
    animation: click-poem-rise 0.9s ease-out forwards;
  }

  @keyframes click-poem-rise {
    0% {
      opacity: 0;
      transform: translate(-50%, -100%) scale(0.7);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -100%) scale(1.08);
    }
    30% {
      transform: translate(-50%, -100%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -180%) scale(0.95);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .click-poem-word {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }
</style>
