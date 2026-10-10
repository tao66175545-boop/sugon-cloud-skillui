#!/usr/bin/env node
/**
 * Sugon 16:9 gov/enterprise deck generator (original layouts).
 * Principles: action titles, ≥0.65" margins, type hierarchy, varied layouts,
 * restrained brand-red accents (short tick + short rule — not full-bleed bars),
 * soft cards, no font embed.
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
const FONT = 'Source Han Sans SC'
const logoPath = path.join(skillRoot, 'assets/logo.png')

const M = 0.65 // margin inches
const W = 13.333
const H = 7.5
const CONTENT_W = W - 2 * M
const GAP = 0.4

const defaultOutline = {
  title: '曙光云算力与运维能力汇报',
  subtitle: '面向政企客户的交付进展与下一步计划',
  org: '曙光云',
  date: '2026 年 10 月',
  agenda: [
    '背景与目标已经对齐重点客户诉求',
    '核心能力覆盖调度、监控与集成',
    '本季度三项落地按期完成',
    '下一步聚焦规模化与规范沉淀',
  ],
  section: { no: '01', title: '能力与进展' },
  content: {
    title: '统一调度已打通异构算力纳管与配额审计',
    bullets: [
      '按项目配额与审计追踪，满足内控与合规要求',
      '监控告警接入工单闭环，故障响应路径可度量',
      '对外开放标准 API，业务系统可按周迭代接入',
    ],
    note: '指标为样例占位，正式稿请替换为真实数据。',
  },
  twoCol: {
    title: '试点交付与规范沉淀同步推进',
    left: {
      heading: '试点交付',
      bullets: ['重点客户环境已上线试运行', '操作手册与培训材料完成归档'],
    },
    right: {
      heading: '规范沉淀',
      bullets: ['品牌与 logo 规则可版本化安装', '汇报模板统一 16:9 与识别色'],
    },
  },
  stats: {
    title: '三项关键结果支撑本轮汇报结论',
    items: [
      { value: '3', label: '重点试点已交付' },
      { value: '4', label: '可安装品牌技能' },
      { value: '16:9', label: '统一汇报画幅' },
    ],
  },
  closing: '谢谢 · 请指正',
}

const outlinePath = arg('outline', '')
const outline = outlinePath
  ? JSON.parse(fs.readFileSync(path.resolve(outlinePath), 'utf8'))
  : defaultOutline

const out = path.resolve(skillRoot, arg('out', 'examples/sample-deck.pptx'))
fs.mkdirSync(path.dirname(out), { recursive: true })

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: W, height: H })
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugon Cloud SkillUI'
pptx.title = outline.title
pptx.subject = 'sugon-ppt-template redesigned sample'

function addLogo(slide, x = W - M - 1.55, y = 0.38, w = 1.55) {
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x, y, w, h: w / 2.506 })
  }
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

/** Short brand tick + title (not a full-height sidebar). */
function addPageTitle(slide, title) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 0.48, w: 0.08, h: 0.42,
    fill: { color: RED },
  })
  slide.addText(title, {
    x: M + 0.22, y: 0.38, w: CONTENT_W - 2.0, h: 0.7,
    fontSize: 26, fontFace: FONT, bold: true, color: TEXT, margin: 0, valign: 'middle',
  })
  // short underline under title band
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 1.15, w: 2.4, h: 0.035,
    fill: { color: RED },
  })
}

const total = 7 // cover agenda section content twoCol stats closing

// —— 1 cover ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: H, fill: { color: WHITE },
  })
  addLogo(s, M, 0.45, 2.05)
  s.addText(outline.title, {
    x: M, y: 2.35, w: CONTENT_W, h: 1.15,
    fontSize: 40, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 3.65, w: 2.8, h: 0.045,
    fill: { color: RED },
  })
  s.addText(outline.subtitle, {
    x: M, y: 3.9, w: CONTENT_W * 0.85, h: 0.5,
    fontSize: 18, fontFace: FONT, color: MUTED, margin: 0,
  })
  s.addText(`${outline.org}    ${outline.date}`, {
    x: M, y: 6.55, w: CONTENT_W, h: 0.35,
    fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
  })
}

// —— 2 agenda ——
{
  const s = pptx.addSlide()
  addLogo(s)
  addPageTitle(s, '目录')
  outline.agenda.forEach((item, i) => {
    const y = 1.55 + i * 1.05
    s.addText(String(i + 1).padStart(2, '0'), {
      x: M, y, w: 0.85, h: 0.55,
      fontSize: 28, fontFace: FONT, bold: true, color: RED, margin: 0, valign: 'middle',
    })
    s.addText(item, {
      x: M + 1.05, y, w: CONTENT_W - 1.2, h: 0.55,
      fontSize: 18, fontFace: FONT, color: TEXT, margin: 0, valign: 'middle',
    })
    if (i < outline.agenda.length - 1) {
      s.addShape(pptx.shapes.RECTANGLE, {
        x: M + 1.05, y: y + 0.72, w: CONTENT_W - 1.2, h: 0.01,
        fill: { color: 'E5E5E5' },
      })
    }
  })
  addFooter(s, 2, total)
}

// —— 3 section ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE },
  })
  addLogo(s)
  s.addText(outline.section.no, {
    x: M, y: 2.4, w: CONTENT_W, h: 0.7,
    fontSize: 48, fontFace: FONT, bold: true, color: RED, margin: 0,
  })
  s.addText(outline.section.title, {
    x: M, y: 3.25, w: CONTENT_W * 0.75, h: 0.7,
    fontSize: 32, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M, y: 4.1, w: 1.8, h: 0.04,
    fill: { color: RED },
  })
  addFooter(s, 3, total)
}

// —— 4 content ——
{
  const s = pptx.addSlide()
  addLogo(s)
  addPageTitle(s, outline.content.title)
  const cardTop = 1.5
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: M, y: cardTop, w: CONTENT_W, h: 4.35,
    fill: { color: LIGHT }, rectRadius: 0.1,
  })
  s.addText(
    outline.content.bullets.map((t, idx) => ({
      text: t,
      options: {
        bullet: false,
        breakLine: idx < outline.content.bullets.length - 1,
        paraSpaceAfter: 14,
      },
    })).map((item, idx) => ({
      ...item,
      text: `${idx + 1}.  ${outline.content.bullets[idx]}`,
    })),
    {
      x: M + 0.45, y: cardTop + 0.4, w: CONTENT_W - 0.9, h: 3.2,
      fontSize: 16, fontFace: FONT, color: TEXT, margin: 0,
    },
  )
  if (outline.content.note) {
    s.addText(outline.content.note, {
      x: M + 0.45, y: cardTop + 3.7, w: CONTENT_W - 0.9, h: 0.4,
      fontSize: 12, fontFace: FONT, color: MUTED, margin: 0,
    })
  }
  addFooter(s, 4, total)
}

// —— 5 two-col ——
{
  const s = pptx.addSlide()
  addLogo(s)
  addPageTitle(s, outline.twoCol.title)
  const colW = (CONTENT_W - GAP) / 2
  const top = 1.5
  const cardH = 4.4
  ;[
    { x: M, block: outline.twoCol.left },
    { x: M + colW + GAP, block: outline.twoCol.right },
  ].forEach(({ x, block }) => {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: top, w: colW, h: cardH,
      fill: { color: LIGHT }, rectRadius: 0.1,
    })
    s.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.35, y: top + 0.4, w: 0.9, h: 0.04,
      fill: { color: RED },
    })
    s.addText(block.heading, {
      x: x + 0.35, y: top + 0.55, w: colW - 0.7, h: 0.45,
      fontSize: 18, fontFace: FONT, bold: true, color: TEXT, margin: 0,
    })
    s.addText(
      block.bullets.map((t, idx) => ({
        text: t,
        options: {
          bullet: true,
          breakLine: idx < block.bullets.length - 1,
          paraSpaceAfter: 12,
        },
      })),
      {
        x: x + 0.35, y: top + 1.25, w: colW - 0.7, h: 2.8,
        fontSize: 15, fontFace: FONT, color: TEXT, margin: 0,
      },
    )
  })
  addFooter(s, 5, total)
}

// —— 6 stats ——
{
  const s = pptx.addSlide()
  addLogo(s)
  addPageTitle(s, outline.stats.title)
  const n = outline.stats.items.length
  const colW = (CONTENT_W - GAP * (n - 1)) / n
  outline.stats.items.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.0, w: colW, h: 3.5,
      fill: { color: LIGHT }, rectRadius: 0.1,
    })
    s.addText(it.value, {
      x: x + 0.2, y: 2.55, w: colW - 0.4, h: 1.2,
      fontSize: 44, fontFace: FONT, bold: true, color: RED, align: 'center', margin: 0,
    })
    s.addText(it.label, {
      x: x + 0.25, y: 3.95, w: colW - 0.5, h: 0.9,
      fontSize: 15, fontFace: FONT, color: TEXT, align: 'center', margin: 0,
    })
  })
  addFooter(s, 6, total)
}

// —— 7 closing ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: H, fill: { color: WHITE },
  })
  if (fs.existsSync(logoPath)) {
    const lw = 1.9
    s.addImage({ path: logoPath, x: (W - lw) / 2, y: 2.15, w: lw, h: lw / 2.506 })
  }
  s.addText(outline.closing || '谢谢', {
    x: M, y: 3.35, w: CONTENT_W, h: 0.7,
    fontSize: 36, fontFace: FONT, bold: true, color: TEXT, align: 'center', margin: 0,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: (W - 1.6) / 2, y: 4.2, w: 1.6, h: 0.04,
    fill: { color: RED },
  })
  s.addText(outline.org, {
    x: M, y: 4.5, w: CONTENT_W, h: 0.4,
    fontSize: 16, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
  s.addText('联系人 / 邮箱（请替换）', {
    x: M, y: 5.1, w: CONTENT_W, h: 0.35,
    fontSize: 13, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
}

await pptx.writeFile({ fileName: out })
console.log(`build-deck: wrote ${path.relative(repoRoot, out)} (${total} slides, redesigned, brand.red #${RED})`)
