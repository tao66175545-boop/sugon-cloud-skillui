#!/usr/bin/env node
/**
 * Sugon 16:9 gov/enterprise deck generator — original layouts only.
 * v0.4.3: ~35 layout types for showcase richness.
 * No proprietary skill code; brand red accents = short tick + short rule.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PptxGenJS from 'pptxgenjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(skillRoot, '../..')

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const brand = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tokens/sugon.brand.json'), 'utf8'))
const RED = brand.color.brand.red.$value.replace('#', '')
const TEXT = '171717'
const MUTED = '525252'
const LIGHT = 'F4F4F5'
const SUBTLE = 'FAFAFA'
const WHITE = 'FFFFFF'
const LINE = 'E5E5E5'
const FONT = 'Source Han Sans SC'
const logoPath = path.join(skillRoot, 'assets/logo.png')

const M = 0.65
const W = 13.333
const H = 7.5
const CW = W - 2 * M
const GAP = 0.35

/** Catalog ids — keep in sync with references/layouts.md */
export const LAYOUT_IDS = [
  'cover', 'cover-split', 'agenda', 'toc-two-col', 'section', 'section-band',
  'exec-summary', 'content', 'content-two-level', 'two-col', 'three-col', 'four-grid',
  'icon-rows', 'callout', 'compare', 'pros-cons', 'options-3', 'matrix-2x2', 'swot', 'table',
  'kpi-3', 'kpi-4', 'kpi-row', 'chart-frame', 'bridge-frame',
  'timeline', 'process-h', 'process-v', 'roadmap', 'risk', 'next-steps',
  'team', 'quote', 'closing', 'appendix',
]

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: W, height: H })
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugon Cloud SkillUI'
pptx.title = '曙光云政企汇报版式全集'
pptx.subject = 'sugon-ppt-template v0.4.3 showcase'

function addLogo(slide, x = W - M - 1.55, y = 0.38, w = 1.55) {
  if (fs.existsSync(logoPath)) slide.addImage({ path: logoPath, x, y, w, h: w / 2.506 })
}

function addFooter(slide, page, total) {
  slide.addText('内部资料 · 注意保密', {
    x: M, y: H - 0.38, w: 7, h: 0.22,
    fontSize: 10, fontFace: FONT, color: MUTED, margin: 0,
  })
  slide.addText(`${page} / ${total}`, {
    x: W - M - 1.2, y: H - 0.38, w: 1.2, h: 0.22,
    fontSize: 10, fontFace: FONT, color: MUTED, align: 'right', margin: 0,
  })
}

function addPageTitle(slide, title) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 0.48, w: 0.08, h: 0.42, fill: { color: RED },
  })
  slide.addText(title, {
    x: M + 0.22, y: 0.38, w: CW - 2.0, h: 0.7,
    fontSize: 24, fontFace: FONT, bold: true, color: TEXT, margin: 0, valign: 'middle',
  })
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 1.12, w: 2.2, h: 0.03, fill: { color: RED },
  })
}

function card(slide, x, y, w, h) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: LIGHT }, rectRadius: 0.08,
  })
}

function labelChip(slide, x, y, text) {
  slide.addText(text, {
    x, y, w: 2.2, h: 0.28,
    fontSize: 11, fontFace: FONT, color: RED, bold: true, margin: 0,
  })
}

const total = LAYOUT_IDS.length
let page = 0
function next() {
  page += 1
  return page
}

// ——— 1 cover ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s, M, 0.45, 2.05)
  labelChip(s, M, 1.55, 'cover')
  s.addText('曙光云算力与运维能力汇报', {
    x: M, y: 2.2, w: CW, h: 1.0,
    fontSize: 40, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.4, w: 2.8, h: 0.04, fill: { color: RED } })
  s.addText('面向政企客户的交付进展与下一步计划', {
    x: M, y: 3.65, w: CW * 0.85, h: 0.45,
    fontSize: 18, fontFace: FONT, color: MUTED, margin: 0,
  })
  s.addText('曙光云    2026 年 10 月', {
    x: M, y: 6.55, w: CW, h: 0.35,
    fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
  })
}

// ——— 2 cover-split ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '本轮汇报聚焦三件必须拍板的事项')
  labelChip(s, M, 1.25, 'cover-split')
  const leftW = CW * 0.52
  s.addText('统一调度、运维闭环与规范沉淀已具备规模化条件，请确认资源与节奏。', {
    x: M, y: 1.7, w: leftW, h: 2.2,
    fontSize: 18, fontFace: FONT, color: TEXT, margin: 0,
  })
  const rx = M + leftW + GAP
  const rw = CW - leftW - GAP
  ;['确认试点扩面清单', '锁定运维编制与预算', '批准规范纳入基线'].forEach((t, i) => {
    const y = 1.7 + i * 1.15
    card(s, rx, y, rw, 1.0)
    s.addText(String(i + 1).padStart(2, '0'), {
      x: rx + 0.25, y: y + 0.25, w: 0.7, h: 0.5,
      fontSize: 22, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(t, {
      x: rx + 1.0, y: y + 0.28, w: rw - 1.25, h: 0.45,
      fontSize: 15, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
    })
  })
  addFooter(s, p, total)
}

// ——— 3 agenda ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '目录')
  labelChip(s, M, 1.25, 'agenda')
  const items = [
    '背景与目标已对齐重点客户诉求',
    '核心能力覆盖调度、监控与集成',
    '本季度三项落地按期完成',
    '下一步聚焦规模化与规范沉淀',
  ]
  items.forEach((item, i) => {
    const y = 1.65 + i * 1.05
    s.addText(String(i + 1).padStart(2, '0'), {
      x: M, y, w: 0.85, h: 0.55,
      fontSize: 28, fontFace: FONT, bold: true, color: RED, margin: 0, valign: 'middle',
    })
    s.addText(item, {
      x: M + 1.05, y, w: CW - 1.2, h: 0.55,
      fontSize: 18, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
    })
    if (i < items.length - 1) {
      s.addShape(pptx.shapes.RECTANGLE, {
        x: M + 1.05, y: y + 0.72, w: CW - 1.2, h: 0.01, fill: { color: LINE },
      })
    }
  })
  addFooter(s, p, total)
}

// ——— 4 toc-two-col ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '汇报结构一览')
  labelChip(s, M, 1.25, 'toc-two-col')
  const colW = (CW - GAP) / 2
  const left = ['01 背景与目标', '02 能力全景', '03 本季交付', '04 风险与对策']
  const right = ['05 资源诉求', '06 下季路线', '07 决策事项', '08 附录材料']
  ;[
    { x: M, list: left },
    { x: M + colW + GAP, list: right },
  ].forEach(({ x, list }) => {
    list.forEach((t, i) => {
      const y = 1.7 + i * 1.05
      card(s, x, y, colW, 0.9)
      s.addText(t, {
        x: x + 0.3, y: y + 0.22, w: colW - 0.55, h: 0.45,
        fontSize: 16, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
      })
    })
  })
  addFooter(s, p, total)
}

// ——— 5 section ———
{
  const s = pptx.addSlide()
  const p = next()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE } })
  addLogo(s)
  labelChip(s, M, 1.8, 'section')
  s.addText('01', {
    x: M, y: 2.4, w: CW, h: 0.7,
    fontSize: 48, fontFace: FONT, bold: true, color: RED, margin: 0,
  })
  s.addText('能力与进展', {
    x: M, y: 3.2, w: CW * 0.75, h: 0.65,
    fontSize: 32, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 4.0, w: 1.8, h: 0.04, fill: { color: RED } })
  addFooter(s, p, total)
}

// ——— 6 section-band ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 2.6, w: W, h: 2.3, fill: { color: LIGHT },
  })
  labelChip(s, M, 2.85, 'section-band')
  s.addText('02  ·  治理与计划', {
    x: M, y: 3.3, w: CW, h: 0.8,
    fontSize: 34, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 4.25, w: 2.4, h: 0.04, fill: { color: RED } })
  addFooter(s, p, total)
}

// ——— 7 exec-summary ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '建议批准扩面：三项能力已具备可复制条件')
  labelChip(s, M, 1.25, 'exec-summary')
  const proofs = [
    { h: '调度就绪', t: '异构纳管与配额审计已在试点闭环' },
    { h: '运维闭环', t: '告警—工单—复盘路径可度量' },
    { h: '规范可装', t: '品牌与汇报模板可版本化分发' },
  ]
  const colW = (CW - GAP * 2) / 3
  proofs.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.7, colW, 3.8)
    s.addText(String(i + 1).padStart(2, '0'), {
      x: x + 0.3, y: 2.0, w: colW - 0.6, h: 0.5,
      fontSize: 22, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(it.h, {
      x: x + 0.3, y: 2.7, w: colW - 0.6, h: 0.5,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    s.addText(it.t, {
      x: x + 0.3, y: 3.4, w: colW - 0.6, h: 1.5,
      fontSize: 14, fontFace: FONT, color: MUTED, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 8 content ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '统一调度已打通异构算力纳管与配额审计')
  labelChip(s, M, 1.25, 'content')
  card(s, M, 1.65, CW, 4.4)
  const bullets = [
    '按项目配额与审计追踪，满足内控与合规要求',
    '监控告警接入工单闭环，故障响应路径可度量',
    '对外开放标准 API，业务系统可按周迭代接入',
  ]
  bullets.forEach((t, i) => {
    s.addText(`${i + 1}.  ${t}`, {
      x: M + 0.45, y: 2.0 + i * 0.85, w: CW - 0.9, h: 0.7,
      fontSize: 16, fontFace: FONT, color: TEXT, margin: 0,
    })
  })
  s.addText('指标为样例占位，正式稿请替换为真实数据。', {
    x: M + 0.45, y: 5.4, w: CW - 0.9, h: 0.35,
    fontSize: 12, fontFace: FONT, color: MUTED, margin: 0,
  })
  addFooter(s, p, total)
}

// ——— 9 content-two-level ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '运维体系建设分两层推进：平台能力与现场规范')
  labelChip(s, M, 1.25, 'content-two-level')
  const blocks = [
    { h: '平台能力', subs: ['统一告警收敛与升级策略', '知识库与标准作业条目化'] },
    { h: '现场规范', subs: ['值班交接与复盘模板固化', '重大变更双人复核'] },
  ]
  blocks.forEach((b, i) => {
    const y = 1.65 + i * 2.25
    card(s, M, y, CW, 2.05)
    s.addText(b.h, {
      x: M + 0.4, y: y + 0.25, w: CW - 0.8, h: 0.4,
      fontSize: 17, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    b.subs.forEach((sub, j) => {
      s.addText(`·  ${sub}`, {
        x: M + 0.55, y: y + 0.8 + j * 0.45, w: CW - 1.1, h: 0.4,
        fontSize: 14, fontFace: FONT, color: MUTED, margin: 0,
      })
    })
  })
  addFooter(s, p, total)
}

// ——— 10 two-col ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '试点交付与规范沉淀同步推进')
  labelChip(s, M, 1.25, 'two-col')
  const colW = (CW - GAP) / 2
  ;[
    { h: '试点交付', items: ['重点客户环境已上线试运行', '操作手册与培训材料完成归档'] },
    { h: '规范沉淀', items: ['品牌与 logo 规则可版本化安装', '汇报模板统一 16:9 与识别色'] },
  ].forEach((b, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.65, colW, 4.4)
    s.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.35, y: 1.95, w: 0.9, h: 0.04, fill: { color: RED },
    })
    s.addText(b.h, {
      x: x + 0.35, y: 2.15, w: colW - 0.7, h: 0.45,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    b.items.forEach((t, j) => {
      s.addText(t, {
        x: x + 0.35, y: 2.9 + j * 0.85, w: colW - 0.7, h: 0.7,
        fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
      })
    })
  })
  addFooter(s, p, total)
}

// ——— 11 three-col ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '三类能力共同支撑政企交付可信度')
  labelChip(s, M, 1.25, 'three-col')
  const cols = [
    { h: '调度', t: '配额、审计、异构纳管' },
    { h: '监控', t: '告警收敛与工单闭环' },
    { h: '集成', t: '标准 API 与周级迭代' },
  ]
  const colW = (CW - GAP * 2) / 3
  cols.forEach((c, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.7, colW, 4.0)
    s.addText(c.h, {
      x: x + 0.3, y: 2.3, w: colW - 0.6, h: 0.55,
      fontSize: 22, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(c.t, {
      x: x + 0.35, y: 3.3, w: colW - 0.7, h: 1.4,
      fontSize: 15, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 12 four-grid ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '四项保障条件决定扩面节奏')
  labelChip(s, M, 1.25, 'four-grid')
  const cells = [
    { h: '人员', t: '运维编制到位' },
    { h: '预算', t: '年度资源锁定' },
    { h: '规范', t: '基线已发布' },
    { h: '客户', t: '扩面名单确认' },
  ]
  const colW = (CW - GAP) / 2
  const rowH = 2.05
  cells.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + GAP)
    const y = 1.65 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    s.addText(c.h, {
      x: x + 0.35, y: y + 0.4, w: colW - 0.7, h: 0.45,
      fontSize: 18, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(c.t, {
      x: x + 0.35, y: y + 1.0, w: colW - 0.7, h: 0.5,
      fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 13 icon-rows ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '四条工作原则贯穿本轮交付')
  labelChip(s, M, 1.25, 'icon-rows')
  const rows = [
    { h: '结论先行', t: '每页页头写清「所以什么」' },
    { h: '证据可核', t: '关键数字附来源与口径' },
    { h: '节奏可控', t: '里程碑与责任人一一对应' },
    { h: '风险透明', t: '高影响项必须给出缓解动作' },
  ]
  rows.forEach((r, i) => {
    const y = 1.55 + i * 1.15
    s.addShape(pptx.shapes.OVAL, {
      x: M, y: y + 0.1, w: 0.55, h: 0.55, fill: { color: RED },
    })
    s.addText(String(i + 1), {
      x: M, y: y + 0.18, w: 0.55, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true, color: WHITE, align: 'center', margin: 0,
    })
    s.addText(r.h, {
      x: M + 0.8, y: y, w: 3.2, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    s.addText(r.t, {
      x: M + 4.1, y: y, w: CW - 4.1, h: 0.75,
      fontSize: 15, fontFace: FONT, color: MUTED, margin: 0, valign: 'middle',
    })
  })
  addFooter(s, p, total)
}

// ——— 14 callout ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  labelChip(s, M, 2.0, 'callout')
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 2.6, w: 0.1, h: 2.0, fill: { color: RED },
  })
  s.addText('没有可度量的运维闭环，扩面只会放大故障半径。', {
    x: M + 0.45, y: 2.7, w: CW - 0.6, h: 1.2,
    fontSize: 28, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addText('本页用于强调单一关键结论，正文汇报中慎用、少用。', {
    x: M + 0.45, y: 4.1, w: CW - 0.6, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, margin: 0,
  })
  addFooter(s, p, total)
}

// ——— 15 compare ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '从烟囱式运维走向统一闭环')
  labelChip(s, M, 1.25, 'compare')
  const colW = (CW - GAP) / 2
  ;[
    { h: '现状', color: MUTED, items: ['多套工具并行', '告警噪声高', '手册分散难检索'] },
    { h: '目标', color: RED, items: ['统一调度与监控', '工单可度量', '规范可安装分发'] },
  ].forEach((b, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.65, colW, 4.4)
    s.addText(b.h, {
      x: x + 0.35, y: 1.95, w: colW - 0.7, h: 0.5,
      fontSize: 20, fontFace: FONT, bold: true, color: b.color, margin: 0,
    })
    b.items.forEach((t, j) => {
      s.addText(`·  ${t}`, {
        x: x + 0.35, y: 2.7 + j * 0.7, w: colW - 0.7, h: 0.55,
        fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
      })
    })
  })
  addFooter(s, p, total)
}

// ——— 16 pros-cons ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '自建监控扩展的利与弊需要当面说清')
  labelChip(s, M, 1.25, 'pros-cons')
  const colW = (CW - GAP) / 2
  ;[
    { h: '有利', items: ['贴合现有工单习惯', '短期可见度高'] },
    { h: '不利', items: ['重复建设成本高', '难与统一调度对齐'] },
  ].forEach((b, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.65, colW, 4.4)
    s.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.35, y: 1.95, w: 0.9, h: 0.04, fill: { color: RED },
    })
    s.addText(b.h, {
      x: x + 0.35, y: 2.15, w: colW - 0.7, h: 0.45,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    b.items.forEach((t, j) => {
      s.addText(`·  ${t}`, {
        x: x + 0.35, y: 2.9 + j * 0.85, w: colW - 0.7, h: 0.7,
        fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
      })
    })
  })
  addFooter(s, p, total)
}

// ——— 17 options-3 ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '三条路径对比后建议选「统一平台 + 试点扩面」')
  labelChip(s, M, 1.25, 'options-3')
  const opts = [
    { h: '维持现状', t: '成本低，风险累积', tag: '不推荐' },
    { h: '全面自建', t: '灵活但周期长', tag: '备选' },
    { h: '统一平台', t: '可复制、可审计', tag: '建议' },
  ]
  const colW = (CW - GAP * 2) / 3
  opts.forEach((o, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.7, colW, 4.0)
    s.addText(o.tag, {
      x: x + 0.25, y: 1.95, w: colW - 0.5, h: 0.35,
      fontSize: 12, fontFace: FONT, bold: true, color: i === 2 ? RED : MUTED, margin: 0,
    })
    s.addText(o.h, {
      x: x + 0.25, y: 2.5, w: colW - 0.5, h: 0.55,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    s.addText(o.t, {
      x: x + 0.25, y: 3.3, w: colW - 0.5, h: 1.5,
      fontSize: 14, fontFace: FONT, color: MUTED, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 18 matrix-2x2 ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '事项按影响与紧急度落入四个行动格')
  labelChip(s, M, 1.25, 'matrix-2x2')
  const cells = [
    { h: '立即做', t: '告警闭环、配额审计' },
    { h: '计划做', t: '扩面培训、API 目录' },
    { h: '委托做', t: '驻场手册修订' },
    { h: '观察', t: '边缘定制需求' },
  ]
  const colW = (CW - GAP) / 2
  const rowH = 2.05
  cells.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + GAP)
    const y = 1.65 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    s.addText(c.h, {
      x: x + 0.35, y: y + 0.4, w: colW - 0.7, h: 0.45,
      fontSize: 17, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(c.t, {
      x: x + 0.35, y: y + 1.05, w: colW - 0.7, h: 0.55,
      fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 19 swot ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '扩面决策的 SWOT 摘要')
  labelChip(s, M, 1.25, 'swot')
  const cells = [
    { h: '优势 S', t: '试点证据充分、规范可装' },
    { h: '劣势 W', t: '编制尚未完全到位' },
    { h: '机会 O', t: '多客户同构需求集中' },
    { h: '威胁 T', t: '局部定制可能撕裂基线' },
  ]
  const colW = (CW - GAP) / 2
  const rowH = 2.05
  cells.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + GAP)
    const y = 1.65 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    s.addText(c.h, {
      x: x + 0.35, y: y + 0.35, w: colW - 0.7, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(c.t, {
      x: x + 0.35, y: y + 0.95, w: colW - 0.7, h: 0.7,
      fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 20 table ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '关键交付物与责任归属一览')
  labelChip(s, M, 1.25, 'table')
  s.addTable(
    [
      [
        { text: '交付物', options: { bold: true, color: TEXT } },
        { text: '状态', options: { bold: true, color: TEXT } },
        { text: '责任人', options: { bold: true, color: TEXT } },
      ],
      ['调度试点报告', '已完成', '平台组'],
      ['运维闭环手册', '评审中', '运维组'],
      ['扩面客户清单', '待确认', '客户成功'],
      ['规范安装包', '已发布', '品牌与工具'],
    ],
    {
      x: M, y: 1.7, w: CW, h: 4.2,
      colW: [CW * 0.4, CW * 0.25, CW * 0.35],
      border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }],
      fontFace: FONT,
      fontSize: 14,
      color: TEXT,
      align: 'left',
      valign: 'middle',
    },
  )
  addFooter(s, p, total)
}

// ——— 21 kpi-3 ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '三项关键结果支撑本轮汇报结论')
  labelChip(s, M, 1.25, 'kpi-3')
  const items = [
    { v: '3', l: '重点试点已交付' },
    { v: '4', l: '可安装品牌技能' },
    { v: '16:9', l: '统一汇报画幅' },
  ]
  const colW = (CW - GAP * 2) / 3
  items.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 3.8)
    s.addText(it.v, {
      x: x + 0.2, y: 2.5, w: colW - 0.4, h: 1.1,
      fontSize: 40, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(it.l, {
      x: x + 0.25, y: 3.9, w: colW - 0.5, h: 0.9,
      fontSize: 15, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 22 kpi-4 ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '四项运行指标周环比保持改善')
  labelChip(s, M, 1.25, 'kpi-4')
  const items = [
    { v: '98%', l: '调度可用性' },
    { v: '12m', l: '告警中位响应' },
    { v: '35%', l: '重复告警下降' },
    { v: '6', l: '周级接入系统' },
  ]
  const colW = (CW - GAP * 3) / 4
  items.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 3.8)
    s.addText(it.v, {
      x: x + 0.1, y: 2.5, w: colW - 0.2, h: 1.0,
      fontSize: 32, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(it.l, {
      x: x + 0.15, y: 3.8, w: colW - 0.3, h: 0.9,
      fontSize: 13, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 23 kpi-row ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '本周经营与交付快照')
  labelChip(s, M, 1.25, 'kpi-row')
  const items = [
    { v: '5', l: '在途项目' },
    { v: '2', l: '待决策项' },
    { v: '1', l: '高风险项' },
    { v: '100%', l: '里程碑按期' },
  ]
  const colW = (CW - GAP * 3) / 4
  items.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.4, colW, 2.6)
    s.addText(it.v, {
      x: x + 0.1, y: 2.75, w: colW - 0.2, h: 0.9,
      fontSize: 34, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(it.l, {
      x: x + 0.1, y: 3.85, w: colW - 0.2, h: 0.6,
      fontSize: 13, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 24 chart-frame ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '告警量与闭环时长呈同步改善趋势')
  labelChip(s, M, 1.25, 'chart-frame')
  card(s, M, 1.65, CW * 0.62, 4.4)
  s.addText('此处插入折线 / 柱状图', {
    x: M + 0.4, y: 3.3, w: CW * 0.62 - 0.8, h: 0.5,
    fontSize: 16, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
  s.addText('正式稿替换为原生图表对象', {
    x: M + 0.4, y: 3.9, w: CW * 0.62 - 0.8, h: 0.4,
    fontSize: 12, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
  const rx = M + CW * 0.62 + GAP
  const rw = CW * 0.38 - GAP
  card(s, rx, 1.65, rw, 4.4)
  s.addText('读图要点', {
    x: rx + 0.25, y: 1.95, w: rw - 0.5, h: 0.4,
    fontSize: 16, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  ;['峰值已回落', '闭环时长缩短', '周末波动仍在'].forEach((t, i) => {
    s.addText(`·  ${t}`, {
      x: rx + 0.25, y: 2.6 + i * 0.7, w: rw - 0.5, h: 0.55,
      fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 25 bridge-frame ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '从基线到目标的能力桥段')
  labelChip(s, M, 1.25, 'bridge-frame')
  const steps = [
    { v: '基线', t: '分散工具' },
    { v: '+调度', t: '统一纳管' },
    { v: '+闭环', t: '工单度量' },
    { v: '+规范', t: '可安装' },
    { v: '目标', t: '可扩面' },
  ]
  const colW = (CW - GAP * 4) / 5
  steps.forEach((st, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.5, colW, 2.8)
    s.addText(st.v, {
      x: x + 0.1, y: 2.9, w: colW - 0.2, h: 0.7,
      fontSize: 16, fontFace: FONT, bold: true, color: i === 0 || i === 4 ? RED : TEXT, align: 'center', margin: 0,
    })
    s.addText(st.t, {
      x: x + 0.1, y: 3.8, w: colW - 0.2, h: 0.7,
      fontSize: 13, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 26 timeline ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '关键里程碑按季度落地')
  labelChip(s, M, 1.25, 'timeline')
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 3.35, w: CW, h: 0.04, fill: { color: RED },
  })
  const marks = [
    { t: 'Q1', d: '试点上线' },
    { t: 'Q2', d: '闭环验收' },
    { t: 'Q3', d: '规范发布' },
    { t: 'Q4', d: '扩面启动' },
  ]
  const colW = CW / 4
  marks.forEach((m, i) => {
    const x = M + i * colW + colW / 2 - 0.2
    s.addShape(pptx.shapes.OVAL, {
      x, y: 3.2, w: 0.35, h: 0.35, fill: { color: RED },
    })
    s.addText(m.t, {
      x: M + i * colW, y: 2.3, w: colW, h: 0.45,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, align: 'center', margin: 0,
    })
    s.addText(m.d, {
      x: M + i * colW, y: 3.9, w: colW, h: 0.45,
      fontSize: 14, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 27 process-h ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '故障处置标准五步流程')
  labelChip(s, M, 1.25, 'process-h')
  const steps = ['发现', '分级', '处置', '复盘', '沉淀']
  const colW = (CW - GAP * 4) / 5
  steps.forEach((st, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.6, colW, 2.4)
    s.addText(String(i + 1), {
      x: x + 0.1, y: 2.9, w: colW - 0.2, h: 0.55,
      fontSize: 22, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(st, {
      x: x + 0.1, y: 3.7, w: colW - 0.2, h: 0.55,
      fontSize: 16, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 28 process-v ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '变更发布准入的纵向检查链')
  labelChip(s, M, 1.25, 'process-v')
  const steps = [
    '方案评审通过',
    '灰度范围确认',
    '回滚预案就绪',
    '双人复核放行',
  ]
  steps.forEach((t, i) => {
    const y = 1.55 + i * 1.15
    s.addShape(pptx.shapes.OVAL, {
      x: M, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: RED },
    })
    s.addText(String(i + 1), {
      x: M, y: y + 0.22, w: 0.5, h: 0.35,
      fontSize: 14, fontFace: FONT, bold: true, color: WHITE, align: 'center', margin: 0,
    })
    if (i < steps.length - 1) {
      s.addShape(pptx.shapes.RECTANGLE, {
        x: M + 0.22, y: y + 0.7, w: 0.06, h: 0.55, fill: { color: LINE },
      })
    }
    card(s, M + 0.85, y, CW - 0.85, 0.9)
    s.addText(t, {
      x: M + 1.15, y: y + 0.22, w: CW - 1.4, h: 0.45,
      fontSize: 16, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
    })
  })
  addFooter(s, p, total)
}

// ——— 29 roadmap ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '下两季度路线按工作流排期')
  labelChip(s, M, 1.25, 'roadmap')
  const rows = [
    { h: '调度', q1: true, q2: true },
    { h: '运维', q1: true, q2: true },
    { h: '规范', q1: false, q2: true },
    { h: '扩面', q1: false, q2: true },
  ]
  // header
  s.addText('工作流', { x: M, y: 1.6, w: 2.2, h: 0.4, fontSize: 13, fontFace: FONT, bold: true, color: MUTED, margin: 0 })
  s.addText('Q4', { x: M + 3.0, y: 1.6, w: 3.5, h: 0.4, fontSize: 13, fontFace: FONT, bold: true, color: MUTED, align: 'center', margin: 0 })
  s.addText('Q1', { x: M + 7.0, y: 1.6, w: 3.5, h: 0.4, fontSize: 13, fontFace: FONT, bold: true, color: MUTED, align: 'center', margin: 0 })
  rows.forEach((r, i) => {
    const y = 2.15 + i * 1.0
    s.addText(r.h, {
      x: M, y: y + 0.15, w: 2.2, h: 0.45,
      fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
    })
    if (r.q1) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M + 3.0, y, w: 3.2, h: 0.7, fill: { color: RED }, rectRadius: 0.06,
      })
    } else {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M + 3.0, y, w: 3.2, h: 0.7, fill: { color: LIGHT }, rectRadius: 0.06,
      })
    }
    if (r.q2) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M + 7.0, y, w: 3.2, h: 0.7, fill: { color: RED }, rectRadius: 0.06,
      })
    } else {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M + 7.0, y, w: 3.2, h: 0.7, fill: { color: LIGHT }, rectRadius: 0.06,
      })
    }
  })
  addFooter(s, p, total)
}

// ——— 30 risk ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '高影响风险与缓解动作')
  labelChip(s, M, 1.25, 'risk')
  s.addTable(
    [
      [
        { text: '风险', options: { bold: true } },
        { text: '影响', options: { bold: true } },
        { text: '缓解', options: { bold: true } },
      ],
      ['编制不足', '高', '先锁定值班最小班底'],
      ['定制撕裂基线', '中', '变更评审强约束'],
      ['数据口径不一', '中', '统一指标字典'],
    ],
    {
      x: M, y: 1.7, w: CW, h: 4.0,
      colW: [CW * 0.32, CW * 0.18, CW * 0.5],
      border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }],
      fontFace: FONT,
      fontSize: 14,
      color: TEXT,
      align: 'left',
      valign: 'middle',
    },
  )
  addFooter(s, p, total)
}

// ——— 31 next-steps ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '会后两周内必须完成的行动')
  labelChip(s, M, 1.25, 'next-steps')
  const acts = [
    { a: '确认扩面客户名单', o: '客户成功' },
    { a: '锁定运维编制与预算', o: '综合管理' },
    { a: '发布规范安装说明', o: '品牌与工具' },
    { a: '安排试点复盘会', o: '平台组' },
  ]
  acts.forEach((it, i) => {
    const y = 1.55 + i * 1.15
    card(s, M, y, CW, 1.0)
    s.addText(String(i + 1).padStart(2, '0'), {
      x: M + 0.3, y: y + 0.25, w: 0.7, h: 0.5,
      fontSize: 20, fontFace: FONT, bold: true, color: RED, margin: 0,
    })
    s.addText(it.a, {
      x: M + 1.2, y: y + 0.25, w: CW * 0.55, h: 0.5,
      fontSize: 16, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
    })
    s.addText(it.o, {
      x: M + CW * 0.65, y: y + 0.25, w: CW * 0.3, h: 0.5,
      fontSize: 14, fontFace: FONT, color: MUTED, align: 'right', margin: 0, valign: 'middle',
    })
  })
  addFooter(s, p, total)
}

// ——— 32 team ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  addPageTitle(s, '本轮汇报相关角色')
  labelChip(s, M, 1.25, 'team')
  const people = [
    { r: '总负责', n: '姓名' },
    { r: '平台', n: '姓名' },
    { r: '运维', n: '姓名' },
    { r: '客户成功', n: '姓名' },
  ]
  const colW = (CW - GAP * 3) / 4
  people.forEach((pe, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.0, colW, 3.4)
    s.addShape(pptx.shapes.OVAL, {
      x: x + colW / 2 - 0.45, y: 2.4, w: 0.9, h: 0.9, fill: { color: RED },
    })
    s.addText(pe.r, {
      x: x + 0.15, y: 3.6, w: colW - 0.3, h: 0.45,
      fontSize: 15, fontFace: FONT, bold: true, color: TEXT, align: 'center', margin: 0,
    })
    s.addText(pe.n, {
      x: x + 0.15, y: 4.2, w: colW - 0.3, h: 0.4,
      fontSize: 13, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
    })
  })
  addFooter(s, p, total)
}

// ——— 33 quote ———
{
  const s = pptx.addSlide()
  const p = next()
  addLogo(s)
  labelChip(s, M, 2.0, 'quote')
  s.addText('「先把可复制的能力做硬，再谈全面铺开。」', {
    x: M + 0.4, y: 2.7, w: CW - 0.8, h: 1.4,
    fontSize: 26, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M + 0.4, y: 4.3, w: 1.6, h: 0.04, fill: { color: RED },
  })
  s.addText('内部工作要求 · 样例表述', {
    x: M + 0.4, y: 4.55, w: CW - 0.8, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, margin: 0,
  })
  addFooter(s, p, total)
}

// ——— 34 closing ———
{
  const s = pptx.addSlide()
  const p = next()
  if (fs.existsSync(logoPath)) {
    const lw = 1.9
    s.addImage({ path: logoPath, x: (W - lw) / 2, y: 2.0, w: lw, h: lw / 2.506 })
  }
  labelChip(s, (W - 2.2) / 2, 3.0, 'closing')
  s.addText('谢谢 · 请指正', {
    x: M, y: 3.4, w: CW, h: 0.7,
    fontSize: 34, fontFace: FONT, bold: true, color: TEXT, align: 'center', margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: (W - 1.6) / 2, y: 4.2, w: 1.6, h: 0.04, fill: { color: RED },
  })
  s.addText('曙光云', {
    x: M, y: 4.5, w: CW, h: 0.35,
    fontSize: 16, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
  s.addText('联系人 / 邮箱（请替换为本单位信息）', {
    x: M, y: 5.05, w: CW, h: 0.35,
    fontSize: 13, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
}

// ——— 35 appendix ———
{
  const s = pptx.addSlide()
  const p = next()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE } })
  addLogo(s)
  labelChip(s, M, 2.3, 'appendix')
  s.addText('附录', {
    x: M, y: 2.9, w: CW, h: 0.7,
    fontSize: 40, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addText('补充数据、接口清单与操作摘录', {
    x: M, y: 3.75, w: CW * 0.7, h: 0.5,
    fontSize: 18, fontFace: FONT, color: MUTED, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 4.45, w: 1.8, h: 0.04, fill: { color: RED } })
  addFooter(s, p, total)
}

const out = path.resolve(skillRoot, arg('out', 'examples/sample-deck.pptx'))
fs.mkdirSync(path.dirname(out), { recursive: true })
await pptx.writeFile({ fileName: out })
console.log(
  `build-deck: wrote ${path.relative(repoRoot, out)} (${total} layouts, brand.red #${RED})`,
)
console.log(`layout-ids: ${LAYOUT_IDS.join(',')}`)
