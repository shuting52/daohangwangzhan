<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { CardStyle, DescriptionDisplayMode, PublicBookmark } from '../../shared/types'
  import BookmarkCardCompact from './BookmarkCardCompact.svelte'
  import { isNewBookmark } from '../lib/bookmarkNewBadge'
  import { publicStore } from '../lib/stores'
  import { api } from '../lib/api'
  import BookmarkCardInfo from './BookmarkCardInfo.svelte'
  import BookmarkContextMenu from './BookmarkContextMenu.svelte'
  import BookmarkLinkModal from './BookmarkLinkModal.svelte'
  import { getIconCardTrackWidth } from '../lib/bookmarkCardLayout'
  import { buildIconStyle } from '../lib/bookmarkIconDisplay'
  import {
    BOOKMARK_CONTEXT_MENU_OPEN_EVENT,
    canOpenBookmarkContextMenu,
    createBookmarkContextMenuOpenEvent,
    isExternalContextMenuOpenEvent,
    shouldBlockCardNavigation,
    shouldOpenBookmarkModal,
  } from '../lib/bookmarkCardInteractions'
  import {
    deriveBookmarkCardIconBase,
    deriveBookmarkCardIconUrl,
  } from '../lib/bookmarkCardIconState'
  import { observeIconVisibility } from '../lib/iconVisibility'
  import {
    fetchCachedBookmarkIconUrl,
    readCachedBookmarkIconDataUri,
    revokeLocalIconUrl,
  } from '../lib/localBookmarkIconCache'

  type AsyncVoid<T = void> = T | Promise<T>

  export let bookmark: PublicBookmark
  export let style: CardStyle = 'info'
  export let iconSize: number = 100
  export let showDescription: boolean = true
  export let descriptionMode: DescriptionDisplayMode = showDescription ? 'always' : 'hidden'
  export let showIconTitle: boolean = true
  export let width: number = 200
  export let height: number = 0
  export let canEdit = false
  export let sortMode = false
  export let preview = false
  export let themeOverride: 'light' | 'dark' | null = null
  export let onEdit: ((bookmark: PublicBookmark) => AsyncVoid) | undefined = undefined

  let cachedIconFailed = false
  let fallbackFailed = false
  let localCachedIconUrl = ''
  let syncLocalCachedIconUrl = ''
  let localCachePending = false
  let localCacheRequestId = 0
  let iconInView = false
  let shellElement: HTMLDivElement | null = null
  let stopIconVisibilityObserver: (() => void) | null = null
  let contextMenuOpen = false
  let modalOpen = false
  let iconStateKey = ''
  let windowListenersAttached = false
  let contextMenuInstanceId = Math.random().toString(36).slice(2)
  let clickBubbleVisible = false
  let clickBubbleStyle = ''
  let clickBubbleTimer: ReturnType<typeof setTimeout> | null = null

  $: openInNewTab = bookmark.open_method === 1
  $: isRecommended = bookmark.is_recommended === true || bookmark.is_recommended === 1
  $: clickCount = typeof bookmark.click_count === 'number' ? bookmark.click_count : 0
  $: showNewBadge = isNewBookmark({ created_at: bookmark.created_at, url: bookmark.url })
  $: iconBaseState = deriveBookmarkCardIconBase({
    bookmark,
    iconInView,
  })
  $: cachedIcon = iconBaseState.cachedIcon
  $: iconText = iconBaseState.iconText
  $: nextIconStateKey = iconBaseState.nextIconStateKey
  $: localCacheKey = iconBaseState.localCacheKey
  $: shouldReadLocalIconCache = iconBaseState.shouldReadLocalIconCache
  $: shouldWaitForLocalIconCache = iconBaseState.shouldWaitForLocalIconCache
  $: syncLocalCachedIconUrl = iconInView && !iconBaseState.hasEmbeddedIcon
    ? readCachedBookmarkIconDataUri(localCacheKey) ?? ''
    : ''
  $: iconUrlState = deriveBookmarkCardIconUrl({
    bookmark,
    baseState: iconBaseState,
    cachedIconFailed,
    fallbackFailed,
    syncLocalCachedIconUrl,
    localCachedIconUrl,
    localCachePending,
  })
  $: iconUrl = iconUrlState.iconUrl
  $: hasRenderableIcon = iconUrlState.hasRenderableIcon
  $: infoCardHeight = height > 0 ? height : 70
  $: infoIconInset = infoCardHeight <= 56 ? 6 : 8
  $: infoIconSize = Math.max(32, Math.min(infoCardHeight - infoIconInset * 2, width - infoIconInset * 2))
  $: compactIconSize = Math.max(0, iconSize)
  $: compactShellWidth = getIconCardTrackWidth(compactIconSize, showIconTitle)
  $: iconBackgroundColor = bookmark.icon_background_color || ''
  $: hasCustomIconBackground = Boolean(iconBackgroundColor)
  $: infoIconStyle = buildIconStyle(infoIconSize, { customBackground: iconBackgroundColor })
  $: compactIconStyle = buildIconStyle(compactIconSize, {
    compact: true,
    customBackground: iconBackgroundColor,
  })
  $: tooltipText = bookmark.description ? `${bookmark.title}\n${bookmark.description}` : bookmark.title
  $: cardShellStyle =
    style === 'info'
      ? `--card-configured-min-width: ${Math.max(0, width)}px; ${height > 0 ? `height: ${height}px;` : ''}`
      : `width: ${compactShellWidth}px;`
  $: cardLinkStyle = height > 0 ? `height: ${height}px;` : ''
  $: if (nextIconStateKey !== iconStateKey) {
    iconStateKey = nextIconStateKey
    cachedIconFailed = false
    fallbackFailed = false
    resetLocalCachedIconUrl()
    if (shouldReadLocalIconCache) {
      void loadLocalCachedIcon(localCacheKey, shouldWaitForLocalIconCache)
    } else {
      localCachePending = false
    }
  }
  $: syncWindowListeners(contextMenuOpen || modalOpen)

  function resetLocalCachedIconUrl() {
    if (localCachedIconUrl) {
      revokeLocalIconUrl(localCachedIconUrl)
      localCachedIconUrl = ''
    }
  }

  async function loadLocalCachedIcon(cacheKey: string, waitForLocalCache: boolean) {
    if (waitForLocalCache) {
      localCachePending = true
    }

    const result = await fetchCachedBookmarkIconUrl(cacheKey, { current: localCacheRequestId })
    if (result.stale) return
    if (result.url) {
      resetLocalCachedIconUrl()
      localCachedIconUrl = result.url
    }
    localCachePending = false
  }

  function handleIconError() {
    if (localCachedIconUrl) {
      resetLocalCachedIconUrl()
      return
    }

    if (!cachedIconFailed && /^data:image\//i.test(cachedIcon)) {
      cachedIconFailed = true
      return
    }

    fallbackFailed = true
  }

  function handleIconLoad() {
    localCachePending = false
    fallbackFailed = false
  }

  function closeContextMenu() {
    contextMenuOpen = false
  }

  function notifyContextMenuOpen() {
    window.dispatchEvent(createBookmarkContextMenuOpenEvent(contextMenuInstanceId))
  }

  function handleContextMenuOpenEvent(event: Event) {
    if (isExternalContextMenuOpenEvent(event, contextMenuInstanceId)) {
      closeContextMenu()
    }
  }

  function handleContextMenu(event: MouseEvent) {
    if (shouldBlockCardNavigation(sortMode)) {
      event.preventDefault()
      return
    }
    if (!canOpenBookmarkContextMenu({ sortMode, canEdit, hasEditHandler: Boolean(onEdit) })) return
    event.preventDefault()
    event.stopPropagation()
    notifyContextMenuOpen()
    contextMenuOpen = true
  }

  function showClickBubble() {
    if (sortMode || preview) return
    if (clickBubbleTimer) {
      clearTimeout(clickBubbleTimer)
      clickBubbleTimer = null
    }
    if (!shellElement) return
    const rect = shellElement.getBoundingClientRect()
    const bubbleWidth = 140
    const bubbleHeight = 30
    let top = rect.top - bubbleHeight - 8
    if (top < 4) top = rect.bottom + 8
    let left = rect.left + rect.width / 2 - bubbleWidth / 2
    left = Math.max(4, Math.min(left, window.innerWidth - bubbleWidth - 4))
    clickBubbleStyle = `left: ${left}px; top: ${top}px;`
    clickBubbleVisible = true
  }

  function hideClickBubble() {
    clickBubbleTimer = window.setTimeout(() => {
      clickBubbleVisible = false
    }, 120)
  }

  async function handleEditClick() {
    closeContextMenu()
    await onEdit?.(bookmark)
  }

  function handleLinkClick(event: MouseEvent) {
    if (preview) {
      event.preventDefault()
      return
    }
    if (shouldBlockCardNavigation(sortMode)) {
      event.preventDefault()
      return
    }

    // Register click both locally and on server
    publicStore.incrementClick(bookmark.id)
    void api.public.registerClick(bookmark.id)

    if (!shouldOpenBookmarkModal({ sortMode, openMethod: bookmark.open_method })) return
    event.preventDefault()
    modalOpen = true
  }

  function closeModal() {
    modalOpen = false
  }

  function handleWindowClick() {
    if (contextMenuOpen) closeContextMenu()
  }

  function handleDocumentKeydown(event: KeyboardEvent) {
    if (modalOpen && event.key === 'Escape') closeModal()
    if (contextMenuOpen && event.key === 'Escape') closeContextMenu()
  }

  function markIconInView() {
    iconInView = true
    disconnectIconObserver()
  }

  function disconnectIconObserver() {
    stopIconVisibilityObserver?.()
    stopIconVisibilityObserver = null
  }

  function setupIconObserver() {
    disconnectIconObserver()
    if (iconInView) return

    if (shellElement) {
      stopIconVisibilityObserver = observeIconVisibility(shellElement, markIconInView)
    } else {
      iconInView = true
    }
  }

  function syncWindowListeners(active: boolean) {
    if (typeof window === 'undefined') return

    if (active && !windowListenersAttached) {
      window.addEventListener('click', handleWindowClick)
      window.addEventListener('keydown', handleDocumentKeydown)
      window.addEventListener(BOOKMARK_CONTEXT_MENU_OPEN_EVENT, handleContextMenuOpenEvent)
      windowListenersAttached = true
      return
    }

    if (!active && windowListenersAttached) {
      window.removeEventListener('click', handleWindowClick)
      window.removeEventListener('keydown', handleDocumentKeydown)
      window.removeEventListener(BOOKMARK_CONTEXT_MENU_OPEN_EVENT, handleContextMenuOpenEvent)
      windowListenersAttached = false
    }
  }

  onMount(() => {
    setupIconObserver()
  })

  onDestroy(() => {
    localCacheRequestId += 1
    disconnectIconObserver()
    resetLocalCachedIconUrl()
    syncWindowListeners(false)
    if (clickBubbleTimer) {
      clearTimeout(clickBubbleTimer)
      clickBubbleTimer = null
    }
  })
</script>

<div
  class="bookmark-card-shell"
  class:is-info={style === 'info'}
  class:is-icon={style !== 'info'}
  class:sort-mode={sortMode}
  style={cardShellStyle}
  bind:this={shellElement}
  on:mouseenter={showClickBubble}
  on:mouseleave={hideClickBubble}
>
  {#if isRecommended && !sortMode}
    <span class="navcat-badge" aria-hidden="true">
      <span class="badge-full">推荐</span><span class="badge-short">推</span>
    </span>
  {/if}

  {#if clickBubbleVisible && !sortMode && !preview}
    <span class="click-bubble" style={clickBubbleStyle} aria-hidden="true">
      <svg class="click-bubble-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      今日点击 {clickCount} 次
    </span>
  {/if}

  {#if style === 'info'}
    <BookmarkCardInfo
      {bookmark}
      {openInNewTab}
      {sortMode}
      {cardLinkStyle}
      {showDescription}
      {descriptionMode}
      {tooltipText}
      iconUrl={hasRenderableIcon ? iconUrl : ''}
      {iconText}
      {infoIconSize}
      {infoIconStyle}
      {hasCustomIconBackground}
      {preview}
      {themeOverride}
      {showNewBadge}
      onLinkClick={handleLinkClick}
      onContextMenu={handleContextMenu}
      onIconError={handleIconError}
      onIconLoad={handleIconLoad}
    />
  {:else}
    <BookmarkCardCompact
      {bookmark}
      {openInNewTab}
      {sortMode}
      {tooltipText}
      {compactIconSize}
      {compactIconStyle}
      {showIconTitle}
      iconUrl={hasRenderableIcon ? iconUrl : ''}
      {iconText}
      {hasCustomIconBackground}
      {preview}
      {themeOverride}
      {showNewBadge}
      onLinkClick={handleLinkClick}
      onContextMenu={handleContextMenu}
      onIconError={handleIconError}
      onIconLoad={handleIconLoad}
    />
  {/if}

  {#if contextMenuOpen}
    <BookmarkContextMenu onEdit={handleEditClick} />
  {/if}

  {#if modalOpen}
    <BookmarkLinkModal title={bookmark.title} url={bookmark.url} onClose={closeModal} />
  {/if}
</div>

<style>
  .bookmark-card-shell {
    position: relative;
    z-index: 0;
    min-width: 0;
    contain: layout style;
  }

  .bookmark-card-shell:hover,
  .bookmark-card-shell:focus-within {
    z-index: 1;
  }

  .bookmark-card-shell.is-info {
    width: 100%;
    min-width: var(--card-configured-min-width, 200px);
  }

  .bookmark-card-shell.is-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
  }

  @media (max-width: 500px) {
    .bookmark-card-shell.is-info {
      min-width: 0;
    }
  }

  /* ===== 推荐/推 角标（灵感来自 daott.cn） ===== */
  .navcat-badge {
    position: absolute;
    top: -6px;
    left: -6px;
    z-index: 12;
    transform: rotate(-15deg);
    border-radius: 5px;
    padding: 2px 6px;
    font-size: 0.66rem;
    font-weight: 800;
    line-height: 1.4;
    letter-spacing: 0.03em;
    color: #fff;
    background: linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%);
    box-shadow: 0 2px 8px rgba(217, 54, 62, 0.4);
    pointer-events: none;
    user-select: none;
  }

  .navcat-badge .badge-short {
    display: none;
  }

  /* 窄屏/图标卡：只显示「推」省空间 */
  @media (max-width: 640px) {
    .navcat-badge .badge-full {
      display: none;
    }
    .navcat-badge .badge-short {
      display: inline;
    }
  }

  :global([data-theme='dark']) .navcat-badge {
    background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
    box-shadow: 0 2px 10px rgba(220, 38, 38, 0.5);
  }

  /* ===== 今日点击气泡 ===== */
  .click-bubble {
    position: fixed;
    z-index: 9999;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    color: #fff;
    background: rgba(15, 23, 42, 0.92);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
    pointer-events: none;
    user-select: none;
    animation: click-bubble-in 0.18s ease-out;
  }

  .click-bubble-icon {
    width: 13px;
    height: 13px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  @keyframes click-bubble-in {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.94);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (hover: none) {
    .click-bubble {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .click-bubble {
      animation: none;
    }
  }

</style>
