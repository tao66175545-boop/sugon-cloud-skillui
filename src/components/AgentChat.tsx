import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import {
  addSkill,
  copyPath,
  loadLastIngestName,
  saveLastIngestName,
  mostRecentSkill,
  type Skill,
} from '../lib/skills'
import { StylePreviewCard } from './StylePreviewCard'
import { skillSourceBadge } from '../lib/stylePreview'
import './agentRecent.css'
import {
  hasApiKey,
  loadLlmSettings,
  saveLlmSettings,
  type LlmSettings,
  DEFAULT_LLM_SETTINGS,
} from '../lib/llmSettings'
import {
  buildSystemMessage,
  chatCompletion,
  draftToExportText,
  extractUrls,
  fetchLinkText,
  parseGuikuDraft,
  type ApiMessage,
  type SkillDraft,
  type TextContentPart,
} from '../lib/agentApi'

type UiRole = 'user' | 'assistant' | 'system' | 'error'

type GuikuResultCard = {
  name: string
  purpose: string
  path: string
  skillCount: number
}

type ChatBubble = {
  id: string
  role: UiRole
  text: string
  imagePreview?: string
  linkUrl?: string
  /** 确认归库成功后的对话内结果卡（非 toast） */
  guikuResult?: GuikuResultCard
  /** 对话内风格预览卡（最近入库 / 看库 dig） */
  stylePreviewSkill?: Skill
}

/** 待发送附件：图 / 普通文件 / 文件夹（聚合）三态 */
type PendingAttachment = {
  id: string
  kind: 'image' | 'file' | 'folder'
  name: string
  ext: string
  size: number
  mime: string
  /** 图片 data URL 预览 */
  dataUrl?: string
  /** 文本类文件正文（已截断） */
  textContent?: string
  /** 二进制不可内联说明 */
  binaryNote?: boolean
  /** 文件夹：纳入上下文的文件数 / 跳过数 */
  folderIncluded?: number
  folderSkipped?: number
  folderContext?: string
}

type AgentChatProps = {
  skills: Skill[]
  onSkillsChanged: (skills: Skill[]) => void
}

function uid(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const IMAGE_URL_RE = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i
const TEXT_EXT_RE =
  /\.(md|markdown|txt|json|csv|tsv|ts|tsx|js|jsx|mjs|cjs|css|scss|less|html|htm|xml|yaml|yml|toml|ini|env|svg|py|rs|go|java|kt|swift|c|cc|cpp|h|hpp|sh|bash|zsh|ps1|sql|log|rst|tex)$/i
const FILE_TEXT_MAX = 200 * 1024
const FOLDER_TEXT_MAX = 400 * 1024

function classifyMessageUrls(text: string): {
  imageUrl?: string
  linkUrl?: string
} {
  const urls = extractUrls(text)
  let imageUrl: string | undefined
  let linkUrl: string | undefined
  for (const u of urls) {
    if (!imageUrl && IMAGE_URL_RE.test(u)) {
      imageUrl = u
      continue
    }
    if (!linkUrl && !IMAGE_URL_RE.test(u)) {
      linkUrl = u
    }
    if (imageUrl && linkUrl) break
  }
  if (!linkUrl && urls.length && !imageUrl) {
    linkUrl = urls[0]
  }
  return { imageUrl, linkUrl }
}

function formatSkillsBrief(skills: Skill[]): string {
  if (!skills.length) return '（本机库为空）'
  return skills
    .map((s, i) => `${i + 1}. ${s.name} — ${s.purpose}\n   path: ${s.path}`)
    .join('\n')
}

function fileExt(name: string): string {
  const m = name.match(/\.([a-z0-9]+)$/i)
  return m ? m[1].toLowerCase() : ''
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function isTextLikeFile(file: File): boolean {
  const extOk = TEXT_EXT_RE.test(file.name)
  const mime = (file.type || '').toLowerCase()
  const mimeOk =
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/xml' ||
    mime.endsWith('+json') ||
    mime.endsWith('+xml')
  return extOk || mimeOk
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取失败'))
    reader.readAsText(file)
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取失败'))
    reader.readAsDataURL(file)
  })
}

const CLARIFY_LINE =
  '意图不太明确。请选一项继续：学链接（贴 URL）/ 看图（上传或贴图）/ 归库（确认草稿）/ 查库（说「看库」或「选用某某」）。'

function isAmbiguousIntent(
  text: string,
  hasImg: boolean,
  hasUrl: boolean,
): boolean {
  if (hasImg || hasUrl) return false
  const t = text.trim()
  if (!t) return false
  if (t.length > 36) return false
  if (
    /看库|查库|浏览库|选用|选择|归库|学链接|看图|导出|对外输出|起草|摘要|skill|http|贴链|链接|图片|设计|颜色|字体|token|路径/i.test(
      t,
    )
  ) {
    return false
  }
  if (/^(帮我|你好|在吗|嗯|好的|继续|？|\?|做一下|弄一下)+$/i.test(t))
    return true
  if (t.length <= 10) return true
  return false
}

function PaperclipIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function TypeIcon({ kind }: { kind: PendingAttachment['kind'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
  if (kind === 'image') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 16l-5-5-4 4-2-2-5 5" />
      </svg>
    )
  }
  if (kind === 'folder') {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </svg>
  )
}

export function AgentChat({ skills, onSkillsChanged }: AgentChatProps) {
  const [settings, setSettings] = useState<LlmSettings>(() => loadLlmSettings())
  const [showSettings, setShowSettings] = useState(() => !hasApiKey())
  const [settingsDraft, setSettingsDraft] = useState<LlmSettings>(() =>
    loadLlmSettings(),
  )
  const [bubbles, setBubbles] = useState<ChatBubble[]>([
    {
      id: 'welcome',
      role: 'system',
      text: '直接发消息即可：粘贴链接、描述 Skill、附图片/文件/文件夹，或说「归库」「导出」「看库」「选用某某」。Agent 会理解意图。选用时可复制供给层 path。写入本机库前会请你确认。',
    },
  ])
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<SkillDraft | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [lastIngestName, setLastIngestName] = useState<string | null>(() =>
    loadLastIngestName(),
  )
  /** 选用：仅切换当前会话引用（不新开入口） */
  const [sessionSelected, setSessionSelected] = useState<Skill | null>(null)
  /** 最近入库面板选中项；与结果卡「看库」共用 */
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const recentBarRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const attachMenuRef = useRef<HTMLDivElement>(null)
  const apiHistory = useRef<ApiMessage[]>([])

  const keyed = hasApiKey(settings)
  const recentIngestLabel =
    lastIngestName ?? mostRecentSkill(skills)?.name ?? null

  const recentSkills = useMemo(
    () =>
      [...skills]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [skills],
  )

  const selectedSkill =
    recentSkills.find((s) => s.id === selectedSkillId) ??
    skills.find((s) => s.id === selectedSkillId) ??
    null

  useEffect(() => {
    if (!recentSkills.length) {
      setSelectedSkillId(null)
      return
    }
    setSelectedSkillId((prev) =>
      prev && recentSkills.some((s) => s.id === prev)
        ? prev
        : recentSkills[0].id,
    )
  }, [recentSkills])


  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [bubbles, pendingDraft, busy])

  useEffect(() => {
    const el = folderRef.current
    if (!el) return
    el.setAttribute('webkitdirectory', '')
    el.setAttribute('directory', '')
  }, [])

  useEffect(() => {
    if (!attachMenuOpen) return
    function onDoc(e: MouseEvent) {
      if (!attachMenuRef.current?.contains(e.target as Node)) {
        setAttachMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [attachMenuOpen])

  function pushBubble(b: Omit<ChatBubble, 'id'> & { id?: string }) {
    setBubbles((prev) => [...prev, { ...b, id: b.id ?? uid() }])
  }

  function saveSettingsForm(e: FormEvent) {
    e.preventDefault()
    const next: LlmSettings = {
      baseUrl: settingsDraft.baseUrl.trim() || DEFAULT_LLM_SETTINGS.baseUrl,
      model: settingsDraft.model.trim() || DEFAULT_LLM_SETTINGS.model,
      apiKey: settingsDraft.apiKey.trim(),
    }
    saveLlmSettings(next)
    setSettings(next)
    setSettingsDraft(next)
    setShowSettings(false)
    setStatusMsg(
      next.apiKey
        ? '已保存 API 配置（仅 localStorage）。'
        : '已保存，但尚未填写 API Key — 发送前须配置。',
    )
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function clearAttachments() {
    setAttachments([])
    if (imageRef.current) imageRef.current.value = ''
    if (fileRef.current) fileRef.current.value = ''
    if (folderRef.current) folderRef.current.value = ''
  }

  async function addFilesFromList(list: FileList | File[], fromFolder: boolean) {
    const files = Array.from(list)
    if (!files.length) return

    if (fromFolder) {
      const first = files[0] as File & { webkitRelativePath?: string }
      const folderName =
        (first.webkitRelativePath || first.name).split('/')[0] || '文件夹'
      let budget = FOLDER_TEXT_MAX
      const chunks: string[] = []
      let included = 0
      let skipped = 0
      const skippedNames: string[] = []

      for (const file of files) {
        const rel =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name
        if (file.type.startsWith('image/')) {
          skipped += 1
          skippedNames.push(`${rel}（图片，请单独用「上传图片」）`)
          continue
        }
        if (!isTextLikeFile(file) || file.size > FILE_TEXT_MAX) {
          skipped += 1
          skippedNames.push(
            `${rel}（${fileExt(file.name) || file.type || '二进制'} · ${formatBytes(file.size)}）`,
          )
          continue
        }
        if (budget <= 0) {
          skipped += 1
          skippedNames.push(`${rel}（超出文件夹总上限）`)
          continue
        }
        try {
          const raw = await readFileAsText(file)
          const slice = raw.slice(0, Math.min(raw.length, budget, FILE_TEXT_MAX))
          budget -= slice.length
          chunks.push(`--- 文件: ${rel} ---\n${slice}`)
          included += 1
        } catch {
          skipped += 1
          skippedNames.push(`${rel}（读取失败）`)
        }
      }

      const folderContext = [
        `【文件夹附件：${folderName}】纳入 ${included} 个文本文件；跳过 ${skipped} 个。`,
        chunks.join('\n\n'),
        skippedNames.length
          ? `跳过列表：\n${skippedNames.slice(0, 40).join('\n')}${skippedNames.length > 40 ? '\n…' : ''}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      setAttachments((prev) => [
        ...prev,
        {
          id: uid(),
          kind: 'folder',
          name: folderName,
          ext: 'folder',
          size: files.reduce((s, f) => s + f.size, 0),
          mime: 'folder',
          folderIncluded: included,
          folderSkipped: skipped,
          folderContext,
        },
      ])
      setStatusMsg(
        `已添加文件夹「${folderName}」（${files.length} 项 · 纳入 ${included} · 跳过 ${skipped}）`,
      )
      return
    }

    const nextItems: PendingAttachment[] = []
    for (const file of files) {
      const ext = fileExt(file.name)
      if (file.type.startsWith('image/')) {
        try {
          const dataUrl = await readFileAsDataUrl(file)
          nextItems.push({
            id: uid(),
            kind: 'image',
            name: file.name,
            ext: ext || 'img',
            size: file.size,
            mime: file.type,
            dataUrl,
          })
        } catch {
          pushBubble({ role: 'error', text: `读取图片失败：${file.name}` })
        }
        continue
      }

      if (isTextLikeFile(file) && file.size <= FILE_TEXT_MAX) {
        try {
          const textContent = (await readFileAsText(file)).slice(0, FILE_TEXT_MAX)
          nextItems.push({
            id: uid(),
            kind: 'file',
            name: file.name,
            ext: ext || 'txt',
            size: file.size,
            mime: file.type || 'text/plain',
            textContent,
          })
        } catch {
          pushBubble({ role: 'error', text: `读取文件失败：${file.name}` })
        }
        continue
      }

      nextItems.push({
        id: uid(),
        kind: 'file',
        name: file.name,
        ext: ext || 'bin',
        size: file.size,
        mime: file.type || 'application/octet-stream',
        binaryNote: true,
      })
    }

    if (nextItems.length) {
      setAttachments((prev) => [...prev, ...nextItems])
      setStatusMsg(`已添加 ${nextItems.length} 个附件（当前共 ${attachments.length + nextItems.length} 项）`)
    }
  }

  async function runLinkLearn(url: string): Promise<string> {
    try {
      const { text: body, via } = await fetchLinkText(url)
      return `【链接学习 · 已抓取正文摘要素材 · via ${via}】\nURL: ${url}\n\n${body.slice(0, 8000)}\n\n请据此输出中文摘要，并给出可归库的 Skill 草稿（名称/用途/path/content）。若信息不足请说明。`
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // 单一可读提示（system，非重复 error）；仍继续调模型做 URL 有限推断
      pushBubble({
        role: 'system',
        text: `链接正文未抓取成功：${msg}\n将仅基于 URL 做有限推断；亦可粘贴页面正文后重发。`,
        linkUrl: url,
      })
      return `【链接学习 · 抓取失败，请基于 URL 做有限推断，并提示用户粘贴正文作为降级】\nURL: ${url}\n错误：${msg}`
    }
  }

  async function tryLocalLibraryIntent(text: string): Promise<boolean> {
    const t = text.trim()
    if (
      /^(看库|列出|浏览库|有哪些\s*skill|skill\s*列表)$/i.test(t) ||
      /看一下(本机)?库|列出(全部)?skill/i.test(t)
    ) {
      const brief = formatSkillsBrief(skills)
      pushBubble({
        role: 'assistant',
        text: `本机已登记 ${skills.length} 项 Skill：\n\n${brief}\n\n可说「选用 <名称>」复制其 path；或继续贴链接 / 描述以起草新 Skill。`,
      })
      return true
    }
    const selectMatch = t.match(/^(选用|选择|用一下|复制)\s*[「「"']?(.+?)[」」"']?\s*$/)
    if (selectMatch) {
      const q = selectMatch[2].trim()
      const hit =
        skills.find((s) => s.name === q) ||
        skills.find((s) => s.name.includes(q) || s.id === q)
      if (!hit) {
        pushBubble({
          role: 'assistant',
          text: `未找到名为「${q}」的 Skill。当前库：\n\n${formatSkillsBrief(skills)}\n\n请核对名称后再说「选用 …」。`,
        })
        return true
      }
      setSessionSelected(hit)
      const pathText = hit.path
      const ok = await copyPath(pathText)
      pushBubble({
        role: 'assistant',
        text: ok
          ? `已选用「${hit.name}」（当前会话引用）。\n用途：${hit.purpose}\npath 已复制：\n${pathText}\n\n可在目标项目 CSS 中 @import 该路径下的 tokens.css（仅供给层）。`
          : `已选用「${hit.name}」（当前会话引用）。\n用途：${hit.purpose}\npath（请手动复制）：\n${pathText}`,
      })
      return true
    }
    return false
  }

  function buildAttachmentContext(atts: PendingAttachment[]): {
    textBlocks: string[]
    imageDataUrls: string[]
    summaryLine: string
  } {
    const textBlocks: string[] = []
    const imageDataUrls: string[] = []
    const labels: string[] = []

    for (const a of atts) {
      if (a.kind === 'image' && a.dataUrl) {
        imageDataUrls.push(a.dataUrl)
        labels.push(`🖼 ${a.name}`)
      } else if (a.kind === 'folder') {
        labels.push(
          `📁 ${a.name}（纳入 ${a.folderIncluded ?? 0} · 跳过 ${a.folderSkipped ?? 0}）`,
        )
        if (a.folderContext) textBlocks.push(a.folderContext)
      } else if (a.kind === 'file') {
        labels.push(`📄 ${a.name}（.${a.ext || '?'} · ${formatBytes(a.size)}）`)
        if (a.textContent) {
          textBlocks.push(
            `【附件文件：${a.name}】\n${a.textContent.slice(0, FILE_TEXT_MAX)}`,
          )
        } else if (a.binaryNote) {
          textBlocks.push(
            `【附件文件：${a.name}】类型 .${a.ext || 'bin'} · ${formatBytes(a.size)} · 无法内联二进制内容，仅登记文件名。`,
          )
        }
      }
    }

    return {
      textBlocks,
      imageDataUrls,
      summaryLine: labels.length ? `已附加：${labels.join('；')}` : '',
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    if (busy) return

    const text = input.trim()
    const { imageUrl: pastedImageUrl, linkUrl: detectedLink } =
      classifyMessageUrls(text)
    const attsSnapshot = attachments
    const attCtx = buildAttachmentContext(attsSnapshot)
    const img =
      attCtx.imageDataUrls[0] || pastedImageUrl || null
    const urlForLearn = detectedLink || undefined
    const hasAtt = attsSnapshot.length > 0

    if (!text && !img && !hasAtt) {
      pushBubble({
        role: 'error',
        text: '请输入内容（可含链接）、或附加图片/文件/文件夹后再发送。',
      })
      return
    }

    if (text && !img && !urlForLearn && !hasAtt) {
      const handled = await tryLocalLibraryIntent(text)
      if (handled) {
        setInput('')
        return
      }
    }

    if (isAmbiguousIntent(text, !!img || hasAtt, !!urlForLearn)) {
      pushBubble({ role: 'user', text: text || '（空）' })
      setInput('')
      pushBubble({ role: 'assistant', text: CLARIFY_LINE })
      return
    }

    if (!keyed) {
      setShowSettings(true)
      pushBubble({
        role: 'error',
        text: '尚未配置 API Key。请先打开「设置」填写 Base URL / 模型 / Key（仅存本机）。未配置前不会发起任何模型请求。',
      })
      return
    }

    setBusy(true)
    setStatusMsg(null)

    const userVisible = [
      text,
      attCtx.summaryLine,
      img && pastedImageUrl && !attCtx.imageDataUrls.length
        ? '（消息含图片 URL）'
        : '',
    ]
      .filter(Boolean)
      .join('\n')

    pushBubble({
      role: 'user',
      text: userVisible || '（空消息）',
      imagePreview: img || undefined,
      linkUrl: urlForLearn,
    })

    setInput('')
    clearAttachments()

    try {
      const parts: string[] = []
      if (urlForLearn) {
        parts.push(await runLinkLearn(urlForLearn))
      }
      if (text) parts.push(text)
      parts.push(...attCtx.textBlocks)
      parts.push(
        `【本机 Skill 库快照 · 共 ${skills.length} 项】\n${formatSkillsBrief(skills)}`,
      )

      const wantExport =
        /对外输出|导出|复制\s*skill|export/i.test(text) &&
        !urlForLearn &&
        !img &&
        !hasAtt

      if (wantExport && pendingDraft) {
        await exportPending()
        setBusy(false)
        return
      }

      let userContent: string | TextContentPart[]
      const images = attCtx.imageDataUrls.length
        ? attCtx.imageDataUrls
        : img
          ? [img]
          : []

      if (images.length) {
        const textPart =
          parts.join('\n\n').trim() ||
          '请理解附件图片，并提炼可归入曙光云 SkillUI 供给层的设计要点（颜色/字体/组件风格）。若适合归库，给出草稿 JSON。'
        userContent = [
          { type: 'text', text: textPart },
          ...images.map((url) => ({
            type: 'image_url' as const,
            image_url: { url },
          })),
        ]
      } else {
        userContent = parts.join('\n\n') || '请继续。'
      }

      if (
        /^归库$/.test(text) &&
        !pendingDraft &&
        apiHistory.current.length === 0 &&
        !urlForLearn
      ) {
        pushBubble({
          role: 'assistant',
          text: '当前没有待确认的草稿。请先贴链接学习、描述 Skill，或上传参考图；我会给出草稿，你确认后再归库。',
        })
        setBusy(false)
        return
      }

      const messages: ApiMessage[] = [
        buildSystemMessage(),
        ...apiHistory.current,
        { role: 'user', content: userContent },
      ]

      const reply = await chatCompletion(settings, messages)

      apiHistory.current = [
        ...apiHistory.current,
        {
          role: 'user',
          content:
            typeof userContent === 'string'
              ? userContent
              : parts.join('\n\n') || '[图片]',
        },
        { role: 'assistant', content: reply },
      ]
      if (apiHistory.current.length > 24) {
        apiHistory.current = apiHistory.current.slice(-24)
      }

      pushBubble({ role: 'assistant', text: reply })

      const draft = parseGuikuDraft(reply)
      if (draft) {
        setPendingDraft(draft)
        setStatusMsg(
          '检测到归库草稿 — 请在下方确认后才会写入 localStorage。',
        )
      }

      if (wantExport && !draft) {
        setStatusMsg(
          '可点「对外输出最近草稿」复制 Skill 包文本（若有待确认草稿）。',
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      pushBubble({ role: 'error', text: msg })
    } finally {
      setBusy(false)
    }
  }

  function confirmGuiku() {
    if (!pendingDraft) return
    const draft = pendingDraft
    const next = addSkill({
      id: draft.id,
      name: draft.name,
      purpose: draft.purpose,
      path: draft.path,
      content: draft.content,
    })
    const saved = next.find((x) => x.name === draft.name.trim()) ?? next[0]
    onSkillsChanged(next)
    saveLastIngestName(saved.name)
    setLastIngestName(saved.name)
    setSessionSelected(saved)
    setSelectedSkillId(saved.id)
    pushBubble({
      role: 'system',
      text: `已确认归库「${saved.name}」→ localStorage（sugon-skillui-skills）。`,
      guikuResult: {
        name: saved.name,
        purpose: saved.purpose,
        path: saved.path,
        skillCount: next.length,
      },
    })
    setPendingDraft(null)
    setStatusMsg(null)
  }

  function showSkillDetail(skill: Skill) {
    setSelectedSkillId(skill.id)
    recentBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  async function runLookLibrary(focusName?: string) {
    if (focusName) {
      const hit =
        skills.find((s) => s.name === focusName) ||
        skills.find((s) => s.name.includes(focusName) || s.id === focusName)
      if (hit) {
        showSkillDetail(hit)
        return
      }
    }
    const brief = formatSkillsBrief(skills)
    pushBubble({
      role: 'assistant',
      text: `本机已登记 ${skills.length} 项 Skill：\n\n${brief}\n\n可说「选用 <名称>」复制其 path；或继续贴链接 / 描述以起草新 Skill。`,
    })
  }

  async function runSelectSkill(q: string) {
    const hit =
      skills.find((s) => s.name === q) ||
      skills.find((s) => s.name.includes(q) || s.id === q)
    if (!hit) {
      pushBubble({
        role: 'assistant',
        text: `未找到名为「${q}」的 Skill。当前库：\n\n${formatSkillsBrief(skills)}\n\n请核对名称后再说「选用 …」。`,
      })
      return
    }
    setSessionSelected(hit)
    const pathText = hit.path
    const ok = await copyPath(pathText)
    pushBubble({
      role: 'assistant',
      text: ok
        ? `已选用「${hit.name}」（当前会话引用）。\n用途：${hit.purpose}\npath 已复制：\n${pathText}\n\n可在目标项目 CSS 中 @import 该路径下的 tokens.css（仅供给层）。`
        : `已选用「${hit.name}」（当前会话引用）。\n用途：${hit.purpose}\npath（请手动复制）：\n${pathText}`,
    })
  }

  function cancelGuiku() {
    if (!pendingDraft) return
    pushBubble({
      role: 'system',
      text: `已取消归库「${pendingDraft.name}」，未写入 localStorage。`,
    })
    setPendingDraft(null)
    setStatusMsg(null)
  }

  async function exportPending() {
    const draft = pendingDraft
    if (!draft) {
      pushBubble({
        role: 'error',
        text: '暂无待确认草稿可导出。请先通过对话生成带归库 JSON 的草稿。',
      })
      return
    }
    const text = draftToExportText(draft)
    try {
      await navigator.clipboard.writeText(text)
      pushBubble({
        role: 'system',
        text: '已复制 Skill 包文本到剪贴板（对外输出）。',
      })
    } catch {
      pushBubble({ role: 'assistant', text: `【对外输出】\n\n${text}` })
    }
  }

  function retryLink(url: string) {
    setInput(`请根据该链接学习并给出 Skill 摘要与归库草稿：\n${url}`)
    setStatusMsg('已填入链接到消息框，请点击「发送」重试。')
  }

  return (
    <section
      id="agent"
      className="section-pad"
      style={{
        scrollMarginTop: '4.5rem',
        backgroundColor: 'var(--color-bg-subtle)',
        borderTop: '1px solid var(--color-border)',
        paddingBlock: 'var(--space-3)',
      }}
    >
      <div className="container-max" style={{ maxWidth: 'var(--agent-max)' }}>
        <header className="agent-hero">
          <div className="agent-hero-main">
            <p className="shell-eyebrow">对话</p>
            <h2 className="shell-title">用 Agent 管理 Skill</h2>
            <p className="shell-lede">
              唯一入口：学习 · 起草 · 看库 · 选用 · 归库 · 导出
            </p>
          </div>
          {sessionSelected && (
            <p className="agent-hero-ref">当前引用：{sessionSelected.name}</p>
          )}
        </header>

        {!keyed && (
          <div
            role="status"
            className="card"
            style={{
              marginBottom: 'var(--space-4)',
              borderColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-muted)',
              padding: 'var(--space-4)',
            }}
          >
            <strong style={{ color: 'var(--color-primary)' }}>
              未配置 API Key
            </strong>
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                fontSize: 'var(--text-sm)',
              }}
            >
              不会假连通。请点击「去配置 API」填写 Base URL、模型名与 Key（仅
              localStorage）。配置前模型请求会被拦截；「看库 / 选用」仍可用。
            </p>
          </div>
        )}

        {showSettings && (
          <form
            className="card"
            onSubmit={saveSettingsForm}
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-5)',
            }}
          >
            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span style={labelStyle}>Base URL（OpenAI 兼容）</span>
              <input
                className="field-input"
                value={settingsDraft.baseUrl}
                onChange={(e) =>
                  setSettingsDraft((s) => ({ ...s, baseUrl: e.target.value }))
                }
                placeholder="https://t.mysugoncloud.com:8765"
                autoComplete="off"
              />
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                默认云主机在开发模式下走同源 /api/llm 代理，避免浏览器
                CORS。自定义地址将直连（需网关允许跨域）。
              </span>
            </label>
            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span style={labelStyle}>模型名</span>
              <input
                className="field-input"
                value={settingsDraft.model}
                onChange={(e) =>
                  setSettingsDraft((s) => ({ ...s, model: e.target.value }))
                }
                placeholder="deepseek-flash"
                autoComplete="off"
              />
            </label>
            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span style={labelStyle}>API Key（仅本机 localStorage）</span>
              <input
                className="field-input"
                type="password"
                value={settingsDraft.apiKey}
                onChange={(e) =>
                  setSettingsDraft((s) => ({ ...s, apiKey: e.target.value }))
                }
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
              }}
            >
              <button type="submit" className="btn-primary">
                保存配置
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const cleared = { ...DEFAULT_LLM_SETTINGS, apiKey: '' }
                  saveLlmSettings(cleared)
                  setSettings(cleared)
                  setSettingsDraft(cleared)
                  setStatusMsg('已清除本机 API Key。')
                }}
              >
                清除 Key
              </button>
            </div>
          </form>
        )}

        <div ref={recentBarRef} className="agent-shell">
          <aside className="agent-library" aria-label="最近入库">
            <div className="agent-library-head">
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text)',
                  }}
                >
                  最近入库
                </p>
                <p
                  style={{
                    margin: '0.1rem 0 0',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {recentIngestLabel
                    ? `最近：${recentIngestLabel} · 当前 ${skills.length} 个`
                    : `当前 ${skills.length} 个`}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  height: '2rem',
                  fontSize: 'var(--text-xs)',
                  flexShrink: 0,
                }}
                onClick={() => {
                  setSettingsDraft(loadLlmSettings())
                  setShowSettings((v) => !v)
                }}
              >
                {showSettings ? '收起设置' : keyed ? '设置' : '去配置 API'}
              </button>
            </div>

            <div className="agent-recent-list">
                {recentSkills.length === 0 ? (
                  <p
                    style={{
                      margin: 'auto',
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    暂无入库
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 'var(--space-2)',
                      display: 'grid',
                      gap: '0.2rem',
                    }}
                  >
                    {recentSkills.map((sk) => {
                      const selected = selectedSkillId === sk.id
                      const tag = skillSourceBadge(sk)
                      return (
                        <li key={sk.id}>
                          <button
                            type="button"
                            onClick={() => showSkillDetail(sk)}
                            aria-pressed={selected}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              display: 'grid',
                              gridTemplateColumns: '0.5rem 1fr auto',
                              gap: '0.55rem',
                              alignItems: 'center',
                              padding: '0.5rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid transparent',
                              borderLeft: selected
                                ? '3px solid var(--color-primary)'
                                : '3px solid transparent',
                              backgroundColor: selected
                                ? 'var(--color-primary-muted)'
                                : 'transparent',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              color: 'var(--color-text)',
                            }}
                          >
                            <span
                              aria-hidden
                              style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '9999px',
                                backgroundColor: 'var(--color-primary)',
                                justifySelf: 'center',
                              }}
                            />
                            <span style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: selected
                                    ? 'var(--font-weight-semibold)'
                                    : 'var(--font-weight-medium)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {sk.name}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: '0.1rem',
                                  fontSize: '0.6875rem',
                                  color: 'var(--color-text-muted)',
                                  fontFamily: 'var(--font-mono)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  opacity: 0.75,
                                }}
                                title={sk.path}
                              >
                                {sk.path}
                              </span>
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                padding: '0.1rem 0.4rem',
                                borderRadius: '9999px',
                                color: 'var(--color-primary)',
                                backgroundColor:
                                  'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                border:
                                  '1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tag}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
            </div>

            <div className="agent-library-preview">
              {selectedSkill ? (
                <StylePreviewCard
                  skill={selectedSkill}
                  onSelect={(sk) => setSessionSelected(sk)}
                />
              ) : (
                <div
                  role="status"
                  style={{
                    width: '100%',
                    margin: 'auto',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--color-border-strong)',
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  选择上方 Skill 查看风格预览
                </div>
              )}
            </div>
          </aside>

          <div className="agent-chat">
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              minHeight: '16rem',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            {bubbles.map((b) => (
              <Bubble
                key={b.id}
                bubble={b}
                onRetryLink={retryLink}
                onLook={(name) => void runLookLibrary(name)}
                onSelect={(name) => void runSelectSkill(name)}
                onCopyPath={(p) => copyPath(p)}
                onAttachSession={(sk) => setSessionSelected(sk)}
              />
            ))}
            {busy && (
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                模型思考中…
              </p>
            )}
          </div>

          {pendingDraft && (
            <div
              style={{
                borderTop: '2px solid var(--color-primary)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-primary-muted)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                归库确认闸 — 未确认前不写入 localStorage
              </p>
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  display: 'grid',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <div>
                  <strong>名称：</strong>
                  {pendingDraft.name}
                </div>
                <div>
                  <strong>用途：</strong>
                  {pendingDraft.purpose}
                </div>
                <div>
                  <strong>path：</strong>
                  <code
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {pendingDraft.path}
                  </code>
                </div>
                {pendingDraft.content && (
                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                      color: 'var(--color-text-secondary)',
                      maxHeight: '6rem',
                      overflow: 'auto',
                    }}
                  >
                    <strong>说明：</strong>
                    {pendingDraft.content}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="btn-primary"
                  onClick={confirmGuiku}
                >
                  确认归库
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelGuiku}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void exportPending()}
                >
                  对外输出（复制）
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => void handleSend(e)}
            style={{
              borderTop: '1px solid var(--color-border)',
              padding: 'var(--space-5)',
              display: 'grid',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span style={labelStyle}>消息</span>
              <textarea
                className="field-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                placeholder="例如：看库 / 选用 brand-kit / 贴 URL 学链接 / 描述 Skill 归库…"
                disabled={busy}
                style={{
                  resize: 'vertical',
                  minHeight: '4.5rem',
                  height: 'auto',
                }}
              />
            </label>

            {attachments.length > 0 && (
              <div
                aria-label="待发送附件"
                style={{
                  display: 'grid',
                  gap: 'var(--space-2)',
                  maxHeight: '9rem',
                  overflowY: 'auto',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span>附件 {attachments.length} 项</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={clearAttachments}
                    style={{
                      height: '1.5rem',
                      paddingInline: '0.5rem',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    全部清除
                  </button>
                </div>
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        color:
                          a.kind === 'image'
                            ? 'var(--color-primary)'
                            : a.kind === 'folder'
                              ? 'var(--color-warning)'
                              : 'var(--color-text-secondary)',
                        display: 'inline-flex',
                      }}
                      title={
                        a.kind === 'image'
                          ? '图片'
                          : a.kind === 'folder'
                            ? '文件夹'
                            : '文件'
                      }
                    >
                      <TypeIcon kind={a.kind} />
                    </span>
                    {a.kind === 'image' && a.dataUrl ? (
                      <img
                        src={a.dataUrl}
                        alt={a.name}
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          objectFit: 'cover',
                          borderRadius: 4,
                          border: '1px solid var(--color-border)',
                          flexShrink: 0,
                          background: 'var(--color-surface)',
                        }}
                      />
                    ) : null}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={a.name}
                      >
                        {a.name}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {a.kind === 'image' &&
                          `图片 · ${a.ext || a.mime} · ${formatBytes(a.size)}`}
                        {a.kind === 'file' &&
                          (a.binaryNote
                            ? `文件 · .${a.ext || 'bin'} · ${formatBytes(a.size)} · 无法内联`
                            : `文件 · .${a.ext || '?'} · ${formatBytes(a.size)}`)}
                        {a.kind === 'folder' &&
                          `文件夹 · 纳入 ${a.folderIncluded ?? 0} · 跳过 ${a.folderSkipped ?? 0}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => removeAttachment(a.id)}
                      aria-label={`移除 ${a.name}`}
                      style={{
                        height: '1.75rem',
                        paddingInline: '0.5rem',
                        fontSize: 'var(--text-xs)',
                        flexShrink: 0,
                      }}
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <input
                ref={imageRef}
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => {
                  const list = e.target.files
                  if (list?.length) void addFilesFromList(list, false)
                  e.target.value = ''
                }}
              />
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="*/*"
                hidden
                onChange={(e) => {
                  const list = e.target.files
                  if (list?.length) void addFilesFromList(list, false)
                  e.target.value = ''
                }}
              />
              <input
                ref={folderRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  const list = e.target.files
                  if (list?.length) void addFilesFromList(list, true)
                  e.target.value = ''
                }}
              />

              <div ref={attachMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => setAttachMenuOpen((v) => !v)}
                  title="附加图片、文件或文件夹"
                  aria-label="附加图片、文件或文件夹"
                  aria-expanded={attachMenuOpen}
                  aria-haspopup="menu"
                  style={{
                    height: '2.5rem',
                    minWidth: '2.5rem',
                    paddingInline: '0.65rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <PaperclipIcon />
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {attachMenuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 4px)',
                      left: 0,
                      zIndex: 20,
                      minWidth: '9.5rem',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.25rem',
                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: '2.25rem',
                        border: 'none',
                        background: 'transparent',
                      }}
                      onClick={() => {
                        setAttachMenuOpen(false)
                        imageRef.current?.click()
                      }}
                    >
                      上传图片
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: '2.25rem',
                        border: 'none',
                        background: 'transparent',
                      }}
                      onClick={() => {
                        setAttachMenuOpen(false)
                        fileRef.current?.click()
                      }}
                    >
                      上传文件
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: '2.25rem',
                        border: 'none',
                        background: 'transparent',
                      }}
                      onClick={() => {
                        setAttachMenuOpen(false)
                        folderRef.current?.click()
                      }}
                    >
                      上传文件夹
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={busy}
                title={
                  keyed
                    ? '发送'
                    : '看库/选用可用；模型请求需配置 API Key'
                }
                style={{ marginLeft: 'auto' }}
              >
                {busy ? '发送中…' : '发送'}
              </button>
            </div>

            {statusMsg && (
              <p
                role="status"
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {statusMsg}
              </p>
            )}
          </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bubble({
  bubble,
  onRetryLink,
  onLook,
  onSelect,
  onCopyPath,
  onAttachSession,
}: {
  bubble: ChatBubble
  onRetryLink: (url: string) => void
  onLook?: (name: string) => void
  onSelect?: (name: string) => void
  onCopyPath?: (path: string) => Promise<boolean>
  onAttachSession?: (skill: Skill) => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = bubble.role === 'user'
  const isError = bubble.role === 'error'
  const result = bubble.guikuResult
  const previewSkill = bubble.stylePreviewSkill
  const bg = isError
    ? 'var(--color-danger-muted)'
    : isUser
      ? 'var(--color-primary-muted)'
      : bubble.role === 'system'
        ? 'var(--color-bg-muted)'
        : 'var(--color-surface)'
  const border = isError
    ? '1px solid var(--color-danger-border)'
    : result || previewSkill
      ? '1px solid var(--color-primary)'
      : '1px solid var(--color-border)'
  const color = isError ? 'var(--color-danger-foreground)' : 'var(--color-text)'

  async function handleCopy() {
    if (!result || !onCopyPath) return
    const ok = await onCopyPath(result.path)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '92%',
        backgroundColor: bg,
        border,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        color,
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom:
            bubble.imagePreview || bubble.linkUrl || result || previewSkill
              ? 'var(--space-2)'
              : 0,
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: isError ? 'var(--color-danger-foreground)' : 'var(--color-text-muted)',
        }}
      >
        {isUser
          ? '你'
          : isError
            ? '错误'
            : bubble.role === 'system'
              ? '系统'
              : '助手'}
      </p>
      {bubble.imagePreview && (
        <img
          src={bubble.imagePreview}
          alt="附件预览"
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '12rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-2)',
            objectFit: 'contain',
            background: 'var(--color-surface)',
          }}
        />
      )}
      {!result && !previewSkill && (
        <p
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-relaxed)',
            wordBreak: 'break-word',
          }}
        >
          {bubble.text}
        </p>
      )}
      {previewSkill && (
        <StylePreviewCard
          skill={previewSkill}
          onSelect={(sk) => onAttachSession?.(sk)}
        />
      )}
      {result && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)',
            }}
          >
            已入库 · {result.name}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={result.purpose}
          >
            {result.purpose}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              wordBreak: 'break-all',
              color: 'var(--color-text)',
            }}
          >
            {result.path}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            当前库 {result.skillCount} 个
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              marginTop: 'var(--space-1)',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              style={{ height: '2rem', fontSize: 'var(--text-xs)' }}
              onClick={() => onLook?.(result.name)}
            >
              看库
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ height: '2rem', fontSize: 'var(--text-xs)' }}
              onClick={() => onSelect?.(result.name)}
            >
              选用 {result.name}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ height: '2rem', fontSize: 'var(--text-xs)' }}
              onClick={() => void handleCopy()}
            >
              {copied ? '已复制' : '复制 path'}
            </button>
          </div>
        </div>
      )}
      {(isError || bubble.role === 'system') && bubble.linkUrl && (
        <button
          type="button"
          className="btn-secondary"
          style={{
            marginTop: 'var(--space-2)',
            height: '2rem',
            fontSize: 'var(--text-xs)',
          }}
          onClick={() => onRetryLink(bubble.linkUrl!)}
        >
          重试该链接
        </button>
      )}
    </div>
  )
}
const labelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
}
