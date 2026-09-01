<script lang="ts">
  import { getErrorMessage, uploadsApi } from '../lib/api'
  import type { BookmarkFormValue } from '../lib/adminTypes'
  import {
    canPreviewIcon,
    canPreviewIconAsImage,
    getFormIconPreviewUrl,
    getTextIconPreview,
  } from '../lib/bookmarkFormIcons'

  type AsyncVoid<T = void> = T | Promise<T>

  export let form: BookmarkFormValue
  export let iconifyName = ''
  export let imageHostUrl = ''
  export let loading = false
  export let faviconError = ''
  export let onIconInput: ((value: string) => AsyncVoid) | undefined = undefined
  export let onOpenImageHost: (() => AsyncVoid) | undefined = undefined

  let fileInput: HTMLInputElement | null = null
  let uploading = false
  let uploadError = ''

  function handleIconInput(event: Event) {
    const nextIcon = (event.currentTarget as HTMLInputElement).value
    uploadError = ''
    void onIconInput?.(nextIcon)
  }

  function handleOpenImageHost() {
    void onOpenImageHost?.()
  }

  function openLocalUpload() {
    uploadError = ''
    fileInput?.click()
  }

  async function handleFileSelected(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      uploadError = '仅支持上传图片文件（png/jpg/webp/gif/svg 等）'
      return
    }
    uploading = true
    uploadError = ''
    try {
      const uploaded = await uploadsApi.upload(file)
      await onIconInput?.(uploadsApi.contentUrl(uploaded.id))
    } catch (error) {
      uploadError = getErrorMessage(error) || '图标上传失败，请重试'
    } finally {
      uploading = false
    }
  }
</script>

<label class="field-wide">
  <span>自定义图标 / 手动输入</span>
  <div class="icon-row">
    <input
      value={form.icon}
      type="text"
      placeholder="图标 URL / 表情，如 ⭐"
      on:input={handleIconInput}
    />
    {#if form.icon && canPreviewIcon(form.icon)}
      <span class="icon-preview" title="图标预览">
        {#if canPreviewIconAsImage(form.icon)}
          <img src={getFormIconPreviewUrl(form, iconifyName)} alt="图标预览" />
        {:else}
          <span class="icon-preview-text">{getTextIconPreview(form.icon)}</span>
        {/if}
      </span>
    {/if}
    <span class="upload-actions">
      <button
        type="button"
        class="ghost-button upload-button"
        on:click={openLocalUpload}
        disabled={loading || uploading}
        title="上传本地图片作为图标"
      >
        {uploading ? '上传中…' : '本地上传'}
      </button>
      {#if imageHostUrl}
        <button
          type="button"
          class="ghost-button upload-button"
          on:click={handleOpenImageHost}
          disabled={loading || uploading}
          title="打开图床上传图标"
        >
          打开图床 ↗
        </button>
      {/if}
    </span>
  </div>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;"
    tabindex="-1"
    aria-hidden="true"
    on:change={handleFileSelected}
  />
  {#if faviconError}
    <small class="field-error">{faviconError}</small>
  {/if}
  {#if uploadError}
    <small class="field-error">{uploadError}</small>
  {/if}
</label>

<style>
  .field-wide {
    grid-column: 1 / -1;
    display: grid;
    min-width: 0;
    gap: 4px;
    color: #334155;
    font-size: 13px;
  }

  .icon-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content max-content;
    gap: 6px;
    align-items: center;
  }

  .upload-actions {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    padding: 6px 9px;
    font-size: 13px;
    color: #0f172a;
    background: #ffffff;
    font-family: inherit;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  .ghost-button {
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    color: #0f172a;
    cursor: pointer;
    font-size: 13px;
    padding: 7px 12px;
    transition: var(--transition-base);
  }

  .ghost-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .upload-button {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .icon-preview {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    background: #f8fafc;
    box-sizing: border-box;
  }

  .icon-preview img {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: cover;
  }

  .icon-preview-text {
    max-width: 100%;
    color: #475569;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field-error {
    margin: 0;
    color: #dc2626;
    font-size: 12px;
    line-height: 1.35;
  }

  @media (max-width: 500px) {
    .field-wide {
      grid-column: 1 / -1;
    }

    .icon-row {
      align-items: stretch;
      grid-template-columns: minmax(0, 1fr) 32px;
    }

    .icon-row .upload-actions {
      grid-column: 1 / -1;
    }
  }
</style>
