#!/usr/bin/env node
/**
 * Structural checks for a Sugon pptx deck (v0.4.5 P0 palette).
 *   node scripts/check-deck.mjs <file.pptx>
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { ALLOWED_HEX, BANNED_ON_CARD, COLOR } from './theme.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const brand = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tokens/sugon.brand.json'), 'utf8'))

const BRAND_RED = brand.color.brand.red.$value.toUpperCase()
const UI_PRIMARY = brand.uiVsBrand.uiPrimary.toUpperCase()
const ALLOWED = new Set(ALLOWED_HEX)

const PLACEHOLDER_RE =
  /(?:点击添加(?:标题|文本|内容)?|\[\s*(?:标题|副标题)\s*\]|Click to (?:add|edit)|Placeholder|\bTODO\b|\bTBD\b|\bxxx\b)/i
const WINGDINGS_RE = /wingdings|symbol|webdings/i
const BAD_FONT_EXPORT = /微软雅黑|Microsoft YaHei/i

const file = process.argv[2]
if (!file) {
  console.error('usage: node check-deck.mjs <file.pptx>')
  process.exit(2)
}
const abs = path.resolve(file)
const buf = fs.readFileSync(abs)
const zip = await JSZip.loadAsync(buf)
const problems = []

const pres = await zip.file('ppt/presentation.xml')?.async('string')
if (!pres) problems.push('missing ppt/presentation.xml')
else {
  const sldSz = pres.match(/<p:sldSz[^>]*>/)?.[0] || ''
  const cx = Number((sldSz.match(/cx="(\d+)"/) || [])[1] || 0)
  const cy = Number((sldSz.match(/cy="(\d+)"/) || [])[1] || 0)
  if (!cx || !cy) problems.push('cannot read slide size')
  else {
    const ratio = cx / cy
    if (ratio < 1.7 || ratio > 1.85) problems.push(`slide aspect ${ratio.toFixed(3)} not ~16:9`)
  }
}

const slideFiles = Object.keys(zip.files)
  .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
  .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]))

if (slideFiles.length < 3) problems.push(`too few slides: ${slideFiles.length}`)
if (slideFiles.length > 45) {
  problems.push(`sample exceeds 45 masters: ${slideFiles.length} (P0 cap)`)
}

let hasImage = false
let sawBrandRed = false
let sawBannedGray = false

for (const name of slideFiles) {
  const xml = await zip.file(name).async('string')
  if (PLACEHOLDER_RE.test(xml)) problems.push(`${name}: leftover placeholder-like text`)
  if (WINGDINGS_RE.test(xml)) problems.push(`${name}: Wingdings/Symbol font referenced`)
  if (BAD_FONT_EXPORT.test(xml))
    problems.push(`${name}: 微软雅黑 / Microsoft YaHei present (forbidden in exports)`)
  if (/<a:blip |a:blipF/.test(xml) || xml.includes('a:blip')) hasImage = true

  for (const m of xml.matchAll(/srgbClr\s+val="([0-9A-Fa-f]{6})"/g)) {
    const hex = `#${m[1].toUpperCase()}`
    const raw = m[1].toUpperCase()
    if (hex === BRAND_RED) sawBrandRed = true
    if (hex === UI_PRIMARY) {
      problems.push(
        `${name}: UI primary ${UI_PRIMARY} used — PPT should use brand red ${BRAND_RED}`,
      )
    }
    if (BANNED_ON_CARD.includes(raw) || BANNED_ON_CARD.includes(raw.slice(0, 3))) {
      sawBannedGray = true
      problems.push(`${name}: banned low-contrast gray ${hex} (no #999 on card #F0F0F0)`)
    }
    if (!ALLOWED.has(hex)) {
      const r = parseInt(m[1].slice(0, 2), 16)
      const g = parseInt(m[1].slice(2, 4), 16)
      const b = parseInt(m[1].slice(4, 6), 16)
      const isGray = Math.abs(r - g) < 8 && Math.abs(g - b) < 8
      // allow near-whites already covered; flag unknown vivid + mid grays like 999
      if (!isGray || (isGray && r >= 0x90 && r <= 0xb8)) {
        problems.push(`${name}: color ${hex} not in brand/neutral whitelist`)
      }
    }
  }
}

if (!hasImage) problems.push('no embedded image found (expected logo)')
if (!sawBrandRed) problems.push(`brand red ${BRAND_RED} not found in slide colors`)

const media = Object.keys(zip.files).filter((n) => n.startsWith('ppt/media/'))
if (!media.length) problems.push('ppt/media/ empty — logo missing')

if (problems.length) {
  console.error(`check-deck: FAIL — ${problems.length} issue(s) in ${path.basename(abs)}`)
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log(
  `check-deck: OK — ${slideFiles.length} slides (≤45), 16:9, logo media×${media.length}, brand.red #${COLOR.brand}, body/muted/card tokens, no Wingdings/YaHei/UI-primary/placeholders${sawBannedGray ? '' : ', no #999-on-card'}`,
)
