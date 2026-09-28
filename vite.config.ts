import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const DEFAULT_LLM_TARGET = 'https://t.mysugoncloud.com:8765'
const FETCH_URL_MAX_CHARS = 12000

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const raw = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(raw)
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function handleFetchUrl(req: IncomingMessage, res: ServerResponse) {
  try {
    let target = ''
    if (req.method === 'GET' || req.method === 'HEAD') {
      const u = new URL(req.url || '/', 'http://localhost')
      target = (u.searchParams.get('url') || '').trim()
    } else if (req.method === 'POST') {
      const raw = await readRequestBody(req)
      try {
        const j = JSON.parse(raw) as { url?: string }
        target = typeof j.url === 'string' ? j.url.trim() : ''
      } catch {
        const u = new URL(req.url || '/', 'http://localhost')
        target = (u.searchParams.get('url') || '').trim()
      }
    } else {
      sendJson(res, 405, { error: '仅支持 GET/POST' })
      return
    }

    if (!/^https?:\/\//i.test(target)) {
      sendJson(res, 400, { error: '链接须以 http:// 或 https:// 开头。' })
      return
    }

    const upstream = await fetch(target, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'SugonSkillUI-LinkProxy/1.0',
        Accept: 'text/html,text/plain,application/json;q=0.9,*/*;q=0.8',
      },
    })
    if (!upstream.ok) {
      sendJson(res, 502, { error: `上游 HTTP ${upstream.status}` })
      return
    }
    const ct = upstream.headers.get('content-type') || ''
    const rawText = await upstream.text()
    let text = rawText
    if (/html/i.test(ct) || rawText.trimStart().startsWith('<')) {
      text = stripHtml(rawText)
    }
    text = text.slice(0, FETCH_URL_MAX_CHARS)
    sendJson(res, 200, {
      text,
      contentType: ct,
      truncated: rawText.length > FETCH_URL_MAX_CHARS,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    sendJson(res, 502, { error: `代理抓取失败：${msg}` })
  }
}

function fetchUrlMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const pathOnly = (req.url || '').split('?')[0]
    if (pathOnly !== '/api/fetch-url') {
      next()
      return
    }
    void handleFetchUrl(req, res)
  }
}

function sugonDevProxyPlugin(): Plugin {
  return {
    name: 'sugon-dev-proxy',
    configureServer(server) {
      server.middlewares.use(fetchUrlMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(fetchUrlMiddleware())
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const llmTarget = (
    env.VITE_SUGON_LLM_PROXY_TARGET ||
    env.VITE_LLM_BASE_URL ||
    DEFAULT_LLM_TARGET
  ).replace(/\/$/, '')

  // Browser → same-origin /api/llm/* → strip prefix → llmTarget/v1/...
  // secure:false：自签/证书异常时 Node 代理仍可连；changeOrigin 避免 Host 校验失败
  // server + preview 都挂同一份代理，避免只配 configureServer 时 preview/生产式预览 Failed to fetch
  const llmProxy = {
    '/api/llm': {
      target: llmTarget,
      changeOrigin: true,
      secure: false,
      ws: true,
      rewrite: (p: string) => p.replace(/^\/api\/llm/, '') || '/',
    },
  }

  return {
    plugins: [react(), tailwindcss(), sugonDevProxyPlugin()],
    server: { proxy: llmProxy },
    preview: { proxy: llmProxy },
  }
})
