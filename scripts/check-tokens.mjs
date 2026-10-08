#!/usr/bin/env node
/**
 * Drift guard: skills/sugon-brand-kit/DESIGN.md must quote the same values as tokens.css
 * (tokens.css is the single source of truth).
 *
 *   node scripts/check-tokens.mjs [skillDir]
 *
 * Checks
 *  - every table row  | `--name` | `value` |  in DESIGN.md
 *  - every inline     `--name` value   (e.g. `--text-xs` 0.75rem) in DESIGN.md
 *  - the font family order quoted in DESIGN.md matches --font-sans
 *  - every --color-* defined in tokens.css appears in DESIGN.md
 */
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve(process.argv[2] || 'skills/sugon-brand-kit')
const css = fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8')
const md = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8')

const vars = new Map()
for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  vars.set(m[1], m[2].replace(/\s+/g, ' ').trim())
}
const norm = (v) => v.trim().toLowerCase()
const problems = []
let checked = 0

const compare = (name, quoted, where) => {
  checked++
  if (!vars.has(name)) return problems.push(`${where}: ${name} is not defined in tokens.css`)
  if (norm(vars.get(name)) !== norm(quoted)) {
    problems.push(`${where}: ${name} = ${quoted} in DESIGN.md but ${vars.get(name)} in tokens.css`)
  }
}

for (const m of md.matchAll(/^\|\s*`(--[a-z0-9-]+)`\s*\|\s*`([^`]+)`\s*\|/gim)) compare(m[1], m[2], 'table')
for (const m of md.matchAll(/`(--[a-z0-9-]+)`\s+(-?[0-9.]+(?:rem|px|em)?)(?=\s|$|[,，、·）)])/gim)) compare(m[1], m[2], 'inline')

// font order: families quoted in the 家族 line vs --font-sans
const fam = (s) => [...s.matchAll(/"([^"]+)"/g)].map((m) => m[1])
const fontLine = md.split('\n').find((l) => l.includes('`--font-sans`')) || ''
const mdFonts = fam(fontLine)
const cssFonts = fam(vars.get('--font-sans') || '')
checked++
if (!mdFonts.length || mdFonts.some((f, i) => cssFonts[i] !== f)) {
  problems.push(`font: DESIGN.md order [${mdFonts.join(', ')}] != tokens.css --font-sans [${cssFonts.join(', ')}]`)
}

for (const name of vars.keys()) {
  if (name.startsWith('--color-') && !md.includes(`\`${name}\``)) problems.push(`missing: ${name} not documented in DESIGN.md`)
}

const snippets = path.join(dir, 'components.css')
if (fs.existsSync(snippets)) {
  const scss = fs.readFileSync(snippets, 'utf8')
  const body = scss.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of body.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) problems.push(`components.css: hardcoded color ${m[0]}`)
  const used = new Set([...body.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]))
  for (const name of used) {
    checked++
    if (!vars.has(name)) problems.push(`components.css: ${name} is not defined in tokens.css`)
  }
  for (const cls of ['sugon-btn-primary', 'sugon-btn-secondary', 'sugon-btn-ghost', 'sugon-card', 'sugon-field', 'sugon-label', 'sugon-input', 'sugon-select', 'sugon-check', 'sugon-help', 'sugon-error']) {
    if (!scss.includes('.' + cls)) problems.push(`components.css: missing class .${cls}`)
  }
}

if (problems.length) {
  console.error(`check-tokens: FAIL — ${problems.length} drift issue(s) between DESIGN.md, tokens.css and components.css`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`check-tokens: OK — ${checked} values match tokens.css; components.css uses only those variables (${path.relative(process.cwd(), dir)})`)
