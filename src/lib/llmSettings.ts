/** LLM 配置仅存本机 localStorage，勿提交仓库；可选用 VITE_ 环境变量预填 */

export type LlmSettings = {
  baseUrl: string
  model: string
  apiKey: string
}

export const LLM_STORAGE_KEY = 'sugon-skillui-llm-settings'

/**
 * 公开构建不内置任何网关地址：Base URL 默认留空，由使用者在设置里填写自己的
 * OpenAI 兼容端点（浏览器直连，需端点允许 CORS）。
 * 内部构建可在 .env.local（已 gitignore）设置 VITE_LLM_BASE_URL 预填，
 * 并由 Vite dev/preview 的同源 /api/llm 代理转发（见 vite.config.ts）。
 */
export const LLM_BASE_URL_PLACEHOLDER = 'https://api.example.com'
/** 模型名默认留空（按所填端点实际开通的模型填写）；内部构建可用 VITE_LLM_MODEL 预填 */
export const LLM_MODEL_PLACEHOLDER = '按你的端点填写，例如 gpt-4o-mini'

export const DEFAULT_LLM_SETTINGS: LlmSettings = {
  baseUrl: '',
  model: '',
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

/** 内部开发代理目标（仅在设置了 VITE_SUGON_LLM_PROXY_TARGET / VITE_LLM_BASE_URL 时非空） */
export function llmProxyBase(): string {
  return (
    readEnvString('VITE_SUGON_LLM_PROXY_TARGET') ||
    readEnvString('VITE_LLM_BASE_URL')
  ).replace(/\/$/, '')
}

function hostOf(raw: string): string | null {
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).host.toLowerCase()
  } catch {
    return null
  }
}

/** 当前环境下的默认配置（公开构建：全空；内部构建：.env.local 的 VITE_* 预填） */
export function defaultLlmSettings(): LlmSettings {
  return mergeDefaults()
}

function mergeDefaults(): LlmSettings {
  const seed = envSeed()
  return {
    baseUrl: seed.baseUrl || DEFAULT_LLM_SETTINGS.baseUrl,
    model: seed.model || DEFAULT_LLM_SETTINGS.model,
    apiKey: seed.apiKey || '',
  }
}


/** 内部网关历史上预设过但未开通的模型名；仅对内部代理目标迁移到当前默认（公开端点保留用户填写） */
const LEGACY_DEFAULT_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'])

function normalizeModelName(model: string, fallback: string, baseUrl: string): string {
  const m = model.trim()
  if (!m) return fallback
  if (LEGACY_DEFAULT_MODELS.has(m) && fallback && shouldUseLlmProxy(baseUrl)) return fallback
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
    const baseUrl =
      typeof o.baseUrl === 'string' && o.baseUrl.trim()
        ? o.baseUrl.trim().replace(/\/$/, '')
        : defaults.baseUrl
    return {
      baseUrl,
      model: normalizeModelName(
        typeof o.model === 'string' ? o.model : '',
        defaults.model,
        baseUrl,
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

/**
 * 是否走同源 /api/llm 代理：仅当构建/开发环境配置了代理目标（内部开发），
 * 且 Base URL 为空或与代理目标同主机时。公开构建没有代理目标 → 一律浏览器直连。
 */
export function shouldUseLlmProxy(baseUrl: string): boolean {
  const proxyBase = llmProxyBase()
  if (!proxyBase) return false
  const raw = (baseUrl || '').trim().replace(/\/$/, '')
  if (!raw) return true
  const a = hostOf(raw)
  return !!a && a === hostOf(proxyBase)
}
