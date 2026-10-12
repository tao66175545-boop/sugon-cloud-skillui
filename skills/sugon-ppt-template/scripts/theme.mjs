/**
 * sugon-ppt-template design tokens (frozen) — P0 from 高级PPT设计专家 audit.
 * 16:9 LAYOUT_WIDE = 13.333" × 7.5". Brand red #AF1F24 only for logo / section digits /
 * ≤1 KPI focus / list bullets / recommended|current. H2 default dark.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(skillRoot, '../..')

const brand = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'tokens/sugon.brand.json'), 'utf8'),
)

/** hex without # */
export const COLOR = Object.freeze({
  brand: brand.color.brand.red.$value.replace('#', '').toUpperCase(), // AF1F24
  text: '1A1A1A',
  body: '333333',
  muted: '727272',
  white: 'FFFFFF',
  card: 'F0F0F0',
  line: 'E8E8E8',
  subtle: 'FAFAFA',
  /** semantic — status cells only, area <5% */
  warn: 'C45C26',
  ok: '2F6F4E',
})

export const FONT = 'Source Han Sans SC'

export const W = 13.333
export const H = 7.5

/** page margins (inches) */
export const MARGIN = Object.freeze({ L: 0.6, R: 0.6, T: 0.45, B: 0.4 })

export const GUTTER = 0.2
export const CARD_PAD = Object.freeze({ H: 0.22, V: 0.18 })
export const TITLE_TO_CONTENT = 0.28

/** logo top-right inset from edges */
export const LOGO = Object.freeze({ inset: 0.35, w: 1.5, aspect: 2.506 })

/**
 * Type scale (pt). Body line-height target 1.35–1.45 via pptx spacing where available.
 */
export const TYPE = Object.freeze({
  display: 38,
  sectionDigit: 84,
  h1: 23,
  subtitle: 12,
  h2: 15,
  body: 13,
  aux: 10,
  kpi: 48,
  kpiUnit: 12,
})

/** red tick bar beside H1: 4pt × 22pt, 8pt gap to title */
export const TICK = Object.freeze({
  w: 4 / 72,
  h: 22 / 72,
  gap: 8 / 72,
})

export const CW = W - MARGIN.L - MARGIN.R
export const contentTop = () => MARGIN.T + TICK.h + 0.12 + 0.028 + TITLE_TO_CONTENT

export const logoPath = path.join(skillRoot, 'assets/logo.png')
export { skillRoot, repoRoot }

/** Colors allowed in check-deck (uppercase #RRGGBB). */
export const ALLOWED_HEX = Object.freeze(
  [
    `#${COLOR.brand}`,
    `#${COLOR.text}`,
    `#${COLOR.body}`,
    `#${COLOR.muted}`,
    `#${COLOR.white}`,
    `#${COLOR.card}`,
    `#${COLOR.line}`,
    `#${COLOR.subtle}`,
    `#${COLOR.warn}`,
    `#${COLOR.ok}`,
    '#727272', // logo gray only
    '#000000',
  ].map((c) => c.toUpperCase()),
)

/** Forbidden low-contrast pair on cards */
export const BANNED_ON_CARD = Object.freeze(['999999', '999', 'A3A3A3', 'B0B0B0'])
