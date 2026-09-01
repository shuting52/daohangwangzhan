<script lang="ts">
  import { onMount } from 'svelte'
  import { uploadsApi } from '../../lib/api'
  import type { UploadFile, UploadListResp } from '../../../shared/types'

  export let isAuthenticated = false

  const PAGE_SIZE = 24
  let items: UploadFile[] = []
  let total = 0
  let page = 1
  let loading = false
  let uploading = false
  let uploadError = ''
  let deletingId: number | null = null
  let preview: UploadFile | null = null
  let fileInput: HTMLInputElement | null = null
  let dragActive = false

  const acceptedTypes = '.md,.markdown,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.mp4,.webm,.ogv,.mov,.avi,.mkv'

  $: totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function loadFiles() {
    if (!isAuthenticated) return
    loading = true
    uploadError = ''
    try {
      const resp: UploadListResp = await uploadsApi.list(page)
      items = resp.items
      total = resp.total
    } catch (e) {
      uploadError = e instanceof Error ? e.message : '加载失败'
    } finally {
      loading = false
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) return
    uploading = true
    uploadError = ''
    for (const file of list) {
      try {
        await uploadsApi.upload(file)
      } catch (e) {
        uploadError = `${file.name}: ${e instanceof Error ? e.message : '上传失败'}`
      }
    }
    uploading = false
    if (fileInput) fileInput.value = ''
    await loadFiles()
  }

  function onPickFile() {
    fileInput?.click()
  }

  async function removeFile(file: UploadFile) {
    if (!window.confirm(`确认删除「${file.filename}」？删除后不可恢复。`)) return
    deletingId = file.id
    uploadError = ''
    try {
      await uploadsApi.remove(file.id)
      if (preview?.id === file.id) preview = null
      await loadFiles()
    } catch (e) {
      uploadError = e instanceof Error ? e.message : '删除失败'
    } finally {
      deletingId = null
    }
  }

  function copyLink(file: UploadFile) {
    const url = new URL(uploadsApi.contentUrl(file.id), window.location.origin).toString()
    navigator.clipboard?.writeText(url).then(
      () => { uploadError = '' },
      () => { uploadError = '复制失败' },
    )
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  function formatTime(ts: number): string {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function kindLabel(kind: string): string {
    if (kind === 'image') return '图片'
    if (kind === 'video') return '视频'
    if (kind === 'md') return 'Markdown'
    return '文件'
  }

  function isImage(file: UploadFile): boolean {
    return file.kind === 'image'
  }

  function isVideo(file: UploadFile): boolean {
    return file.kind === 'video'
  }

  function openPreview(file: UploadFile) {
    preview = file
  }

  function closePreview() {
    preview = null
  }

  function goPage(p: number) {
    if (p < 1 || p > totalPages || p === page) return
    page = p
    void loadFiles()
  }

  onMount(() => {
    void loadFiles()
  })
</script>

<div class="upload-panel">
  <div
    class="drop-zone"
    class:active={dragActive}
    role="button"
    tabindex="0"
    on:click={onPickFile}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPickFile() }}
    on:dragover={(e) => { e.preventDefault(); dragActive = true }}
    on:dragleave={() => { dragActive = false }}
    on:drop={(e) => { e.preventDefault(); dragActive = false; void handleFiles(e.dataTransfer?.files ?? []) }}
  >
    <input
      bind:this={fileInput}
      type="file"
      accept={acceptedTypes}
      multiple
      hidden
      on:change={(e) => void handleFiles(e.currentTarget.files ?? [])}
    />
    <div class="drop-icon">⬆️</div>
    <div class="drop-title">{uploading ? '正在上传…' : '点击或拖拽文件到此处上传'}</div>
    <div class="drop-hint">支持 Markdown（.md）、图片（jpg/png/gif/webp/svg）与视频（mp4/webm/mov），未配置 R2 时单文件上限 8MB</div>
  </div>

  {#if uploadError}
    <div class="upload-error">{uploadError}</div>
  {/if}

  <div class="list-header">
    <span class="list-title">文件列表</span>
    <span class="list-count">共 {total} 个文件</span>
  </div>

  {#if loading}
    <div class="empty-tip">加载中…</div>
  {:else if items.length === 0}
    <div class="empty-tip">还没有上传任何文件</div>
  {:else}
    <div class="file-grid">
      {#each items as file (file.id)}
        <div class="file-card">
          {#if isImage(file)}
            <img
              class="file-thumb"
              src={uploadsApi.contentUrl(file.id)}
              alt={file.filename}
              loading="lazy"
              on:click={() => openPreview(file)}
            />
          {:else if isVideo(file)}
            <div class="file-thumb video-thumb" on:click={() => openPreview(file)}>🎬</div>
          {:else}
            <div class="file-thumb md-thumb" on:click={() => openPreview(file)}>📄</div>
          {/if}
          <div class="file-meta">
            <div class="file-name" title={file.filename}>{file.filename}</div>
            <div class="file-sub">
              <span class="kind-badge">{kindLabel(file.kind)}</span>
              <span>{formatSize(file.size)}</span>
              <span>{formatTime(file.created_at)}</span>
            </div>
          </div>
          <div class="file-actions">
            <button type="button" class="action-btn" title="预览" on:click={() => openPreview(file)}>👁</button>
            <button type="button" class="action-btn" title="复制链接" on:click={() => copyLink(file)}>🔗</button>
            <button
              type="button"
              class="action-btn danger"
              title="删除"
              disabled={deletingId === file.id}
              on:click={() => void removeFile(file)}
            >🗑</button>
          </div>
        </div>
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="pagination">
        <button type="button" disabled={page <= 1} on:click={() => goPage(page - 1)}>上一页</button>
        <span class="page-info">{page} / {totalPages}</span>
        <button type="button" disabled={page >= totalPages} on:click={() => goPage(page + 1)}>下一页</button>
      </div>
    {/if}
  {/if}
</div>

{#if preview}
  <div class="preview-overlay" on:click={closePreview}>
    <div class="preview-dialog" on:click|stopPropagation>
      <div class="preview-header">
        <span class="preview-name">{preview.filename}</span>
        <button type="button" class="action-btn" on:click={closePreview}>✕</button>
      </div>
      <div class="preview-body">
        {#if isImage(preview)}
          <img src={uploadsApi.contentUrl(preview.id)} alt={preview.filename} />
        {:else if isVideo(preview)}
          <video src={uploadsApi.contentUrl(preview.id)} controls autoplay muted />
        {:else}
          <iframe src={uploadsApi.contentUrl(preview.id)} title={preview.filename} />
        {/if}
      </div>
      <div class="preview-footer">
        <span>{formatSize(preview.size)} · {formatTime(preview.created_at)}</span>
        <a
          class="download-link"
          href={uploadsApi.contentUrl(preview.id)}
          download={preview.filename}
          target="_blank"
          rel="noreferrer"
        >下载</a>
      </div>
    </div>
  </div>
{/if}

<style>
  .upload-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .drop-zone {
    border: 2px dashed var(--admin-border, #d1d5db);
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    background: var(--admin-nav-bg, rgba(255,255,255,0.6));
    transition: border-color var(--transition-base), background var(--transition-base);
  }

  .drop-zone.active {
    border-color: var(--admin-accent, #2563eb);
    background: color-mix(in srgb, var(--admin-accent, #2563eb) 8%, transparent);
  }

  .drop-icon {
    font-size: 32px;
    line-height: 1;
  }

  .drop-title {
    margin-top: 8px;
    font-weight: 600;
    font-size: 15px;
    color: var(--admin-text, #1f2937);
  }

  .drop-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--admin-muted, #6b7280);
  }

  .upload-error {
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #dc2626;
    font-size: 13px;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }

  .list-title {
    font-weight: 700;
    font-size: 15px;
    color: var(--admin-text, #1f2937);
  }

  .list-count {
    font-size: 12px;
    color: var(--admin-muted, #6b7280);
  }

  .empty-tip {
    padding: 32px;
    text-align: center;
    color: var(--admin-muted, #6b7280);
    font-size: 14px;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 12px;
  }

  .file-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--admin-border, #e5e7eb);
    border-radius: 14px;
    overflow: hidden;
    background: var(--admin-nav-bg, rgba(255,255,255,0.7));
  }

  .file-thumb {
    width: 100%;
    height: 110px;
    object-fit: cover;
    background: linear-gradient(135deg, #eef2ff, #f0f9ff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    cursor: pointer;
    border-bottom: 1px solid var(--admin-border, #e5e7eb);
  }

  .file-meta {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .file-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--admin-text, #1f2937);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--admin-muted, #6b7280);
    flex-wrap: wrap;
  }

  .kind-badge {
    padding: 1px 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--admin-accent, #2563eb) 14%, transparent);
    color: var(--admin-accent-strong, #1d4ed8);
  }

  .file-actions {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    border-top: 1px solid var(--admin-border, #e5e7eb);
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    border: 1px solid var(--admin-border, #e5e7eb);
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: var(--admin-text, #374151);
    transition: background var(--transition-fast);
  }

  .action-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--admin-accent, #2563eb) 10%, transparent);
  }

  .action-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 8px 0;
  }

  .pagination button {
    padding: 6px 14px;
    border: 1px solid var(--admin-border, #e5e7eb);
    border-radius: 8px;
    background: var(--admin-nav-bg, rgba(255,255,255,0.7));
    cursor: pointer;
    font-size: 13px;
    color: var(--admin-text, #1f2937);
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 13px;
    color: var(--admin-muted, #6b7280);
  }

  .preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .preview-dialog {
    width: min(860px, 92vw);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .preview-name {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-body img,
  .preview-body video {
    max-width: 100%;
    max-height: 70vh;
  }

  .preview-body iframe {
    width: 100%;
    height: 70vh;
    border: none;
    background: #fff;
  }

  .preview-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 12px;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
  }

  .download-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }
</style>
