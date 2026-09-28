import {
  shouldUseLlmProxy,
  type LlmSettings,
} from './llmSettings'
import type { Skill } from './skills'

export type ChatRole = 'system' | 'user' | 'assistant'

export type TextContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export type ApiMessage = {
  role: ChatRole
  content: string | TextContentPart[]
}

export type SkillDraft = {
  name: string
  purpose: string
  path: string
  content?: string
  id?: string
}

const SYSTEM_PROMPT = `你是「曙光云 SkillUI 库」的供给层助手，也是用户管理 Skill 的唯一对话入口。职责：
1. 从用户消息理解意图并路由：链接学习、起草 Skill、看库、选用（复制 path）、确认后归库、对外导出。
2. 若用户要用结构化字段录入，通过对话逐项询问（名称、用途、供给层 path、说明），不要假设有单独表单。
3. 仅做风格供给层（tokens / DESIGN / SKILL），绝不引入质量层（Taste / Impeccable / Hallmark 等）。
4. 主色建议保持 #C8161D，辅以灰/白。
5. 当用户要求「归库」或你建议入库时，在回复末尾输出且仅输出一个 JSON 代码块，格式：
\`\`\`json
{"action":"guiku","name":"...","purpose":"...","path":"design-skills/xxx/","content":"..."}
\`\`\`
path 必须以 design-skills/ 开头。不要假装已写入；真正写入由用户在界面确认。
6. 「看库」时按用户消息里附带的本机库快照列出名称/用途/path；「选用某某」时给出对应 path 并提示可 @import tokens.css。
7. 「对外输出 / 导出」时给出可复制的 SKILL 包文本摘要与路径。
用简体中文回复，简洁可操作。`

export function buildSystemMessage(): ApiMessage {
  return { role: 'system', content: SYSTEM_PROMPT }
}

/** 规范化 chat/completions 最终 URL；默认云主机走同源代理避免浏览器 CORS */
export function resolveChatCompletionsUrl(baseUrl: string): {
  url: string
  usedProxy: boolean
} {
  const raw = (baseUrl || '').trim()
  if (raw && !/^https?:\/\//i.test(raw) && !raw.startsWith('/')) {
    throw new Error(
      `Base URL 格式无效：「${raw}」。请使用 https://主机[:端口] 或留空以使用默认云网关。`,
    )
  }

  if (shouldUseLlmProxy(raw)) {
    // 开发/预览：Vite 将 /api/llm → 云网关，浏览器同源无 CORS
    return { url: '/api/llm/v1/chat/completions', usedProxy: true }
  }

  let base = raw.replace(/\/$/, '')
  // 已含 /v1 或完整 chat/completions 时不重复拼接
  if (/\/chat\/completions\/?$/i.test(base)) {
    return { url: base.replace(/\/$/, ''), usedProxy: false }
  }
  if (/\/v1$/i.test(base)) {
    return { url: `${base}/chat/completions`, usedProxy: false }
  }
  return { url: `${base}/v1/chat/completions`, usedProxy: false }
}

async function postChatCompletions(
  url: string,
  settings: LlmSettings,
  messages: ApiMessage[],
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.4,
    }),
  })
}

function directCompletionsUrl(baseUrl: string): string {
  const raw = (baseUrl || '').trim().replace(/\/$/, '') || 'https://t.mysugoncloud.com:8765'
  if (/\/chat\/completions\/?$/i.test(raw)) return raw.replace(/\/$/, '')
  if (/\/v1$/i.test(raw)) return `${raw}/chat/completions`
  return `${raw}/v1/chat/completions`
}


/** 判断 404/405 是否表示「没有 Vite /api/llm 代理」（静态 HTML），而非上游业务错误 JSON */
function looksLikeMissingLlmProxy(res: Response, bodyText: string): boolean {
  if (res.status !== 404 && res.status !== 405) return false
  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('application/json')) return false
  const trimmed = bodyText.trimStart()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(bodyText)
      return false
    } catch {
      /* fall through */
    }
  }
  if (ct.includes('text/html') || trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
    return true
  }
  // 空 body / 纯文本 404：更像静态缺失路由
  return trimmed.length < 80 || /cannot get|not found|nginx/i.test(trimmed)
}

export async function chatCompletion(
  settings: LlmSettings,
  messages: ApiMessage[],
): Promise<string> {
  if (!settings.apiKey.trim()) {
    throw new Error(
      '尚未配置 API Key。请先在设置中填写，密钥仅保存在本机 localStorage。未配置前不会发起模型请求。',
    )
  }

  let resolved: { url: string; usedProxy: boolean }
  try {
    resolved = resolveChatCompletionsUrl(settings.baseUrl)
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e))
  }

  let res: Response | null = null
  let rawText = ''
  let finalUrl = resolved.url

  try {
    res = await postChatCompletions(resolved.url, settings, messages)
    rawText = await res.text()
  } catch (e) {
    const proxyNetErr = e instanceof Error ? e.message : String(e)
    if (!resolved.usedProxy) {
      throw new Error(
        `模型请求失败（网络/CORS）：${proxyNetErr}。自定义 Base URL 须由网关允许跨域，或改回默认云主机并在开发模式走 /api/llm 代理。`,
      )
    }
    // 代理层网络失败（未跑 vite / 端口错 / 连接被重置）→ 再试直连，并区分 CORS 与网关不可达
    try {
      finalUrl = directCompletionsUrl(settings.baseUrl)
      res = await postChatCompletions(finalUrl, settings, messages)
      rawText = await res.text()
      resolved = { url: finalUrl, usedProxy: false }
    } catch (e2) {
      const directErr = e2 instanceof Error ? e2.message : String(e2)
      throw new Error(
        `模型请求失败：同源 /api/llm 代理不可用（${proxyNetErr}）。直连网关亦失败（${directErr}）。请用 npm run dev 或 npm run preview（勿直接打开 dist/file://）；若已在开发服仍失败，则是浏览器 CORS（网关未返回 Access-Control-Allow-Origin）或网关不可达。`,
      )
    }
  }

  if (!res) {
    throw new Error('模型请求无响应。')
  }

  // 仅当响应像「静态站没有 /api/llm 路由」时才回落直连。
  // 切勿把上游业务 404（如 model_not_found JSON）当成代理缺失——否则会直连触发 CORS，误报 Failed to fetch。
  if (resolved.usedProxy && looksLikeMissingLlmProxy(res, rawText)) {
    try {
      finalUrl = directCompletionsUrl(settings.baseUrl)
      res = await postChatCompletions(finalUrl, settings, messages)
      rawText = await res.text()
      resolved = { url: finalUrl, usedProxy: false }
    } catch (e2) {
      const directErr = e2 instanceof Error ? e2.message : String(e2)
      throw new Error(
        `模型请求失败：当前页面没有可用的 /api/llm 代理（收到静态 404/HTML），且直连网关失败（${directErr}，多为 CORS）。请用 npm run dev / preview。`,
      )
    }
  }

  if (!res.ok) {
    let detail = rawText.slice(0, 400)
    let code = ''
    try {
      const j = JSON.parse(rawText) as {
        error?: { message?: string; type?: string; code?: string }
        code?: string
        message?: string
      }
      if (j.error?.message) detail = j.error.message
      else if (typeof j.message === 'string') detail = j.message
      code = j.error?.type || j.error?.code || j.code || ''
    } catch {
      /* keep detail */
    }
    if (res.status === 401 || code === 'API_KEY_REQUIRED' || code === 'INVALID_API_KEY') {
      throw new Error(
        `API Key 无效或未提供（HTTP ${res.status}）：${detail}。请在设置中检查密钥（仅存本机 localStorage / .env.local）。`,
      )
    }
    if (res.status === 404 && /model/i.test(detail + code)) {
      throw new Error(
        `模型不可用（HTTP ${res.status}）：${detail}。请在设置中改用网关已开通的模型（例如 deepseek-flash、glm-5.3-flash）。`,
      )
    }
    throw new Error(`API ${res.status}：${detail}`)
  }
  let data: {
    choices?: Array<{ message?: { content?: string | null } }>
  }
  try {
    data = JSON.parse(rawText) as typeof data
  } catch {
    throw new Error('API 返回非 JSON，无法解析。')
  }
  const content = data.choices?.[0]?.message?.content
  if (!content || !String(content).trim()) {
    throw new Error(
      '模型返回为空。请检查模型是否支持当前请求（含图片时需 vision 模型）。',
    )
  }
  return String(content).trim()
}

export type FetchLinkResult = {
  text: string
  via: 'proxy' | 'direct'
}

/**
 * 优先同源 /api/fetch-url（dev/preview 中间件服务端抓取），再直连；
 * 均失败时抛出可读中文错误（粘贴正文为降级，不阻断后续 URL 推断）。
 */
export async function fetchLinkText(url: string): Promise<FetchLinkResult> {
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('链接须以 http:// 或 https:// 开头。')
  }

  // 1) 同源代理（Vite configureServer / preview）
  try {
    const proxyUrl = `/api/fetch-url?url=${encodeURIComponent(trimmed)}`
    const res = await fetch(proxyUrl, { method: 'GET' })
    const raw = await res.text()
    let parsed: { text?: string; error?: string } = {}
    try {
      parsed = JSON.parse(raw) as typeof parsed
    } catch {
      parsed = {}
    }
    if (res.ok && typeof parsed.text === 'string' && parsed.text.trim()) {
      return { text: parsed.text.slice(0, 12000), via: 'proxy' }
    }
    // 404/非 JSON：多半是生产静态托管无中间件 → 继续直连
    if (res.status !== 404 && parsed.error) {
      // 代理存在但抓取失败：仍尝试直连一次
    }
  } catch {
    /* proxy unavailable → direct */
  }

  // 2) 浏览器直连（常因 CORS 失败）
  try {
    const res = await fetch(trimmed, { method: 'GET', mode: 'cors' })
    if (!res.ok) {
      throw new Error(`抓取失败 HTTP ${res.status}`)
    }
    const ct = res.headers.get('content-type') || ''
    const text = await res.text()
    const body =
      /html/i.test(ct) || text.trimStart().startsWith('<')
        ? stripHtml(text)
        : text
    return { text: body.slice(0, 12000), via: 'direct' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(
      `无法抓取链接正文：${msg}。开发请用 npm run dev（同源 /api/fetch-url）；生产可粘贴页面正文作为降级，或仅基于 URL 做有限推断。`,
    )
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 从助手回复中解析归库草稿 */
export function parseGuikuDraft(assistantText: string): SkillDraft | null {
  const fence = assistantText.match(/```json\s*([\s\S]*?)```/i)
  const raw =
    fence?.[1]?.trim() ??
    (() => {
      const m = assistantText.match(/\{[\s\S]*"action"\s*:\s*"guiku"[\s\S]*\}/)
      return m?.[0]
    })()
  if (!raw) return null
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    if (obj.action !== 'guiku') return null
    const name = typeof obj.name === 'string' ? obj.name.trim() : ''
    const purpose = typeof obj.purpose === 'string' ? obj.purpose.trim() : ''
    const path = typeof obj.path === 'string' ? obj.path.trim() : ''
    if (!name || !purpose) return null
    return {
      name,
      purpose,
      path: path || 'design-skills/',
      content: typeof obj.content === 'string' ? obj.content : undefined,
      id: typeof obj.id === 'string' ? obj.id : undefined,
    }
  } catch {
    return null
  }
}

export function draftToExportText(draft: SkillDraft | Skill): string {
  const path = 'path' in draft ? draft.path : ''
  const lines = [
    `# ${draft.name}`,
    '',
    `用途：${draft.purpose}`,
    `路径：${path}`,
    '',
    draft.content?.trim() || '（无额外说明）',
    '',
    '---',
    '供给层 Skill 包 · 曙光云 SkillUI 库 · 主色 #C8161D',
  ]
  return lines.join('\n')
}

export function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s<>"')\]]+/gi
  return text.match(re) ?? []
}
