import brandKitTokensCss from '../../design-skills/brand-kit/tokens.css?raw'
import brandKitDesignMd from '../../design-skills/brand-kit/DESIGN.md?raw'
import { normalizeSupplyPath, type Skill } from './skills'

/** Parsed preview palette + type/spacing samples for the in-chat style card. */
export type StylePreviewTokens = {
  colors: { name: string; value: string }[]
  fontSans: string
  textSampleSize: string
  spaces: { name: string; value: string }[]
  /** Where the color values came from */
  colorSource: 'tokens.css' | 'DESIGN.md' | 'placeholder'
  /**
   * Curated CSS custom properties for the Shadow sandbox
   * (buttons / input / type scale). Keys include leading `--`.
   */
  sandboxVars: Record<string, string>
}

export type StylePreviewModel = {
  skill: Skill
  /** Face badge next to name */
  sourceBadge: string
  tokensPath: string
  importPath: string
  importSnippet: string
  preview: StylePreviewTokens
}

/** Brand-kit fallback when skill tokens.css / DESIGN.md lack a rich palette. */
const BRAND_PLACEHOLDER: { name: string; value: string }[] = [
  { name: 'primary', value: '#C8161D' },
  { name: 'surface', value: '#ffffff' },
  { name: 'border', value: '#e5e5e5' },
  { name: 'text', value: '#171717' },
  { name: 'muted', value: '#525252' },
]

/** Fallback sandbox vars when tokens.css is missing / incomplete (brand-kit). */
const SANDBOX_FALLBACK: Record<string, string> = {
  '--color-primary': '#C8161D',
  '--color-primary-hover': '#A81218',
  '--color-primary-active': '#8F0F14',
  '--color-primary-foreground': '#ffffff',
  '--color-primary-muted': '#FCE8E9',
  '--color-surface': '#ffffff',
  '--color-bg': '#ffffff',
  '--color-bg-subtle': '#f5f5f5',
  '--color-bg-muted': '#eeeeee',
  '--color-border': '#e5e5e5',
  '--color-border-strong': '#d4d4d4',
  '--color-text': '#171717',
  '--color-text-secondary': '#525252',
  '--color-text-muted': '#a3a3a3',
  '--font-sans': '"Noto Sans SC", "PingFang SC", system-ui, sans-serif',
  '--font-mono': 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  '--text-sm': '0.875rem',
  '--text-base': '1rem',
  '--text-xl': '1.25rem',
  '--leading-normal': '1.5',
  '--radius-md': '0.5rem',
  '--radius-lg': '0.75rem',
  '--space-2': '0.5rem',
  '--space-3': '0.75rem',
  '--space-4': '1rem',
  '--btn-height': '2.25rem',
  '--btn-px': '1rem',
  '--btn-radius': '0.75rem',
  '--btn-font-size': '0.875rem',
  '--btn-font-weight': '600',
  '--btn-transition':
    'background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  '--focus-ring': '0 0 0 3px #FCE8E9',
  '--focus-ring-strong': '0 0 0 3px color-mix(in srgb, #C8161D 28%, transparent)',
  '--shadow-sm': '0 1px 2px 0 rgb(23 23 23 / 0.05)',
  '--shadow-md':
    '0 4px 6px -1px rgb(23 23 23 / 0.08), 0 2px 4px -2px rgb(23 23 23 / 0.06)',
}

const SANDBOX_KEYS = Object.keys(SANDBOX_FALLBACK)

const COLOR_PICK_ORDER = [
  'primary',
  'accent',
  'bg',
  'surface',
  'text',
  'border',
  'primary-muted',
  'bg-subtle',
  'text-secondary',
]

const BUNDLED: Record<string, { tokens?: string; design?: string }> = {
  'design-skills/brand-kit/': {
    tokens: brandKitTokensCss,
    design: brandKitDesignMd,
  },
}

function normalizeDirPath(path: string): string {
  return normalizeSupplyPath(path)
}

export function skillTokensPath(skill: Skill): string {
  const dir = normalizeDirPath(skill.path)
  return `${dir}tokens.css`
}

/**
 * Relative @import target: brand-kit → export/sugon-skillui.css;
 * other skills → that skill's tokens.css. No new export flow.
 */
export function skillImportPath(skill: Skill): string {
  const dir = normalizeDirPath(skill.path)
  if (dir === 'design-skills/brand-kit/' || dir.endsWith('/brand-kit/')) {
    return 'export/sugon-skillui.css'
  }
  return `${dir}tokens.css`
}

export function skillImportSnippet(skill: Skill): string {
  return `@import "${skillImportPath(skill)}";`
}

export function skillSourceBadge(skill: Skill): string {
  if (skill.id === 'brand-kit') return '种子'
  return '入库'
}

function parseCssVars(css: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css))) {
    out[m[1].trim()] = m[2].trim()
  }
  return out
}

function pickColorsFromVars(
  vars: Record<string, string>,
): { name: string; value: string }[] {
  const picked: { name: string; value: string }[] = []
  const seen = new Set<string>()
  for (const key of COLOR_PICK_ORDER) {
    const full = `--color-${key}`
    const val = vars[full]
    if (!val) continue
    const hex = extractHex(val) || val
    if (seen.has(hex.toLowerCase())) continue
    seen.add(hex.toLowerCase())
    picked.push({ name: key, value: hex })
    if (picked.length >= 5) break
  }
  if (picked.length < 3) {
    for (const [k, v] of Object.entries(vars)) {
      if (!k.startsWith('--color-')) continue
      const hex = extractHex(v) || v
      if (seen.has(hex.toLowerCase())) continue
      seen.add(hex.toLowerCase())
      picked.push({ name: k.replace(/^--color-/, ''), value: hex })
      if (picked.length >= 5) break
    }
  }
  return picked.slice(0, 5)
}

function extractHex(s: string): string | null {
  const m = s.match(/#([0-9A-Fa-f]{3,8})\b/)
  return m ? `#${m[1]}` : null
}

function parseDesignColors(md: string): { name: string; value: string }[] {
  const picked: { name: string; value: string }[] = []
  const seen = new Set<string>()
  const rowRe =
    /\|\s*`?--color-([a-z0-9-]+)`?\s*\|\s*`?(#[0-9A-Fa-f]{3,8})`?\s*\|/g
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(md))) {
    const name = m[1]
    const value = m[2]
    if (seen.has(value.toLowerCase())) continue
    seen.add(value.toLowerCase())
    picked.push({ name, value })
    if (picked.length >= 5) break
  }
  if (picked.length < 3) {
    const hexRe = /#([0-9A-Fa-f]{6})\b/g
    let h: RegExpExecArray | null
    while ((h = hexRe.exec(md))) {
      const value = `#${h[1]}`
      if (seen.has(value.toLowerCase())) continue
      seen.add(value.toLowerCase())
      picked.push({ name: `color-${picked.length + 1}`, value })
      if (picked.length >= 5) break
    }
  }
  return picked.slice(0, 5)
}

function spacesFromVars(
  vars: Record<string, string>,
): { name: string; value: string }[] {
  const keys = ['space-2', 'space-4', 'space-6', 'space-8']
  const out: { name: string; value: string }[] = []
  for (const k of keys) {
    const v = vars[`--${k}`]
    if (v) out.push({ name: k, value: v })
  }
  if (!out.length) {
    return [
      { name: 'space-2', value: '0.5rem' },
      { name: 'space-4', value: '1rem' },
      { name: 'space-6', value: '1.5rem' },
    ]
  }
  return out
}

/**
 * Build sandbox CSS vars for Shadow: prefer parsed tokens, else brand-kit fallback.
 * When DESIGN.md supplies palette but tokens are thin, overlay primary/surface/text.
 */
function buildSandboxVars(
  vars: Record<string, string>,
  colors: { name: string; value: string }[],
  _usePlaceholder: boolean,
): Record<string, string> {
  const out: Record<string, string> = { ...SANDBOX_FALLBACK }
  // Always layer skill vars when present; brand-kit base fills gaps for thin 入库 skills.
  for (const key of SANDBOX_KEYS) {
    const v = vars[key]
    if (v) out[key] = v
  }
  // Overlay picked colors so DESIGN.md-only / partial tokens still tint the sandbox.
  for (const c of colors) {
    const full = `--color-${c.name}`
    if (SANDBOX_KEYS.includes(full) || full.startsWith('--color-')) {
      out[full] = c.value
    }
  }
  const primaryFromColors =
    colors.find((c) => c.name === 'primary' || c.name === 'accent')?.value ||
    colors[0]?.value
  if (primaryFromColors && !vars['--color-primary']) {
    out['--color-primary'] = primaryFromColors
  }
  // Never leave mute-gray as primary (legacy placeholder / incomplete 入库 tokens).
  if (
    !out['--color-primary'] ||
    /^#(9ca3af|6b7280|4b5563)$/i.test(out['--color-primary'].trim())
  ) {
    out['--color-primary'] = '#C8161D'
    if (
      !out['--color-primary-hover'] ||
      /^#(9ca3af|6b7280|4b5563)$/i.test(out['--color-primary-hover'].trim())
    ) {
      out['--color-primary-hover'] = '#A81218'
    }
  }
  return out
}

function buildPreview(
  vars: Record<string, string>,
  colors: { name: string; value: string }[],
  colorSource: StylePreviewTokens['colorSource'],
): StylePreviewTokens {
  const usePlaceholder = colors.length < 3
  const finalColors = usePlaceholder ? BRAND_PLACEHOLDER : colors
  const finalSource: StylePreviewTokens['colorSource'] = usePlaceholder
    ? 'placeholder'
    : colorSource
  return {
    colors: finalColors,
    fontSans:
      vars['--font-sans'] ||
      '"Noto Sans SC", "PingFang SC", system-ui, sans-serif',
    textSampleSize: vars['--text-base'] || '1rem',
    spaces: spacesFromVars(vars),
    colorSource: finalSource,
    sandboxVars: buildSandboxVars(vars, finalColors, usePlaceholder),
  }
}

async function tryFetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/**
 * Load preview data: tokens.css → DESIGN.md colors → brand-kit placeholder.
 * Bundled brand-kit is preferred; otherwise fetch relative skill paths.
 */
export async function loadStylePreview(skill: Skill): Promise<StylePreviewModel> {
  const dir = normalizeDirPath(skill.path)
  const tokensPath = skillTokensPath(skill)
  const importPath = skillImportPath(skill)
  const bundled = BUNDLED[dir]

  let tokensCss = bundled?.tokens ?? null
  if (!tokensCss) {
    tokensCss = await tryFetchText(`/${tokensPath}`)
  }
  if (!tokensCss) {
    tokensCss = await tryFetchText(`/${dir}tokens.css`)
  }

  let designMd = bundled?.design ?? null
  if (!designMd) {
    designMd = await tryFetchText(`/${dir}DESIGN.md`)
  }

  let preview: StylePreviewTokens

  if (tokensCss) {
    const vars = parseCssVars(tokensCss)
    const colors = pickColorsFromVars(vars)
    if (colors.length >= 3) {
      preview = buildPreview(vars, colors, 'tokens.css')
    } else if (designMd) {
      const dColors = parseDesignColors(designMd)
      preview = buildPreview(vars, dColors, 'DESIGN.md')
    } else {
      preview = buildPreview(vars, BRAND_PLACEHOLDER, 'placeholder')
    }
  } else if (designMd) {
    const dColors = parseDesignColors(designMd)
    preview = buildPreview({}, dColors, 'DESIGN.md')
  } else {
    preview = buildPreview({}, BRAND_PLACEHOLDER, 'placeholder')
  }

  return {
    skill,
    sourceBadge: skillSourceBadge(skill),
    tokensPath,
    importPath,
    importSnippet: skillImportSnippet(skill),
    preview,
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
