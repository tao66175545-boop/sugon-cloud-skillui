/** 曙光云 SkillUI 库 — Skill 持久化（localStorage） */

export type Skill = {
  id: string
  name: string
  purpose: string
  path: string
  content?: string
  createdAt: string
}

export const STORAGE_KEY = 'sugon-skillui-skills'

/** 默认种子：仓库内供给层 brand-kit */
export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'brand-kit',
    name: '品牌工具包 (brand-kit)',
    purpose: '风格供给层：颜色、字体、圆角、间距与按钮三态，供 AI 生成 UI 前读取。',
    path: 'design-skills/brand-kit/',
    content:
      '入口：SKILL.md；规范：DESIGN.md；令牌：tokens.css。主色 #C8161D，灰白中性色。',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function isSkill(value: unknown): value is Skill {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.purpose === 'string' &&
    typeof s.path === 'string' &&
    typeof s.createdAt === 'string'
  )
}

export function loadSkills(): Skill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      saveSkills(DEFAULT_SKILLS)
      return [...DEFAULT_SKILLS]
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveSkills(DEFAULT_SKILLS)
      return [...DEFAULT_SKILLS]
    }
    const skills = parsed.filter(isSkill)
    if (skills.length === 0) {
      saveSkills(DEFAULT_SKILLS)
      return [...DEFAULT_SKILLS]
    }
    return skills
  } catch {
    saveSkills(DEFAULT_SKILLS)
    return [...DEFAULT_SKILLS]
  }
}

export function saveSkills(skills: Skill[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills))
}

export function addSkill(
  input: Omit<Skill, 'id' | 'createdAt'> & { id?: string },
): Skill[] {
  const current = loadSkills()
  const skill: Skill = {
    id:
      input.id ??
      `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    purpose: input.purpose.trim(),
    path: normalizeSupplyPath(input.path),
    content: input.content?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }
  const next = [skill, ...current.filter((s) => s.id !== skill.id)]
  saveSkills(next)
  return next
}

/** 仅暴露供给层路径，禁止质量层关键词路径 */
export function normalizeSupplyPath(path: string): string {
  let p = path.trim().replace(/\\/g, '/')
  if (!p) return 'design-skills/brand-kit/'
  const blocked = /impeccable|hallmark|taste|ui-ux-pro-max|quality-layer/i
  if (blocked.test(p)) {
    return 'design-skills/brand-kit/'
  }
  if (!p.endsWith('/')) p += '/'
  return p
}

export async function copyPath(path: string): Promise<boolean> {
  const text = normalizeSupplyPath(path)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export const LAST_INGEST_KEY = 'sugon-skillui-last-ingest'

export function loadLastIngestName(): string | null {
  try {
    const v = localStorage.getItem(LAST_INGEST_KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

export function saveLastIngestName(name: string): void {
  try {
    localStorage.setItem(LAST_INGEST_KEY, name.trim())
  } catch {
    /* ignore quota / private mode */
  }
}

/** 按 createdAt 取最近一条（用于「最近入库」回显） */
export function mostRecentSkill(skills: Skill[]): Skill | null {
  if (!skills.length) return null
  return [...skills].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0]
}