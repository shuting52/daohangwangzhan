<script lang="ts">
  import { tick } from 'svelte'
  import { cloneSettingsForm, type SettingsFormModel } from '../../lib/settingsForm'

  export let form: SettingsFormModel
  export let saving = false

  async function syncForm(): Promise<void> {
    await tick()
    form = cloneSettingsForm(form)
  }

  interface ScriptTemplate {
    id: string
    name: string
    desc: string
    kind: 'css' | 'js'
    content: string
  }

  // 内置样式/脚本模板：点击「应用」会替换对应 textarea 内容
  const SCRIPT_TEMPLATES: ScriptTemplate[] = [
    {
      id: 'css-glassmorphism',
      name: '毛玻璃卡片',
      desc: '半透明磨砂卡片 + 柔和阴影，适合深色背景',
      kind: 'css',
      content: `/* ===== 毛玻璃卡片模板 ===== */
.home-card {
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  border-radius: 18px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease !important;
}
.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28) !important;
}`,
    },
    {
      id: 'css-gradient-title',
      name: '渐变标题',
      desc: '站点标题流光渐变效果',
      kind: 'css',
      content: `/* ===== 渐变标题模板 ===== */
.home-hero .site-title,
.home-shell .site-title {
  background: linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa, #f472b6);
  background-size: 300% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hero-title-flow 6s linear infinite;
}
@keyframes hero-title-flow {
  0% { background-position: 0% center; }
  100% { background-position: 300% center; }
}`,
    },
    {
      id: 'css-dark-neon',
      name: '霓虹描边',
      desc: '卡片霓虹光效，适合深色主题',
      kind: 'css',
      content: `/* ===== 霓虹描边模板 ===== */
.home-card {
  border: 1px solid rgba(34, 211, 238, 0.55) !important;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.35), inset 0 0 6px rgba(34, 211, 238, 0.12) !important;
}
.home-card:hover {
  border-color: #f0abfc !important;
  box-shadow: 0 0 22px rgba(240, 171, 252, 0.6) !important;
}`,
    },
    {
      id: 'js-clock',
      name: '页脚时钟',
      desc: '在页脚显示实时时钟（需在页脚 HTML 放置 #footer-clock）',
      kind: 'js',
      content: `// ===== 页脚时钟模板 =====
// 在「页脚 HTML」中加入：<div id="footer-clock"></div>
(function () {
  var el = document.getElementById('footer-clock');
  if (!el) return;
  function update() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    el.textContent = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
      ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  }
  update();
  setInterval(update, 1000);
})();`,
    },
    {
      id: 'js-scroll-top',
      name: '回到顶部按钮',
      desc: '右下角悬浮返回顶部按钮',
      kind: 'js',
      content: `// ===== 回到顶部按钮模板 =====
(function () {
  var btn = document.createElement('button');
  btn.textContent = '↑';
  btn.setAttribute('aria-label', '回到顶部');
  btn.style.cssText =
    'position:fixed;right:20px;bottom:20px;z-index:999;width:42px;height:42px;' +
    'border-radius:50%;border:none;background:rgba(37,99,235,0.85);color:#fff;' +
    'font-size:20px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.25);display:none;';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function () {
    btn.style.display = window.scrollY > 320 ? 'block' : 'none';
  });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();`,
    },
    {
      id: 'js-confetti',
      name: '点击彩带',
      desc: '点击页面任意位置绽放彩带效果',
      kind: 'js',
      content: `// ===== 点击彩带模板 =====
(function () {
  var colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
  document.addEventListener('click', function (event) {
    for (var i = 0; i < 10; i++) {
      var dot = document.createElement('span');
      dot.style.cssText =
        'position:fixed;left:' + event.clientX + 'px;top:' + event.clientY + 'px;' +
        'width:10px;height:10px;border-radius:2px;pointer-events:none;z-index:9999;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'transform:rotate(' + Math.random() * 360 + 'deg);';
      document.body.appendChild(dot);
      var angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      var dist = 40 + Math.random() * 60;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      dot.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(180deg)', opacity: 0 }
        ],
        { duration: 600 + Math.random() * 300, easing: 'ease-out' }
      ).onfinish = function () { dot.remove(); };
    }
  });
})();`,
    },
  ]

  let appliedTemplate = ''

  function applyTemplate(template: ScriptTemplate): void {
    if (template.kind === 'css') {
      form.custom_css = template.content
    } else {
      form.custom_js = template.content
    }
    appliedTemplate = template.name
    void syncForm()
  }
</script>

<fieldset id="settings-section-footer" class="group group-wide" disabled={saving} on:input={() => void syncForm()}>
  <legend>自定义样式与脚本</legend>
  <p class="group-desc">管理首页页脚内容以及自定义 CSS、JavaScript。预览会隔离展示页脚和 CSS，不会执行 JavaScript。</p>

  <div class="settings-subsection">
    <h3>内置模板</h3>
    <p class="template-tip">点击「应用」会将模板内容直接替换到下方对应的文本框（可继续修改）。</p>
    <div class="template-grid">
      {#each SCRIPT_TEMPLATES as template}
        <button
          type="button"
          class="template-card"
          on:click={() => applyTemplate(template)}
          title={template.desc}
        >
          <span class="template-kind">{template.kind === 'css' ? 'CSS' : 'JS'}</span>
          <span class="template-name">{template.name}</span>
          <span class="template-desc">{template.desc}</span>
        </button>
      {/each}
    </div>
    {#if appliedTemplate}
      <small class="template-applied">已应用模板：{appliedTemplate}，内容已填入下方文本框。</small>
    {/if}
  </div>

  <label class="field full-width">
    <span>页脚 HTML</span>
    <textarea
      bind:value={form.footer_html}
      rows="4"
      placeholder='<div style="text-align:center;color:#cbd5e1">Powered by CF-Navs</div>'
    ></textarea>
    <small>支持自定义 HTML（如备案号、版权信息、友情链接）。请仅填写可信内容，页面安全策略会阻止脚本和内联事件执行。</small>
  </label>

  <label class="field full-width">
    <span>自定义 CSS</span>
    <textarea
      bind:value={form.custom_css}
      rows="7"
      placeholder={'例如：.home-footer { opacity: 0.8; }'}
    ></textarea>
    <small>保存后注入前台首页；右侧预览在隔离区域内展示，不会影响管理界面。</small>
  </label>

  <label class="field full-width">
    <span>自定义 JavaScript</span>
    <textarea
      bind:value={form.custom_js}
      rows="7"
      placeholder="例如：console.log('Hello CF-Navs!');"
    ></textarea>
    <small class="warn">为保护管理会话，JavaScript 不会在预览中执行。请仅保存你完全信任的脚本。</small>
  </label>
</fieldset>

<style>
  .field.full-width {
    grid-column: 1 / -1;
  }

  .settings-subsection {
    display: grid;
    gap: 8px;
  }

  .settings-subsection h3 {
    margin: 0;
    color: var(--sp-strong);
    font-size: 14px;
  }

  .template-tip,
  .template-applied {
    color: var(--sp-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .template-card {
    display: grid;
    gap: 3px;
    text-align: left;
    border: 1px solid var(--sp-input-border);
    border-radius: 12px;
    padding: 10px 12px;
    background: var(--sp-input-bg);
    color: var(--sp-text);
    font: inherit;
    cursor: pointer;
    transition: border-color var(--transition-base), background var(--transition-base), transform var(--transition-base);
  }

  .template-card:hover {
    border-color: var(--sp-accent);
    background: var(--sp-toggle-hover-bg);
    transform: translateY(-1px);
  }

  .template-kind {
    justify-self: start;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--sp-accent);
    border: 1px solid color-mix(in srgb, var(--sp-accent) 45%, transparent);
    border-radius: 999px;
    padding: 1px 8px;
  }

  .template-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--sp-strong);
  }

  .template-desc {
    font-size: 12px;
    color: var(--sp-muted);
    line-height: 1.4;
  }
</style>
