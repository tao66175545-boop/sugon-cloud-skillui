#!/usr/bin/env node
/**
 * Single-source kit compiler.
 * Reads tokens/sugon.tokens.json and regenerates:
 *   - skills/sugon-brand-kit/tokens.css
 *   - skills/sugon-brand-kit/DESIGN.md  (Google DESIGN.md alpha frontmatter + preserved prose)
 *   - registry/generated/theme.cssVars.json  (cssVars fragments for registry:theme)
 *   - src/playground/tokens.generated.json   (embedded for Playground)
 *   - src/styles/sugon-tokens.css            (mirror for the app)
 *
 * components.css is NOT regenerated (hand-authored snippets); only checked by check-tokens.
 *
 * Usage: node scripts/build-kit.mjs [--check]
 *   --check  exit 1 if any generated file would change (CI drift guard)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

const tokensPath = path.join(root, 'tokens/sugon.tokens.json')
const skillDir = path.join(root, 'skills/sugon-brand-kit')
const designProsePath = path.join(root, 'tokens/DESIGN.prose.md')

function loadTokens() {
  const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf8'))
  /** @type {{name:string,value:string,group:string,key:string}[]} */
  const flat = []
  for (const [group, entries] of Object.entries(raw)) {
    if (group.startsWith('$') || group === 'meta') continue
    if (!entries || typeof entries !== 'object') continue
    for (const [key, entry] of Object.entries(entries)) {
      if (!entry || typeof entry !== 'object' || !entry.$css || entry.$value == null) continue
      flat.push({ name: entry.$css, value: String(entry.$value), group, key })
    }
  }
  return { raw, flat, meta: raw.meta || {} }
}

function renderTokensCss({ flat, meta }) {
  const lines = []
  lines.push('/**')
  lines.push(' * 曙光 · SkillUI · 品牌设计令牌')
  lines.push(' * 由 tokens/sugon.tokens.json 经 `npm run build:kit` 生成 — 勿手改。')
  lines.push(' * 在你的入口 CSS 顶部 @import 本文件即可使用（本仓库：src/index.css）。')
  lines.push(' *')
  lines.push(' * 品牌色板：曙光红 + 中性灰 + 白底')
  lines.push(` * Primary: ${meta.primary || '#C8161D'}`)
  lines.push(' */')
  lines.push('')
  lines.push(':root {')

  // Preserve original CSS declaration order from flat array (JSON group order may differ).
  // We'll emit by walking flat in file order — but JSON object order is insertion order.
  // Re-read order: emit flat in the order they appear when walking groups as in tokens file.
  const emitted = new Set()
  const emit = (items, comment) => {
    if (!items.length) return
    lines.push('')
    lines.push(`  /* ${comment} */`)
    for (const e of items) {
      if (emitted.has(e.name)) continue
      emitted.add(e.name)
      // Keep multi-line shadows / font stacks readable for long values
      if (e.name === '--font-sans') {
        lines.push(`  ${e.name}: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Inter",`)
        lines.push(`    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",`)
        lines.push(`    Arial, sans-serif;`)
      } else if (e.name === '--shadow-md') {
        lines.push(`  ${e.name}: 0 4px 6px -1px rgb(23 23 23 / 0.08),`)
        lines.push(`    0 2px 4px -2px rgb(23 23 23 / 0.06);`)
      } else if (e.name === '--shadow-lg') {
        lines.push(`  ${e.name}: 0 10px 15px -3px rgb(23 23 23 / 0.08),`)
        lines.push(`    0 4px 6px -4px rgb(23 23 23 / 0.05);`)
      } else if (e.name === '--shadow-xl') {
        lines.push(`  ${e.name}: 0 20px 25px -5px rgb(23 23 23 / 0.1),`)
        lines.push(`    0 8px 10px -6px rgb(23 23 23 / 0.06);`)
      } else if (e.name === '--btn-transition') {
        lines.push(`  ${e.name}: background-color 150ms ease, box-shadow 150ms ease,`)
        lines.push(`    transform 100ms ease, border-color 150ms ease;`)
      } else {
        lines.push(`  ${e.name}: ${e.value};`)
      }
    }
  }

  // Emit in a stable order matching the historical tokens.css grouping
  const byName = new Map(flat.map((e) => [e.name, e]))
  const order = [
    ['品牌主色 — 曙光红', ['--color-primary','--color-primary-hover','--color-primary-active','--color-primary-foreground','--color-primary-muted']],
    ['辅色 — 与主色一致（DESIGN）', ['--color-accent','--color-accent-hover','--color-accent-muted']],
    ['中性色 — 真灰阶梯（白 → subtle → muted → border），少脏灰', ['--color-bg','--color-bg-subtle','--color-bg-muted','--color-surface','--color-border','--color-border-strong','--color-text','--color-text-secondary','--color-text-muted','--color-text-inverse']],
    ['语义色', ['--color-success','--color-warning','--color-danger','--color-danger-muted','--color-danger-border','--color-danger-foreground']],
    ['焦点环（壳与表单共用）', ['--focus-ring','--focus-ring-strong']],
    ['顶栏毛玻璃', ['--topbar-bg','--topbar-bg-fallback','--topbar-blur','--topbar-border']],
    ['字体', ['--font-sans','--font-mono','--text-xs','--text-sm','--text-base','--text-lg','--text-xl','--text-2xl','--text-3xl','--text-4xl','--text-5xl','--text-6xl','--leading-tight','--leading-snug','--leading-normal','--leading-relaxed','--tracking-tight','--tracking-normal','--font-weight-normal','--font-weight-medium','--font-weight-semibold','--font-weight-bold']],
    ['圆角', ['--radius-sm','--radius-md','--radius-lg','--radius-xl','--radius-2xl','--radius-full']],
    ['间距（4px 基准）', ['--space-1','--space-2','--space-3','--space-4','--space-5','--space-6','--space-8','--space-10','--space-12','--space-16','--space-20','--space-24']],
    ['阴影', ['--shadow-sm','--shadow-md','--shadow-lg','--shadow-xl']],
    ['按钮', ['--btn-height','--btn-px','--btn-radius','--btn-font-size','--btn-font-weight','--btn-transition']],
    ['布局', ['--container-max','--container-pad-inline','--section-py','--agent-max']],
  ]

  for (const [comment, names] of order) {
    emit(names.map((n) => byName.get(n)).filter(Boolean), comment)
  }
  // any leftover
  const leftovers = flat.filter((e) => !emitted.has(e.name))
  if (leftovers.length) emit(leftovers, '其他')

  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

function yamlQuote(s) {
  if (s == null) return '""'
  const str = String(s)
  if (/^#[0-9A-Fa-f]{3,8}$/.test(str) || /[:#{}[\],&*?|<>=!%@`]/.test(str) || str.includes('"') || str.includes("'") || /\s/.test(str)) {
    return JSON.stringify(str)
  }
  return str
}

function renderDesignFrontmatter({ raw, meta }) {
  const colors = raw.color || {}
  const radius = raw.radius || {}
  const space = raw.space || {}
  const text = raw.text || {}
  const fontWeight = raw.fontWeight || {}
  const leading = raw.leading || {}

  const colorLines = Object.entries(colors)
    .filter(([, e]) => e.$type === 'color')
    .map(([k, e]) => `  ${k}: ${yamlQuote(e.$value)}`)

  const lines = []
  lines.push('---')
  lines.push('version: alpha')
  lines.push(`name: ${yamlQuote(meta.name || 'sugon-brand-kit')}`)
  lines.push(`description: ${yamlQuote('曙光云 (Sugon Cloud) brand visual identity — brand red #C8161D with gray/white neutrals.')}`)
  lines.push('colors:')
  lines.push(...colorLines)
  lines.push('typography:')
  lines.push('  display:')
  lines.push(`    fontFamily: ${yamlQuote('Noto Sans SC')}`)
  lines.push(`    fontSize: ${yamlQuote((text['3xl'] || {}).$value || '1.875rem')}`)
  lines.push(`    fontWeight: ${yamlQuote((fontWeight.bold || {}).$value || '700')}`)
  lines.push(`    lineHeight: ${yamlQuote((leading.tight || {}).$value || '1.25')}`)
  lines.push('  body:')
  lines.push(`    fontFamily: ${yamlQuote('Noto Sans SC')}`)
  lines.push(`    fontSize: ${yamlQuote((text.base || {}).$value || '1rem')}`)
  lines.push(`    fontWeight: ${yamlQuote((fontWeight.normal || {}).$value || '400')}`)
  lines.push(`    lineHeight: ${yamlQuote((leading.relaxed || {}).$value || '1.625')}`)
  lines.push('  label:')
  lines.push(`    fontFamily: ${yamlQuote('Noto Sans SC')}`)
  lines.push(`    fontSize: ${yamlQuote((text.sm || {}).$value || '0.875rem')}`)
  lines.push(`    fontWeight: ${yamlQuote((fontWeight.semibold || {}).$value || '600')}`)
  lines.push('rounded:')
  for (const [k, e] of Object.entries(radius)) {
    lines.push(`  ${k}: ${yamlQuote(e.$value)}`)
  }
  lines.push('spacing:')
  for (const [k, e] of Object.entries(space)) {
    // YAML keys that are numeric need quoting
    const key = /^\d/.test(k) ? `"${k}"` : k
    lines.push(`  ${key}: ${yamlQuote(e.$value)}`)
  }
  lines.push('components:')
  lines.push('  button-primary:')
  lines.push('    backgroundColor: "{colors.primary}"')
  lines.push('    textColor: "{colors.primary-foreground}"')
  lines.push('    rounded: "{rounded.lg}"')
  lines.push('  card:')
  lines.push('    backgroundColor: "{colors.surface}"')
  lines.push('    rounded: "{rounded.xl}"')
  lines.push('---')
  lines.push('')
  return lines.join('\n')
}

function ensureProse() {
  if (fs.existsSync(designProsePath)) return fs.readFileSync(designProsePath, 'utf8')
  // Bootstrap prose from current DESIGN.md (strip any frontmatter)
  const existing = fs.readFileSync(path.join(skillDir, 'DESIGN.md'), 'utf8')
  let body = existing
  if (body.startsWith('---\n')) {
    const end = body.indexOf('\n---\n', 4)
    if (end !== -1) body = body.slice(end + 5)
  }
  // Update the "single source of truth" sentence for the new pipeline
  body = body.replace(
    /本规范是风格供给层的视觉语言。[\s\S]*?两者不一致时以 `tokens\.css` 为准（源仓库 `npm run check:tokens` 会校验本文颜色表与 `tokens\.css` 一致）。/,
    '本规范是风格供给层的视觉语言。**唯一事实来源是仓库根目录 `tokens/sugon.tokens.json`**：本文 YAML frontmatter、颜色表与同目录 `tokens.css` 都由 `npm run build:kit` 生成；手改会被下次生成覆盖。源仓库 `npm run check:tokens` 会校验生成物无漂移。',
  )
  fs.mkdirSync(path.dirname(designProsePath), { recursive: true })
  fs.writeFileSync(designProsePath, body)
  return body
}

function resolveRef(raw, value, where) {
  const m = /^\{([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\}$/.exec(String(value))
  if (!m) return String(value)
  const entry = raw[m[1]]?.[m[2]]
  if (!entry || entry.$value == null) throw new Error(`build-kit: unresolved reference ${value} in ${where}`)
  return String(entry.$value)
}

/**
 * shadcn registry:theme cssVars, using shadcn's standard token names
 * (background, foreground, card, primary, accent, ring, radius …).
 * Our own --color-* tokens are not emitted here.
 */
function renderCssVars({ raw }) {
  const map = raw.shadcn
  if (!map || !map.light) throw new Error('build-kit: tokens/sugon.tokens.json is missing shadcn.light')
  const light = {}
  for (const [k, v] of Object.entries(map.light)) light[k] = resolveRef(raw, v, `shadcn.light.${k}`)
  const theme = {}
  for (const [k, v] of Object.entries(map.theme || {})) theme[k] = resolveRef(raw, v, `shadcn.theme.${k}`)
  // Guards: accent is the hover surface and must not be the brand red; no self-referencing vars.
  if (light.accent && light.primary && light.accent.toLowerCase() === light.primary.toLowerCase()) {
    throw new Error('build-kit: shadcn accent must be a neutral hover surface, not the primary color')
  }
  for (const [k, v] of Object.entries({ ...theme, ...light })) {
    if (v.replace(/\s+/g, '') === `var(--${k})`) throw new Error(`build-kit: --${k} references itself`)
  }
  return { theme, light }
}

function syncRegistryTheme(cssVars) {
  const regPath = path.join(root, 'registry.json')
  const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'))
  const item = reg.items.find((i) => i.name === 'sugon-theme')
  if (!item) throw new Error('build-kit: registry.json has no sugon-theme item')
  item.cssVars = cssVars
  return { regPath, content: JSON.stringify(reg, null, 2) + '\n' }
}


function loadBrand() {
  const p = path.join(root, 'tokens/sugon.brand.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function renderBrandColorsMd(brand) {
  const red = brand.color.brand.red
  const gray = brand.color.brand.gray
  const lines = []
  lines.push('# 品牌颜色（由 tokens/sugon.brand.json 生成）')
  lines.push('')
  lines.push('| Token | HEX | CSS 变量 | 用途 |')
  lines.push('|-------|-----|----------|------|')
  lines.push(`| brand.red | \`${red.$value}\` | \`${red.$css}\` | ${red.usage} |`)
  lines.push(`| brand.gray | \`${gray.$value}\` | \`${gray.$css}\` | ${gray.usage} |`)
  lines.push(`| ui.primary（对照） | \`${brand.uiVsBrand.uiPrimary}\` | \`--color-primary\` | 网页按钮 / 链接；**不要**用于 logo |`)
  lines.push('')
  lines.push(brand.uiVsBrand.rule)
  lines.push('')
  lines.push('## 印刷')
  lines.push('')
  lines.push(`- 识别红 CMYK / Pantone：${brand.color.print.red.cmyk} / ${brand.color.print.red.pantone}`)
  lines.push(`- 灰 CMYK / Pantone：${brand.color.print.gray.cmyk} / ${brand.color.print.gray.pantone}`)
  lines.push(`- ${brand.color.print.red.note}`)
  lines.push('')
  return lines.join('\n')
}

function renderBrandFontsMd(brand) {
  const f = brand.font.sans
  const lines = []
  lines.push('# 字体与授权（由 tokens/sugon.brand.json 生成）')
  lines.push('')
  lines.push(`- **默认正文/标题**：${f.primary.join(' / ')}`)
  lines.push(`- **可选标题**：${f.optionalTitle.join(' / ')}`)
  lines.push(`- **Office 编辑回退（禁止出图）**：${f.officeFallback.join(' / ')}`)
  lines.push('')
  lines.push('## 规则')
  lines.push('')
  for (const r of f.rules) lines.push(`- ${r}`)
  lines.push('')
  lines.push('## 下载')
  lines.push('')
  lines.push(`- 思源黑体：${f.downloads.sourceHanSansSC}`)
  lines.push(`- 阿里巴巴普惠体：${f.downloads.alibabaPuHuiTi}`)
  lines.push('')
  return lines.join('\n')
}

function renderBrandParamsMd(brand) {
  const red = brand.color.brand.red.$value
  const gray = brand.color.brand.gray.$value
  const lines = []
  lines.push('# 曙光云品牌参数包（粘贴给 Kimi / AiPPT）')
  lines.push('')
  lines.push('```')
  lines.push('品牌名称：曙光云 / Sugon Cloud')
  lines.push(`识别红（logo/VI/PPT/印刷）：${red}`)
  lines.push(`Logo 灰（仅 logo）：${gray}`)
  lines.push(`UI 交互红（网页按钮，勿用于 logo）：${brand.uiVsBrand.uiPrimary}`)
  lines.push('主字体：Source Han Sans SC / Noto Sans CJK SC（思源黑体）')
  lines.push('可选标题字体：阿里巴巴普惠体')
  lines.push('禁止：微软雅黑出现在导出图片/PDF；PPT 默认不嵌入字体')
  lines.push('Logo：横式 SVG 原稿（Sugon + 曙光云）；深底反白稿待提供')
  lines.push(`Logo 最小宽度草案：屏 ${brand.logo.minSize.screenPxWidth.value}px / 印刷 ${brand.logo.minSize.printMmWidth.value}mm（待确认）`)
  lines.push(`安全空间草案：${brand.logo.clearSpace.x.value}（待确认）`)
  lines.push('版式：政企汇报 PPT 默认 16:9')
  lines.push('```')
  lines.push('')
  lines.push('把上面代码块内容整段粘贴到 Kimi「风格描述」或 AiPPT 品牌设置即可。')
  lines.push('')
  return lines.join('\n')
}

function renderBrandTokensCss(brand) {
  const red = brand.color.brand.red
  const gray = brand.color.brand.gray
  return `/**
 * 曙光云品牌识别色（非 UI）。由 tokens/sugon.brand.json 生成。
 * 不覆盖 --color-primary（UI 仍为 #C8161D）。
 */
:root {
  ${red.$css}: ${red.$value};
  ${gray.$css}: ${gray.$value};
}
`
}

function syncBrandAssets() {
  const srcLogo = path.join(root, 'brand-assets/logo/sugon-cloud-logo.svg')
  const srcPng = path.join(root, 'brand-assets/logo/sugon-cloud-logo_on-white.png')
  const targets = [
    'skills/sugon-brand-core/assets/logo',
    'skills/sugon-logo-usage/assets/logo',
  ]
  const outs = []
  for (const dir of targets) {
    const abs = path.join(root, dir)
    fs.mkdirSync(abs, { recursive: true })
    for (const [src, name] of [[srcLogo, 'sugon-cloud-logo.svg'], [srcPng, 'sugon-cloud-logo_on-white.png']]) {
      if (!fs.existsSync(src)) continue
      const dest = path.join(abs, name)
      outs.push({ dest, content: fs.readFileSync(src) })
    }
  }
  return outs
}


function writeOrCheck(filePath, content) {
  const isBuf = Buffer.isBuffer(content)
  const next = isBuf ? content : (content.endsWith('\n') ? content : content + '\n')
  const rel = path.relative(root, filePath)
  if (checkOnly) {
    if (!fs.existsSync(filePath)) {
      console.error(`build-kit --check: FAIL — missing ${rel}`)
      return false
    }
    const prev = fs.readFileSync(filePath)
    if (!prev.equals(Buffer.isBuffer(next) ? next : Buffer.from(next))) {
      console.error(`build-kit --check: FAIL — drift in ${rel}`)
      return false
    }
    return true
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, next)
  console.log(`build-kit: wrote ${rel}`)
  return true
}

function main() {
  const { raw, flat, meta } = loadTokens()
  if (flat.length < 50) {
    console.error(`build-kit: expected ≥50 tokens, got ${flat.length}`)
    process.exit(1)
  }

  const css = renderTokensCss({ flat, meta })
  const frontmatter = renderDesignFrontmatter({ raw, meta })
  const prose = ensureProse()
  const designMd = frontmatter + prose
  const cssVars = renderCssVars({ raw })
  const version = meta.version
  if (!version) throw new Error('build-kit: meta.version is required')
  const tag = `v${version}`
  const playground = {
    version,
    primary: meta.primary || '#C8161D',
    name: meta.name || 'sugon-brand-kit',
    colors: Object.fromEntries(
      Object.entries(raw.color || {})
        .filter(([, e]) => e.$type === 'color')
        .map(([k, e]) => [k, e.$value]),
    ),
    radius: Object.fromEntries(Object.entries(raw.radius || {}).map(([k, e]) => [k, e.$value])),
    text: Object.fromEntries(Object.entries(raw.text || {}).map(([k, e]) => [k, e.$value])),
    space: Object.fromEntries(Object.entries(raw.space || {}).map(([k, e]) => [k, e.$value])),
    install: {
      skills: 'npx skills add tao66175545-boop/sugon-cloud-skillui',
      skillsPinned: `npx skills add https://github.com/tao66175545-boop/sugon-cloud-skillui/tree/${tag}/skills/sugon-brand-kit`,
      shadcnKit: `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit#${tag}`,
      shadcnTokens: `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-tokens#${tag}`,
      shadcnTheme: `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-theme#${tag}`,
      cdnTokens: `https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@${tag}/skills/sugon-brand-kit/tokens.css`,
      cdnComponents: `https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@${tag}/skills/sugon-brand-kit/components.css`,
    },
  }

  let ok = true
  ok = writeOrCheck(path.join(skillDir, 'tokens.css'), css) && ok
  ok = writeOrCheck(path.join(skillDir, 'DESIGN.md'), designMd) && ok
  ok = writeOrCheck(path.join(root, 'registry/generated/theme.cssVars.json'), JSON.stringify(cssVars, null, 2) + '\n') && ok
  const reg = syncRegistryTheme(cssVars)
  ok = writeOrCheck(reg.regPath, reg.content) && ok
  ok = writeOrCheck(path.join(root, 'src/playground/tokens.generated.json'), JSON.stringify(playground, null, 2) + '\n') && ok
  // Keep app-local mirror in sync (used if someone @imports from src/styles)
  ok = writeOrCheck(path.join(root, 'src/styles/sugon-tokens.css'), css) && ok

  const brand = loadBrand()
  if (brand) {
    ok = writeOrCheck(path.join(root, 'skills/sugon-brand-core/references/colors.md'), renderBrandColorsMd(brand)) && ok
    ok = writeOrCheck(path.join(root, 'skills/sugon-brand-core/references/fonts.md'), renderBrandFontsMd(brand)) && ok
    ok = writeOrCheck(path.join(root, 'skills/sugon-brand-core/brand-params.md'), renderBrandParamsMd(brand)) && ok
    ok = writeOrCheck(path.join(root, 'skills/sugon-brand-core/brand-tokens.css'), renderBrandTokensCss(brand)) && ok
    ok = writeOrCheck(path.join(root, 'src/styles/sugon-brand-tokens.css'), renderBrandTokensCss(brand)) && ok
    for (const { dest, content } of syncBrandAssets()) {
      ok = writeOrCheck(dest, content) && ok
    }
  }

  if (checkOnly) {
    if (!ok) process.exit(1)
    console.log(`build-kit --check: OK — ${flat.length} tokens, generated files match`)
    return
  }
  console.log(`build-kit: OK — ${flat.length} tokens compiled`)
}

try {
  main()
} catch (err) {
  console.error(`build-kit: FAIL — ${err instanceof Error ? err.message.replace(/^build-kit: /, '') : err}`)
  process.exit(1)
}
