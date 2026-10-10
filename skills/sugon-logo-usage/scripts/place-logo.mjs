#!/usr/bin/env node
/**
 * Place Sugon logo on a canvas with draft clear-space & min-size rules.
 *   node place-logo.mjs --width 1920 --height 1080 --corner top-right [--format svg|html] [--logo-width 180]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillRoot = path.resolve(__dirname, '..')
const brandPath = path.resolve(skillRoot, '../../tokens/sugon.brand.json')
const logoRel = 'assets/logo/sugon-cloud-logo.svg'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const width = Number(arg('width', '1920'))
const height = Number(arg('height', '1080'))
const corner = arg('corner', 'top-right')
const format = arg('format', 'svg')
const brand = JSON.parse(fs.readFileSync(brandPath, 'utf8'))
const minW = brand.logo.minSize.screenPxWidth.value
const clearRatio = 0.3 // draft: 0.3 × logo height
const aspect = brand.logo.aspectRatio

let logoW = Number(arg('logo-width', String(Math.max(minW, Math.round(width * 0.12)))))
if (logoW < minW) {
  console.error(`place-logo: logo-width ${logoW} < minimum ${minW}px (待确认草案)`)
  process.exit(1)
}
const logoH = logoW / aspect
const pad = logoH * clearRatio

const positions = {
  'top-left': [pad, pad],
  'top-right': [width - pad - logoW, pad],
  'bottom-left': [pad, height - pad - logoH],
  'bottom-right': [width - pad - logoW, height - pad - logoH],
  center: [(width - logoW) / 2, (height - logoH) / 2],
}
if (!positions[corner]) {
  console.error(`place-logo: unknown corner ${corner}`)
  process.exit(1)
}
const [x, y] = positions[corner]

if (format === 'html') {
  console.log(`<!-- sugon-logo-usage place-logo: ${corner}, ${logoW}×${logoH.toFixed(1)}, clear≈${pad.toFixed(1)} -->`)
  console.log(`<img src="${logoRel}" alt="曙光云 Sugon" width="${Math.round(logoW)}" height="${Math.round(logoH)}" style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;" />`)
} else {
  console.log(`<!-- sugon-logo-usage place-logo: ${corner}, clear-space draft -->`)
  console.log(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`)
  console.log(`  <image href="${logoRel}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${logoW}" height="${logoH.toFixed(1)}" />`)
  console.log(`</svg>`)
}
