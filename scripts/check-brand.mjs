#!/usr/bin/env node
/**
 * Brand asset guards:
 * - SVG logo colors ⊆ whitelist from tokens/sugon.brand.json
 * - logo file exists and sha256 matches registry in brand.json (optional hash field)
 * - skill asset copies match brand-assets/logo/sugon-cloud-logo.svg
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const brand = JSON.parse(fs.readFileSync(path.join(root, 'tokens/sugon.brand.json'), 'utf8'))
const logoSrc = path.join(root, 'brand-assets/logo/sugon-cloud-logo.svg')
const problems = []

if (!fs.existsSync(logoSrc)) problems.push('missing brand-assets/logo/sugon-cloud-logo.svg')
else {
  const svg = fs.readFileSync(logoSrc, 'utf8')
  const allowed = new Set(brand.logo.colorsAllowed.map((c) => c.toUpperCase()))
  const found = [...svg.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map((m) => `#${m[1].toUpperCase()}`)
  for (const c of new Set(found)) {
    if (!allowed.has(c)) problems.push(`logo SVG color ${c} not in whitelist`)
  }
  const hash = crypto.createHash('sha256').update(fs.readFileSync(logoSrc)).digest('hex')
  const expected = brand.logo.sha256
  if (expected && expected !== hash) problems.push(`logo sha256 drift: got ${hash}, expected ${expected}`)
  else if (!expected) {
    // write hint only in verbose — CI just records
    console.log(`check-brand: logo sha256 ${hash} (record in brand.json logo.sha256 to pin)`)
  }
  const copies = [
    'skills/sugon-brand-core/assets/logo/sugon-cloud-logo.svg',
    'skills/sugon-logo-usage/assets/logo/sugon-cloud-logo.svg',
  ]
  const srcBuf = fs.readFileSync(logoSrc)
  for (const rel of copies) {
    const p = path.join(root, rel)
    if (!fs.existsSync(p)) problems.push(`missing skill copy ${rel} — run npm run build:kit`)
    else if (!fs.readFileSync(p).equals(srcBuf)) problems.push(`skill copy drifted: ${rel}`)
  }
}

// Two reds must stay distinct
if (brand.color.brand.red.$value.toUpperCase() === brand.uiVsBrand.uiPrimary.toUpperCase()) {
  problems.push('brand.red must not equal ui primary')
}

if (problems.length) {
  console.error(`check-brand: FAIL — ${problems.length} issue(s)`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log('check-brand: OK')
