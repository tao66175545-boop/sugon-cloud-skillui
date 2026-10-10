#!/usr/bin/env node
/**
 * Acceptance: stock Vite → install kit (file-based, same targets as registry) →
 * apply the two documented @imports → assert primary button is rgb(200, 22, 29).
 *
 * Does not require a pushed tag. Uses the local skills/ + components.css.
 *
 *   node scripts/check-fresh-vite.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import http from 'node:http'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tmpRoot = path.join(root, '.tmp-fresh-vite')
const appDir = path.join(tmpRoot, 'demo')

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })
  if (r.status !== 0) {
    console.error(`FAIL: ${cmd} ${args.join(' ')}`)
    console.error(r.stdout)
    console.error(r.stderr)
    process.exit(r.status || 1)
  }
  return r
}

function rimraf(p) {
  fs.rmSync(p, { recursive: true, force: true })
}

async function main() {
  rimraf(tmpRoot)
  fs.mkdirSync(tmpRoot, { recursive: true })

  console.log('check:fresh-vite — create vite react-ts project…')
  run('npm', ['create', 'vite@latest', 'demo', '--', '--template', 'react-ts'], {
    cwd: tmpRoot,
  })
  run('npm', ['install'], { cwd: appDir })

  // File-based install mirroring sugon-brand-kit registry targets for a Vite app
  const stylesDir = path.join(appDir, 'src/styles')
  fs.mkdirSync(stylesDir, { recursive: true })
  fs.copyFileSync(
    path.join(root, 'skills/sugon-brand-kit/tokens.css'),
    path.join(stylesDir, 'sugon-tokens.css'),
  )
  fs.copyFileSync(
    path.join(root, 'skills/sugon-brand-kit/components.css'),
    path.join(stylesDir, 'sugon-components.css'),
  )

  const indexCss = path.join(appDir, 'src/index.css')
  let css = fs.readFileSync(indexCss, 'utf8')
  const imports =
    '@import "./styles/sugon-tokens.css";\n@import "./styles/sugon-components.css";\n'
  if (!css.includes('sugon-tokens.css')) {
    css = imports + css
    fs.writeFileSync(indexCss, css)
  }

  // Minimal page that renders the primary button
  fs.writeFileSync(
    path.join(appDir, 'src/App.tsx'),
    `export default function App() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <button type="button" className="sugon-btn sugon-btn-primary" id="probe">
        主按钮
      </button>
    </main>
  )
}
`,
  )

  console.log('check:fresh-vite — build…')
  run('npm', ['run', 'build'], { cwd: appDir })

  const dist = path.join(appDir, 'dist')
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    if (urlPath === '/') urlPath = '/index.html'
    const file = path.join(dist, urlPath)
    if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404
      res.end('missing')
      return
    }
    const ext = path.extname(file)
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
    }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
    fs.createReadStream(file).pipe(res)
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const url = `http://127.0.0.1:${port}/`

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })
    const bg = await page.$eval('#probe', (el) => getComputedStyle(el).backgroundColor)
    const expected = 'rgb(200, 22, 29)'
    if (bg !== expected) {
      console.error(`check:fresh-vite: FAIL — primary btn background is ${bg}, expected ${expected}`)
      process.exit(1)
    }
    console.log(`check:fresh-vite: OK — primary btn ${bg} after stock Vite + two @imports`)
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
