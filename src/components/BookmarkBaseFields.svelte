<script lang="ts">
  import { getErrorMessage, uploadsApi } from '../lib/api'
  import type { BookmarkFormValue } from '../lib/adminTypes'
  import type { CategoryTreeOption } from '../lib/categorySelect'
  import CategoryTreeSelect from './CategoryTreeSelect.svelte'

  export let categoryId: string | number | undefined = undefined
  export let title = ''
  export let url = ''
  export let openMethod: BookmarkFormValue['open_method'] = 'new_tab'
  export let isPrivate = false
  export let description = ''
  export let descriptionMode: BookmarkFormValue['description_mode'] = 'inherit'
  export let categories: CategoryTreeOption[] = []
  export let loading = false
  export let titleLoading = false
  export let onUrlBlur: (() => void) | undefined = undefined
  export let onLocalFileUploaded:
    | ((file: { url: string; title: string; isImage: boolean }) => void | Promise<void>)
    | undefined = undefined

  let fileInput: HTMLInputElement | null = null
  let uploadingFile = false
  let uploadError = ''

  function openFilePicker(): void {
    uploadError = ''
    fileInput?.click()
  }

  async function handleFileSelected(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    uploadingFile = true
    uploadError = ''
    try {
      const uploaded = await uploadsApi.upload(file)
      const isImage = file.type.startsWith('image/')
      const baseName = file.name.replace(/\.[^.]+$/, '')
      await onLocalFileUploaded?.({ url: uploadsApi.contentUrl(uploaded.id), title: baseName || file.name, isImage })
    } catch (error) {
      uploadError = getErrorMessage(error) || '文件上传失败，请重试'
    } finally {
      uploadingFile = false
    }
  }
</script>

<div class="field-compact field-label">
  <span>所属分类</span>
  <CategoryTreeSelect
    bind:value={categoryId}
    items={categories}
    disabled={loading || categories.length === 0}
    ariaLabel="选择所属分类"
    compact
    testId="bookmark-category-tree-select"
  />
</div>

<label class="field-compact">
  <span>
    书签标题
    {#if titleLoading}<small class="field-hint">解析中…</small>{/if}
  </span>
  <input bind:value={title} type="text" placeholder="例如：Svelte 官方网站" required />
</label>

<label class="field-compact">
  <span>链接地址</span>
  <div class="url-row">
    <input
      bind:value={url}
      type="url"
      placeholder="https://example.com"
      required
      on:blur={() => onUrlBlur?.()}
    />
    <button
      type="button"
      class="local-file-button"
      on:click={openFilePicker}
      disabled={loading || uploadingFile}
      title="上传本地文件作为书签（支持任意文件，包括 APK）"
    >
      {uploadingFile ? '上传中…' : '上传本地文件'}
    </button>
  </div>
  {#if uploadError}
    <small class="field-error">{uploadError}</small>
  {/if}
  <small>支持任意文件（图片/APK/文档等），上传后可下载或打开；图片会自动用作书签图标。</small>
  <input
    bind:this={fileInput}
    type="file"
    accept="*"
    style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;"
    tabindex="-1"
    aria-hidden="true"
    on:change={handleFileSelected}
  />
</label>

<label class="field-compact">
  <span>打开方式</span>
  <select class="native-select" bind:value={openMethod}>
    <option value="new_tab">新标签页</option>
    <option value="same_tab">当前标签页</option>
    <option value="modal">当前页弹层</option>
  </select>
</label>

<label class="field-compact privacy-field">
  <span>访问权限</span>
  <span class="checkbox-row">
    <input bind:checked={isPrivate} type="checkbox" disabled={loading} />
    <span>设为私密链接（仅登录可见）</span>
  </span>
  <small>开启后，未登录访客不会看到这个书签；管理员登录后仍可正常访问。</small>
</label>

<label class="field-compact">
  <span>描述</span>
  <textarea bind:value={description} rows="3" placeholder="补充说明，可选"></textarea>
</label>

<label class="field-compact">
  <span>描述显示</span>
  <select class="native-select" bind:value={descriptionMode}>
    <option value="inherit">跟随全局</option>
    <option value="always">始终显示</option>
    <option value="hover">悬停显示</option>
    <option value="hidden">隐藏</option>
  </select>
</label>

<style>
  label {
    display: grid;
    min-width: 0;
    gap: 4px;
    color: #334155;
    font-size: 13px;
  }

  .field-label {
    display: grid;
    min-width: 0;
    gap: 4px;
    color: #334155;
    font-size: 13px;
  }

  .field-compact {
    grid-column: span 1;
  }

  .field-hint {
    margin-left: 6px;
    color: #64748b;
    font-size: 11px;
    font-weight: 400;
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    color: #334155;
    font-size: 13px;
  }

  .checkbox-row input {
    width: 16px;
    height: 16px;
    accent-color: #2563eb;
  }

  .privacy-field small {
    color: #64748b;
    font-size: 11px;
    line-height: 1.45;
  }

  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: var(--radius-lg);
    padding: var(--control-padding-input-sm);
    font-size: var(--font-size-base);
    color: #0f172a;
    background: #ffffff;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
    min-height: 48px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  select:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  select {
    --select-hover-border: #94a3b8;
  }

  .url-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    gap: 6px;
    align-items: center;
  }

  .url-row input {
    min-width: 0;
    width: 100%;
  }

  .local-file-button {
    flex: 0 0 auto;
    white-space: nowrap;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    color: #0f172a;
    cursor: pointer;
    font-size: 13px;
    padding: 7px 12px;
    transition: var(--transition-base);
  }

  .local-file-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .local-file-button:hover:not(:disabled) {
    border-color: #2563eb;
    color: #2563eb;
  }

  .field-error {
    margin: 0;
    color: #dc2626;
    font-size: 12px;
    line-height: 1.35;
  }

  @media (max-width: 500px) {
    .field-compact {
      grid-column: 1 / -1;
    }

    .url-row {
      grid-template-columns: 1fr;
    }
  }
</style>
