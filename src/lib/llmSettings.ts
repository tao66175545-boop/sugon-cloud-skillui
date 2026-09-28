/** LLM 配置仅存本机 localStorage，勿提交仓库；可选用 VITE_ 环境变量预填 */

export type LlmSettings = {
  baseUrl: string
  model: string
  apiKey: string
}

export const LLM_STORAGE_KEY = 'sugon-skillui-llm-settings'

/** 默认云网关主机（不含路径）；OpenAI 兼容 /v1/chat/completions */
export const DEFAULT_LLM_HOST = 't.mysugoncloud.com:8765'

/** 默认 Base（不含 /v1）；有 Key 后在浏览器走同源 /api/llm 代理 */
export const DEFAULT_LLM_SETTINGS: LlmSettings = {
  baseUrl: `https://${DEFAULT_LLM_HOST}`,
  model: 'deepseek-flash',
  apiKey: '',
}

function readEnvString(key: string): string {
  try {
    const env = import.meta.env as Record<string, unknown>
    const v = env[key]
    return typeof v === 'string' ? v.trim() : ''
  } catch {
    return ''
  }
}

/** 从 Vite 注入的 VITE_* 读取预填（.env.local）；勿打印密钥到日志 */
export function envSeed(): Partial<LlmSettings> {
  const baseUrl =
    readEnvString('VITE_LLM_BASE_URL') ||
    readEnvString('VITE_SUGON_LLM_BASE_URL')
  const apiKey =
    readEnvString('VITE_SUGON_LLM_API_KEY') ||
    readEnvString('VITE_LLM_API_KEY')
  const model = readEnvString('VITE_LLM_MODEL')
  const out: Partial<LlmSettings> = {}
  if (baseUrl) out.baseUrl = baseUrl.replace(/\/$/, '')
  if (apiKey) out.apiKey = apiKey
  if (model) out.model = model
  return out
}

function mergeDefaults(): LlmSettings {
  const seed = envSeed()
  return {
    baseUrl: seed.baseUrl || DEFAULT_LLM_SETTINGS.baseUrl,
    model: seed.model || DEFAULT_LLM_SETTINGS.model,
    apiKey: seed.apiKey || '',
  }
}


/** 本网关历史上预设过但未开通的模型名；加载时迁移到当前默认 */
const LEGACY_DEFAULT_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'])

function normalizeModelName(model: string, fallback: string): string {
  const m = model.trim()
  if (!m) return fallback
  if (LEGACY_DEFAULT_MODELS.has(m)) return fallback
  return m
}

export function loadLlmSettings(): LlmSettings {
  const defaults = mergeDefaults()
  try {
    const raw = localStorage.getItem(LLM_STORAGE_KEY)
    if (!raw) return { ...defaults }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ...defaults }
    const o = parsed as Record<string, unknown>
    const storedKey = typeof o.apiKey === 'string' ? o.apiKey : ''
    return {
      baseUrl:
        typeof o.baseUrl === 'string' && o.baseUrl.trim()
          ? o.baseUrl.trim().replace(/\/$/, '')
          : defaults.baseUrl,
      model: normalizeModelName(
        typeof o.model === 'string' ? o.model : '',
        defaults.model,
      ),
      // localStorage 优先；为空时回落 env 预填（本地开发通常靠此预置 key）
      apiKey: storedKey.trim() || defaults.apiKey,
    }
  } catch {
    return { ...defaults }
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  const defaults = mergeDefaults()
  const next: LlmSettings = {
    baseUrl: settings.baseUrl.trim().replace(/\/$/, '') || defaults.baseUrl,
    model: settings.model.trim() || defaults.model,
    apiKey: settings.apiKey.trim(),
  }
  localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(next))
}

export function hasApiKey(settings: LlmSettings = loadLlmSettings()): boolean {
  return settings.apiKey.trim().length > 0
}

/** 判断是否应走同源 /api/llm（默认云主机或空） */
export function shouldUseLlmProxy(baseUrl: string): boolean {
  const raw = (baseUrl || '').trim().replace(/\/$/, '')
  if (!raw) return true
  try {
    const u = new URL(raw.includes('://') ? raw : `https://${raw}`)
    const hostPort = u.port ? `${u.hostname}:${u.port}` : u.hostname
    if (hostPort === DEFAULT_LLM_HOST || u.host === DEFAULT_LLM_HOST) return true
    if (raw === DEFAULT_LLM_SETTINGS.baseUrl) return true
  } catch {
    /* fall through */
  }
  return /mysugoncloud\.com:8765/i.test(raw)
}
