import brandKitTokensCss from '../../design-skills/brand-kit/tokens.css?raw'
import brandKitDesignMd from '../../design-skills/brand-kit/DESIGN.md?raw'
import { loadSkills, normalizeSupplyPath, type Skill } from './skills'

/** Parsed preview palette + type/spacing samples for the in-chat style card. */
export type StylePreviewTokens = {
  colors: { name: string; value: string }[]
  fontSans: string
  textSampleSize: string
  spaces: { name: string; value: string }[]
  /** Where the color values came from */
  colorSource: 'tokens.css' | 'DESIGN.md' | 'content' | 'derived' | 'placeholder'
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
  /** Short label for typography sample (path slug or truncated name) */
  shortLabel: string
}

/**
 * User-facing chip for the palette source. Two trust groups:
 * - 'real': colors come from the skill's own tokens.css / DESIGN.md
 * - 'illustrative': guessed from text, auto-derived, or brand fallback
 * Never shows internal words (tokens / derived / content) to users.
 */
export function colorSourceLabel(source: StylePreviewTokens['colorSource']): {
  text: string
  trust: 'real' | 'illustrative'
  title: string
} {
  switch (source) {
    case 'tokens.css':
      return { text: '设计令牌', trust: 'real', title: '色板读取自该 Skill 的 tokens.css' }
    case 'DESIGN.md':
      return { text: '来自 DESIGN.md', trust: 'real', title: '色板读取自该 Skill 的 DESIGN.md' }
    case 'content':
      return { text: '正文取色', trust: 'illustrative', title: '从 Skill 描述正文中提取的色值，非正式令牌' }
    case 'derived':
      return { text: '自动配色 · 仅示意', trust: 'illustrative', title: '未找到配色文件，按 Skill 自动生成的示意色，非正式令牌' }
    default:
      return { text: '未找到配色 · 品牌默认', trust: 'illustrative', title: '未找到任何配色，暂用品牌默认色' }
  }
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

/** Path slug or truncated name for typography / labels. */
export function skillShortLabel(skill: Skill): string {
  const parts = skill.path.replace(/\\/g, '/').split('/').filter(Boolean)
  const slug = parts[parts.length - 1] || skill.id || skill.name
  const label = slug.trim() || skill.name.trim() || 'skill'
  return label.length > 28 ? `${label.slice(0, 26)}…` : label
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

/** Tone for source badges — 入库 primary light；种子中性灰 */
export function skillSourceBadgeTone(skill: Skill): {
  color: string
  background: string
  border: string
} {
  const kind = skillSourceBadge(skill)
  if (kind === '种子') {
    return {
      color: 'var(--color-text-secondary)',
      background: 'var(--color-bg-muted)',
      border: '1px solid var(--color-border)',
    }
  }
  // 入库
  return {
    color: 'var(--color-primary)',
    background: 'var(--color-primary-muted)',
    border: '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)',
  }
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

function expandHex(hex: string): string {
  const h = hex.replace(/^#/, '')
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase()
  }
  if (h.length === 4) {
    // #RGBA → ignore alpha for preview swatches
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase()
  }
  if (h.length === 8) {
    return `#${h.slice(0, 6)}`.toUpperCase()
  }
  return `#${h.slice(0, 6)}`.toUpperCase()
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const full = expandHex(hex).replace(/^#/, '')
  if (!/^[0-9A-Fa-f]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = Math.max(0, Math.min(100, s)) / 100
  const light = Math.max(0, Math.min(100, l)) / 100
  const hue = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (hue < 60) {
    rp = c
    gp = x
  } else if (hue < 120) {
    rp = x
    gp = c
  } else if (hue < 180) {
    gp = c
    bp = x
  } else if (hue < 240) {
    gp = x
    bp = c
  } else if (hue < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }
  return rgbToHex((rp + m) * 255, (gp + m) * 255, (bp + m) * 255)
}

function mixHex(hex: string, toward: string, t: number): string {
  const a = parseHexRgb(hex)
  const b = parseHexRgb(toward)
  if (!a || !b) return expandHex(hex)
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  )
}

function darkenHex(hex: string, amount: number): string {
  return mixHex(hex, '#000000', amount)
}

function lightenHex(hex: string, amount: number): string {
  return mixHex(hex, '#ffffff', amount)
}

function relativeLuminance(hex: string): number {
  const rgb = parseHexRgb(hex)
  if (!rgb) return 0
  const lin = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

/** Prefer saturated / mid-lightness swatches as primary. */
function isVividHex(hex: string): boolean {
  const rgb = parseHexRgb(hex)
  if (!rgb) return false
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  const sat = max === 0 ? 0 : (max - min) / max
  const lum = relativeLuminance(hex)
  return sat >= 0.25 && lum > 0.08 && lum < 0.85
}

function hashString(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // Avalanche (murmur3 fmix32) so similar ids/slugs land on distant hues.
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/**
 * Pull #RGB / #RRGGBB from skill text fields; map first vivid as primary.
 * Returns [] when fewer than 2 usable hexes (caller falls through to derived).
 */
function extractColorsFromSkillContent(
  skill: Skill,
): { name: string; value: string }[] {
  const blob = [skill.content, skill.purpose, skill.name]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join('\n')
  if (!blob) return []

  const hexRe = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g
  const seen = new Set<string>()
  const hexes: string[] = []
  let m: RegExpExecArray | null
  while ((m = hexRe.exec(blob))) {
    const value = expandHex(`#${m[1]}`)
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    // Skip near-white / near-black noise unless we have nothing else later
    seen.add(key)
    hexes.push(value)
  }
  if (hexes.length < 2) return []

  const vivid = hexes.find(isVividHex) || hexes[0]
  const rest = hexes.filter((h) => h.toLowerCase() !== vivid.toLowerCase())

  const surface =
    rest.find((h) => relativeLuminance(h) > 0.85) || '#FFFFFF'
  const text =
    rest.find((h) => relativeLuminance(h) < 0.2) || '#171717'
  const border =
    rest.find(
      (h) =>
        h.toLowerCase() !== surface.toLowerCase() &&
        h.toLowerCase() !== text.toLowerCase() &&
        relativeLuminance(h) > 0.55,
    ) || lightenHex(vivid, 0.82)
  const primaryMuted =
    rest.find(
      (h) =>
        h.toLowerCase() !== vivid.toLowerCase() &&
        h.toLowerCase() !== surface.toLowerCase() &&
        relativeLuminance(h) > 0.75,
    ) || lightenHex(vivid, 0.88)

  return [
    { name: 'primary', value: vivid },
    { name: 'surface', value: surface },
    { name: 'border', value: border },
    { name: 'text', value: text },
    { name: 'primary-muted', value: primaryMuted },
  ]
}

/* ---------- Derived hue spacing (persisted) ---------- */

export const DERIVED_HUES_KEY = 'sugon-skillui-derived-hues'
const HUE_MIN = 25
const HUE_MAX = 324
const HUE_MIN_GAP = 40
const CROWDED_LIGHT_SHIFT = 10

/** Stored value: plain hue, or hue + lightness shift when the wheel is crowded. */
type StoredHue = number | { hue: number; light: number }
export type DerivedHueSlot = { hue: number; lightShift: number }

function derivedSeed(skill: Skill): string {
  return `${skill.id || skill.name || 'skill'}|${skillShortLabel(skill)}`
}

/** Start hue from hash of id + path slug, mapped into 25°–324°. */
export function derivedStartHue(skill: Skill): number {
  return HUE_MIN + (hashString(derivedSeed(skill)) % (HUE_MAX - HUE_MIN + 1))
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

function toSlot(v: StoredHue): DerivedHueSlot | null {
  if (typeof v === 'number' && Number.isFinite(v)) return { hue: v, lightShift: 0 }
  if (v && typeof v === 'object' && Number.isFinite(v.hue)) {
    return { hue: v.hue, lightShift: Number.isFinite(v.light) ? v.light : 0 }
  }
  return null
}

/**
 * Pure placement: keep `start` if ≥40° from every taken hue; else nearest free
 * slot searching outward (1° steps, both directions, inside 25°–324°); if the
 * wheel is full, take the slot maximizing min distance and alternate lightness.
 */
export function placeDerivedHue(start: number, taken: DerivedHueSlot[]): DerivedHueSlot {
  const minDist = (h: number) =>
    taken.reduce((m, t) => Math.min(m, hueDistance(h, t.hue)), Infinity)
  if (minDist(start) >= HUE_MIN_GAP) return { hue: start, lightShift: 0 }
  for (let d = 1; d <= HUE_MAX - HUE_MIN; d++) {
    for (const cand of [start + d, start - d]) {
      if (cand < HUE_MIN || cand > HUE_MAX) continue
      if (minDist(cand) >= HUE_MIN_GAP) return { hue: cand, lightShift: 0 }
    }
  }
  // Crowded: best-spread hue (ties → nearest to start), plus darker/lighter alternation.
  let best = start
  let bestScore = -1
  for (let d = 0; d <= HUE_MAX - HUE_MIN; d++) {
    for (const cand of d === 0 ? [start] : [start + d, start - d]) {
      if (cand < HUE_MIN || cand > HUE_MAX) continue
      const score = minDist(cand)
      if (score > bestScore) {
        best = cand
        bestScore = score
      }
    }
  }
  const crowdedCount = taken.filter((t) => t.lightShift !== 0).length
  const lightShift = crowdedCount % 2 === 0 ? -CROWDED_LIGHT_SHIFT : CROWDED_LIGHT_SHIFT
  return { hue: best, lightShift }
}

function readHueMap(): Record<string, StoredHue> {
  try {
    const raw = globalThis.localStorage?.getItem(DERIVED_HUES_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, StoredHue>)
      : {}
  } catch {
    return {}
  }
}

function writeHueMap(map: Record<string, StoredHue>): void {
  try {
    globalThis.localStorage?.setItem(DERIVED_HUES_KEY, JSON.stringify(map))
  } catch {
    /* storage full / unavailable: hues stay in-memory for this call */
  }
}

/** Skills that will fall through to the derived palette (no bundled tokens, no content hex). */
function isDerivedEligible(skill: Skill): boolean {
  const dir = normalizeDirPath(skill.path)
  if (BUNDLED[dir]?.tokens) return false
  return extractColorsFromSkillContent(skill).length < 3
}

function skillKey(skill: Skill): string {
  return skill.id || derivedSeed(skill)
}

/**
 * Stable per-skill hue. Seeds every derived-eligible library skill in
 * createdAt→id order (so assignment does not depend on preview order),
 * reuses any stored hue, and persists new ones in localStorage.
 */
export function resolveDerivedHue(skill: Skill, library?: Skill[]): DerivedHueSlot {
  const map = readHueMap()
  let changed = false
  let lib: Skill[] = []
  try {
    lib = library ?? loadSkills()
  } catch {
    lib = []
  }
  const queue = lib
    .filter(isDerivedEligible)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
  if (!queue.some((s) => skillKey(s) === skillKey(skill))) queue.push(skill)
  for (const s of queue) {
    const key = skillKey(s)
    if (toSlot(map[key])) continue
    const taken = Object.values(map)
      .map(toSlot)
      .filter((x): x is DerivedHueSlot => x !== null)
    const slot = placeDerivedHue(derivedStartHue(s), taken)
    map[key] = slot.lightShift ? { hue: slot.hue, light: slot.lightShift } : slot.hue
    changed = true
  }
  if (changed) writeHueMap(map)
  return toSlot(map[skillKey(skill)]) ?? { hue: derivedStartHue(skill), lightShift: 0 }
}

/**
 * Deterministic HSL/hex palette seeded by skill id (or path slug)
 * so each 入库 skill gets a visibly different primary.
 */
export function derivePaletteFromSkill(
  skill: Skill,
): { name: string; value: string }[] {
  const h = hashString(derivedSeed(skill))
  // Hue 25–324: skip the brand-kit red band (~325–25) so derived never mimics #C8161D.
  // Spaced ≥40° from other derived skills and persisted per skill id (see resolveDerivedHue).
  const slot = resolveDerivedHue(skill)
  const hue = slot.hue
  const sat = 58 + ((h >>> 9) % 17)
  const light = Math.max(24, Math.min(58, 36 + ((h >>> 17) % 10) + slot.lightShift))
  const primary = hslToHex(hue, sat, light)
  const primaryMuted = hslToHex(hue, 48, 94)
  const text = hslToHex(hue, 18, 12)
  const border = hslToHex(hue, 12, 88)
  const muted = hslToHex(hue, 10, 38)
  return [
    { name: 'primary', value: primary },
    { name: 'surface', value: '#FFFFFF' },
    { name: 'border', value: border },
    { name: 'text', value: text },
    { name: 'primary-muted', value: primaryMuted },
    { name: 'muted', value: muted },
  ]
}

function parseDesignColors(md: string): { name: string; value: string }[] {
  const picked: { name: string; value: string }[] = []
  const seen = new Set<string>()
  const rowRe =
    /\|\s*`?--color-([a-z0-9-]+)`?\s*\|\s*`?(#[0-9A-Fa-f]{3,8})`?\s*\|/g
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(md))) {
    const name = m[1]
    const value = expandHex(m[2])
    if (seen.has(value.toLowerCase())) continue
    seen.add(value.toLowerCase())
    picked.push({ name, value })
    if (picked.length >= 5) break
  }
  if (picked.length < 3) {
    const hexRe = /#([0-9A-Fa-f]{6})\b/g
    let h: RegExpExecArray | null
    while ((h = hexRe.exec(md))) {
      const value = expandHex(`#${h[1]}`)
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
 * When DESIGN.md / content / derived supplies palette but tokens are thin,
 * overlay primary/surface/text and retint hover / muted / focus ring.
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
  // Overlay picked colors so DESIGN.md-only / content / derived still tint the sandbox.
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

  const primaryHex = extractHex(out['--color-primary'] || '')
  if (primaryHex && !/^#(9ca3af|6b7280|4b5563)$/i.test(primaryHex)) {
    // Retint companion tokens when skill CSS did not define them so buttons/focus match primary.
    if (!vars['--color-primary-hover']) {
      out['--color-primary-hover'] = darkenHex(primaryHex, 0.14)
    }
    if (!vars['--color-primary-active']) {
      out['--color-primary-active'] = darkenHex(primaryHex, 0.22)
    }
    if (!vars['--color-primary-muted']) {
      const fromColors = colors.find((c) => c.name === 'primary-muted')?.value
      out['--color-primary-muted'] = fromColors || lightenHex(primaryHex, 0.88)
    }
    if (!vars['--focus-ring']) {
      out['--focus-ring'] = `0 0 0 3px ${out['--color-primary-muted']}`
    }
    if (!vars['--focus-ring-strong']) {
      out['--focus-ring-strong'] =
        `0 0 0 3px color-mix(in srgb, ${out['--color-primary']} 28%, transparent)`
    }
    if (!vars['--color-primary-foreground']) {
      out['--color-primary-foreground'] =
        relativeLuminance(primaryHex) > 0.55 ? '#171717' : '#FFFFFF'
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
    // Dev server SPA fallback answers missing files with index.html (200) — treat as absent.
    const type = res.headers.get('content-type') || ''
    if (/text\/html/i.test(type)) return null
    const text = await res.text()
    if (/^\s*<(!doctype|html)/i.test(text)) return null
    return text
  } catch {
    return null
  }
}

/**
 * Load preview data:
 * tokens.css → DESIGN.md → content hex → derived palette → brand placeholder.
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
      if (dColors.length >= 3) {
        preview = buildPreview(vars, dColors, 'DESIGN.md')
      } else {
        preview = previewFromContentOrDerived(skill, vars)
      }
    } else {
      preview = previewFromContentOrDerived(skill, vars)
    }
  } else if (designMd) {
    const dColors = parseDesignColors(designMd)
    if (dColors.length >= 3) {
      preview = buildPreview({}, dColors, 'DESIGN.md')
    } else {
      preview = previewFromContentOrDerived(skill, {})
    }
  } else {
    preview = previewFromContentOrDerived(skill, {})
  }

  return {
    skill,
    sourceBadge: skillSourceBadge(skill),
    tokensPath,
    importPath,
    importSnippet: skillImportSnippet(skill),
    preview,
    shortLabel: skillShortLabel(skill),
  }
}

/** content hex (≥2) → derived(seed) → brand placeholder last resort. */
function previewFromContentOrDerived(
  skill: Skill,
  vars: Record<string, string>,
): StylePreviewTokens {
  const contentColors = extractColorsFromSkillContent(skill)
  if (contentColors.length >= 3) {
    return buildPreview(vars, contentColors, 'content')
  }
  const derived = derivePaletteFromSkill(skill)
  if (derived.length >= 3) {
    return buildPreview(vars, derived, 'derived')
  }
  return buildPreview(vars, BRAND_PLACEHOLDER, 'placeholder')
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
