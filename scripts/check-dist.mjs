#!/usr/bin/env node
/**
 * Release guard: fail if the built site (dist/) contains anything that looks like a secret
 * or the internal LLM gateway. Run after `npm run build` (CI does this before deploying Pages).
 *
 *   node scripts/check-dist.mjs [distDir]
 *
 * Matches are printed redacted (first 4 chars + length) so CI logs never echo a secret.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve(process.argv[2] || 'dist')
if (!fs.existsSync(dist)) {
  console.error(`check-dist: ${dist} not found — run npm run build first`)
  process.exit(2)
}

const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.json', '.md', '.txt', '.svg', '.map', '.xml', '.webmanifest'])

/** [label, regex] — keep these specific enough not to hit normal UI copy like placeholder="sk-..." */
const RULES = [
  ['openai-style key (sk-…)', /\bsk-[A-Za-z0-9_-]{16,}/g],
  ['Bearer token', /Bearer\s+[A-Za-z0-9._~+/-]{16,}=*/g],
  ['non-empty VITE_*KEY/SECRET/TOKEN in bundle', /["'`]?VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN)[A-Z0-9_]*["'`]?\s*[:=]\s*["'`][^"'`]{4,}["'`]/g],
  ['internal gateway port :8765', /:8765\b/g],
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
]

// Internal hosts are listed by SHA-256 of the registrable domain so the public repo does not spell
// them out. Every host-like token in dist (and each of its parent domains) is hashed and compared.
// Add more: node -e "console.log(require('crypto').createHash('sha256').update('example.com').digest('hex'))"
const DENY_HOST_SHA256 = new Set([
  '22593569bdbb383736f5588560daad344f7bf66b0591e5b0c8a1d16d35fd5c0e', // internal LLM gateway domain
])
// Optional extra plain-text deny patterns (comma-separated), e.g. from a CI variable.
const EXTRA_DENY = (process.env.CHECK_DIST_DENY || '').split(',').map((s) => s.trim()).filter(Boolean)
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')
const HOST_RE = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi

// Any VITE_*KEY/SECRET/TOKEN value present in the build environment must not appear in dist.
const envSecrets = Object.entries(process.env)
  .filter(([k, v]) => /^VITE_.*(KEY|SECRET|TOKEN)/.test(k) && v && v.trim().length >= 6)
  .map(([k, v]) => [k, v.trim()])

const redact = (s) => `${s.slice(0, 4)}…(len ${s.length})`

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

const findings = []
let scanned = 0
for (const file of walk(dist)) {
  if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue
  scanned++
  const text = fs.readFileSync(file, 'utf8')
  const rel = path.relative(dist, file)
  const lineOf = (idx) => text.slice(0, idx).split('\n').length
  for (const [label, re] of RULES) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) findings.push({ rel, line: lineOf(m.index), label, sample: redact(m[0]) })
  }
  HOST_RE.lastIndex = 0
  let hm
  while ((hm = HOST_RE.exec(text))) {
    const labels = hm[0].toLowerCase().split('.')
    for (let i = 0; i < labels.length - 1; i++) {
      if (DENY_HOST_SHA256.has(sha(labels.slice(i).join('.')))) {
        findings.push({ rel, line: lineOf(hm.index), label: 'internal host (denylisted domain)', sample: redact(hm[0]) })
        break
      }
    }
  }
  for (const pat of EXTRA_DENY) {
    let idx = text.toLowerCase().indexOf(pat.toLowerCase())
    while (idx !== -1) {
      findings.push({ rel, line: lineOf(idx), label: 'CHECK_DIST_DENY pattern', sample: redact(pat) })
      idx = text.toLowerCase().indexOf(pat.toLowerCase(), idx + 1)
    }
  }
  for (const [k, v] of envSecrets) {
    let idx = text.indexOf(v)
    while (idx !== -1) {
      findings.push({ rel, line: lineOf(idx), label: `value of env ${k}`, sample: redact(v) })
      idx = text.indexOf(v, idx + 1)
    }
  }
}

if (findings.length) {
  console.error(`check-dist: FAIL — ${findings.length} finding(s) in ${dist}`)
  for (const f of findings) console.error(`  ${f.rel}:${f.line}  ${f.label}  ${f.sample}`)
  console.error('Build without VITE_*KEY / internal VITE_LLM_BASE_URL env vars (e.g. no .env.local) and retry.')
  process.exit(1)
}
console.log(`check-dist: OK — ${scanned} text files scanned in ${path.relative(process.cwd(), dist) || dist}, no key-like strings or internal host`)
