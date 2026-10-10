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

function renderCssVars({ raw }) {
  /** @type {Record<string,string>} */
  const light = {}
  for (const [key, entry] of Object.entries(raw.color || {})) {
    if (entry.$type === 'color') light[key] = entry.$value
  }
  // also map a few radius/space that shadcn themes often use
  for (const [key, entry] of Object.entries(raw.radius || {})) {
    light[`radius-${key}`] = entry.$value
  }
  return {
    light,
    // dark intentionally omitted in 0.3.0 P0
  }
}

function writeOrCheck(filePath, content) {
  const next = content.endsWith('\n') ? content : content + '\n'
  const rel = path.relative(root, filePath)
  if (checkOnly) {
    if (!fs.existsSync(filePath)) {
      console.error(`build-kit --check: FAIL — missing ${rel}`)
      return false
    }
    const prev = fs.readFileSync(filePath, 'utf8')
    if (prev !== next) {
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
  const playground = {
    version: meta.version || '0.3.0',
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
      skillsPinned: 'npx skills add https://github.com/tao66175545-boop/sugon-cloud-skillui/tree/v0.3.0/skills/sugon-brand-kit',
      shadcnKit: 'npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit#v0.3.0',
      shadcnTokens: 'npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-tokens#v0.3.0',
      shadcnTheme: 'npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-theme#v0.3.0',
      cdnTokens: 'https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.3.0/skills/sugon-brand-kit/tokens.css',
      cdnComponents: 'https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.3.0/skills/sugon-brand-kit/components.css',
    },
  }

  let ok = true
  ok = writeOrCheck(path.join(skillDir, 'tokens.css'), css) && ok
  ok = writeOrCheck(path.join(skillDir, 'DESIGN.md'), designMd) && ok
  ok = writeOrCheck(path.join(root, 'registry/generated/theme.cssVars.json'), JSON.stringify(cssVars, null, 2) + '\n') && ok
  ok = writeOrCheck(path.join(root, 'src/playground/tokens.generated.json'), JSON.stringify(playground, null, 2) + '\n') && ok
  // Keep app-local mirror in sync (used if someone @imports from src/styles)
  ok = writeOrCheck(path.join(root, 'src/styles/sugon-tokens.css'), css) && ok

  if (checkOnly) {
    if (!ok) process.exit(1)
    console.log(`build-kit --check: OK — ${flat.length} tokens, generated files match`)
    return
  }
  console.log(`build-kit: OK — ${flat.length} tokens compiled`)
}

main()
