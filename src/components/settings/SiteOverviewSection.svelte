<script lang="ts">
  import { onMount } from 'svelte'
  import type { AdminStats } from '../../../shared/types'
  import { adminApi, getErrorMessage } from '../../lib/api'
  import { toastStore } from '../../lib/toast'

  let stats: AdminStats | null = null
  let loading = true
  let refreshing = false
  let loadError = ''
  let lastUpdated: string | null = null
  let copied = false

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : ''

  function formatNumber(value: number): string {
    if (value >= 10000) return `${(value / 10000).toFixed(1)} 万`
    return String(value)
  }

  function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const amount = bytes / 1024 ** index
    return `${amount >= 100 ? amount.toFixed(0) : amount.toFixed(1)} ${units[index]}`
  }

  async function fetchStats(manual = false): Promise<void> {
    if (manual) {
      refreshing = true
    } else {
      loading = true
    }
    loadError = ''
    try {
      const data = await adminApi.stats()
      stats = data
      lastUpdated = new Date(data.generatedAt).toLocaleTimeString('zh-CN', { hour12: false })
    } catch (error) {
      loadError = getErrorMessage(error)
      if (manual) {
        toastStore.addToast(`刷新失败：${loadError}`, 'error')
      }
    } finally {
      loading = false
      refreshing = false
    }
  }

  async function copySiteUrl(): Promise<void> {
    if (!siteOrigin) return
    try {
      await navigator.clipboard.writeText(siteOrigin)
      copied = true
      toastStore.addToast('站点地址已复制', 'success')
      setTimeout(() => {
        copied = false
      }, 1600)
    } catch {
      toastStore.addToast('复制失败，请手动复制地址', 'error')
    }
  }

  function openSite(): void {
    if (siteOrigin) {
      window.open(siteOrigin, '_blank', 'noopener')
    }
  }

  onMount(() => {
    void fetchStats(false)
  })
</script>

<fieldset id="settings-section-overview" class="group group-wide sio-fieldset">
  <legend>站点数据中心</legend>
  <p class="group-desc">实时汇总站点规模与存储使用，数据来自数据库直查，点击「刷新」可获取最新状态。</p>

  <div class="sio-toolbar">
    <span class="sio-toolbar-status">
      {#if lastUpdated}
        <span class="sio-pulse" aria-hidden="true"></span> 已刷新于 {lastUpdated}
      {:else if loading}
        正在获取实时数据…
      {:else}
        等待刷新
      {/if}
    </span>
    <button
      type="button"
      class="sio-refresh-btn"
      disabled={loading || refreshing}
      on:click={() => void fetchStats(true)}>
      {#if refreshing}刷新中…{:else}↻ 刷新数据{/if}
    </button>
  </div>

  {#if loadError && !stats}
    <div class="sio-error">加载失败：{loadError}，请确认已登录后重试。</div>
  {:else if stats}
    <div class="sio-stats-grid">
      <div class="sio-stat-card">
        <span class="sio-stat-label">书签总数</span>
        <strong class="sio-stat-value">{formatNumber(stats.bookmarks)}</strong>
        <span class="sio-stat-sub">
          {#if stats.publicBookmarks === stats.bookmarks}
            全部公开
          {:else}
            公开 {formatNumber(stats.publicBookmarks)} · 私密 {formatNumber(stats.bookmarks - stats.publicBookmarks)}
          {/if}
        </span>
      </div>
      <div class="sio-stat-card">
        <span class="sio-stat-label">分类数</span>
        <strong class="sio-stat-value">{formatNumber(stats.categories)}</strong>
        <span class="sio-stat-sub">导航栏目</span>
      </div>
      <div class="sio-stat-card">
        <span class="sio-stat-label">累计点击数</span>
        <strong class="sio-stat-value">{formatNumber(stats.clicks)}</strong>
        <span class="sio-stat-sub">书签跳转总量</span>
      </div>
      <div class="sio-stat-card">
        <span class="sio-stat-label">上传文件</span>
        <strong class="sio-stat-value">{formatNumber(stats.uploads.files)}</strong>
        <span class="sio-stat-sub">共 {formatBytes(stats.uploads.bytes)}</span>
      </div>
    </div>

    <div class="sio-meta-row">
      <div class="sio-meta-item">
        <span class="sio-meta-key">存储构成</span>
        <span class="sio-meta-value">
          {#if stats.uploads.r2Files > 0}
            R2 对象 {stats.uploads.r2Files} 个
          {/if}
          {#if stats.uploads.d1Files > 0}
            {#if stats.uploads.r2Files > 0} · {/if}D1 内嵌 {stats.uploads.d1Files} 个
          {/if}
          {#if stats.uploads.files === 0}暂无文件{/if}
        </span>
      </div>
      {#if stats.version}
        <div class="sio-meta-item">
          <span class="sio-meta-key">数据版本</span>
          <span class="sio-meta-value">{stats.version}</span>
        </div>
      {/if}
    </div>

    <div class="sio-actions">
      <div class="sio-site-url" title={siteOrigin}>
        <span class="sio-site-url-key">站点地址</span>
        <span class="sio-site-url-value">{siteOrigin || '—'}</span>
      </div>
      <button type="button" class="sio-btn" disabled={!siteOrigin} on:click={() => void copySiteUrl()}>
        {copied ? '已复制 ✓' : '复制地址'}
      </button>
      <button type="button" class="sio-btn sio-btn-primary" disabled={!siteOrigin} on:click={openSite}>
        打开站点 ↗
      </button>
    </div>
  {:else if loading}
    <div class="sio-loading">数据加载中，请稍候…</div>
  {/if}
</fieldset>

<style>
  .sio-fieldset {
    padding-top: 4px;
  }

  .sio-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin: 2px 0 14px;
  }

  .sio-toolbar-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--sp-muted, #6b7280);
  }

  .sio-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
    animation: sio-pulse 1.8s infinite;
  }

  @keyframes sio-pulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45); }
    70% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }

  .sio-refresh-btn {
    border: 1px solid var(--sp-toggle-border, #d1d5db);
    background: var(--sp-toggle-bg, #f9fafb);
    color: var(--sp-strong, #111827);
    font-size: 12.5px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 9px;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .sio-refresh-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: var(--sp-accent-border, #9ca3af);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  }

  .sio-refresh-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sio-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .sio-stat-card {
    border: 1px solid var(--sp-toggle-border, #e5e7eb);
    background: var(--sp-toggle-bg, #f9fafb);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    transition: var(--transition-fast);
  }

  .sio-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.07);
  }

  .sio-stat-label {
    font-size: 12px;
    color: var(--sp-muted, #6b7280);
  }

  .sio-stat-value {
    font-size: 26px;
    line-height: 1.1;
    font-weight: 750;
    color: var(--sp-accent-strong, #111827);
    letter-spacing: -0.02em;
  }

  .sio-stat-sub {
    font-size: 11.5px;
    color: var(--sp-muted, #9ca3af);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sio-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin: 14px 2px 0;
  }

  .sio-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .sio-meta-key {
    color: var(--sp-muted, #6b7280);
  }

  .sio-meta-value {
    color: var(--sp-strong, #111827);
    font-weight: 600;
    word-break: break-all;
  }

  .sio-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed var(--sp-toggle-border, #e5e7eb);
  }

  .sio-site-url {
    flex: 1 1 180px;
    min-width: 0;
    border: 1px solid var(--sp-toggle-border, #e5e7eb);
    background: var(--sp-toggle-bg, #f9fafb);
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sio-site-url-key {
    font-size: 11px;
    color: var(--sp-muted, #6b7280);
  }

  .sio-site-url-value {
    font-size: 13px;
    font-weight: 650;
    color: var(--sp-strong, #111827);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sio-btn {
    border: 1px solid var(--sp-toggle-border, #d1d5db);
    background: var(--sp-toggle-bg, #f9fafb);
    color: var(--sp-strong, #111827);
    font-size: 12.5px;
    font-weight: 600;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: var(--transition-fast);
    white-space: nowrap;
  }

  .sio-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: var(--sp-accent-border, #9ca3af);
  }

  .sio-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sio-btn-primary {
    background: var(--sp-accent, #111827);
    border-color: var(--sp-accent, #111827);
    color: var(--sp-accent-contrast, #ffffff);
  }

  .sio-btn-primary:hover:not(:disabled) {
    opacity: 0.88;
  }

  .sio-error,
  .sio-loading {
    border: 1px solid rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.07);
    color: #b91c1c;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
  }

  .sio-loading {
    border-color: var(--sp-toggle-border, #e5e7eb);
    background: var(--sp-toggle-bg, #f9fafb);
    color: var(--sp-muted, #6b7280);
  }
</style>
