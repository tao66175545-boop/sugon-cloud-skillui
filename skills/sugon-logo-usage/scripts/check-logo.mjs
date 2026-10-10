#!/usr/bin/env node
/**
 * Fail if a file recolors brand red #AF1F24 to something outside the whitelist
 * (especially UI primary #C8161D), or introduces non-whitelist logo colors.
 *   node check-logo.mjs <file> [file...]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const brandPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../tokens/sugon.brand.json')
const brand = JSON.parse(fs.readFileSync(brandPath, 'utf8'))
const allowed = new Set(brand.logo.colorsAllowed.map((c) => c.toUpperCase()))
const brandRed = brand.color.brand.red.$value.toUpperCase()
const uiPrimary = brand.uiVsBrand.uiPrimary.toUpperCase()

const files = process.argv.slice(2)
if (!files.length) {
  console.error('usage: node check-logo.mjs <file>...')
  process.exit(2)
}

let failed = 0
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const hexes = [...text.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map((m) => `#${m[1].toUpperCase()}`)
  const unique = [...new Set(hexes)]
  const problems = []
  if (unique.includes(uiPrimary) && unique.includes(brandRed)) {
    problems.push(`contains both brand red ${brandRed} and UI primary ${uiPrimary} — logo must not be recolored to UI red`)
  }
  if (unique.includes(uiPrimary) && !unique.includes(brandRed) && /logo|sugon|曙光/i.test(text)) {
    problems.push(`looks logo-related but uses UI primary ${uiPrimary} without brand red ${brandRed}`)
  }
  for (const c of unique) {
    // only flag colors near logo contexts or in SVG fills when file is svg
    if (file.endsWith('.svg') && !allowed.has(c)) {
      problems.push(`SVG color ${c} not in logo whitelist ${[...allowed].join(', ')}`)
    }
  }
  if (problems.length) {
    failed++
    console.error(`check-logo FAIL ${file}`)
    for (const p of problems) console.error('  - ' + p)
  } else {
    console.log(`check-logo OK ${file} (colors: ${unique.join(', ') || 'none'})`)
  }
}
process.exit(failed ? 1 : 0)
