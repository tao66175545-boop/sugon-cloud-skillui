#!/usr/bin/env node
/**
 * Build a 16:9 Sugon gov/enterprise sample deck with pptxgenjs.
 * Colors from tokens/sugon.brand.json (brand.red) — not UI primary.
 *
 *   node scripts/build-deck.mjs [--out examples/sample-deck.pptx] [--outline path.json]
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
const WHITE = 'FFFFFF'

const FONT = 'Source Han Sans SC'
const logoPath = path.join(skillRoot, 'assets/logo.png')

const defaultOutline = {
  title: '曙光云产品能力汇报',
  subtitle: '通用 16:9 模板样例（无官方母版时的草稿）',
  org: '曙光云',
  date: '2026 年 10 月',
  agenda: ['背景与目标', '核心能力', '落地进展', '下一步计划'],
  sections: [
    {
      title: '核心能力已覆盖算力调度与运维闭环',
      bullets: [
        '统一纳管异构算力资源，支持按项目配额与审计',
        '监控告警与工单闭环，平均故障响应时长下降',
        '提供标准 API，便于业务系统集成',
      ],
      note: '数据为样例占位，正式汇报请替换为真实指标。',
    },
    {
      title: '本季度三项落地进展按期完成',
      bullets: [
        '完成重点客户试点环境交付',
        '内网技能与品牌规范可版本化复用',
        '培训材料与操作手册已归档',
      ],
    },
  ],
  closing: '谢谢 · 请指正',
}

const outlinePath = arg('outline', '')
const outline = outlinePath
  ? JSON.parse(fs.readFileSync(path.resolve(outlinePath), 'utf8'))
  : defaultOutline

const out = path.resolve(skillRoot, arg('out', 'examples/sample-deck.pptx'))
fs.mkdirSync(path.dirname(out), { recursive: true })

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: 13.333, height: 7.5 })
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugon Cloud SkillUI'
pptx.title = outline.title
pptx.subject = 'sugon-ppt-template sample'

function addFooter(slide, page, total) {
  slide.addText('内部资料 · 注意保密', {
    x: 0.5, y: 7.1, w: 8, h: 0.25,
    fontSize: 10, fontFace: FONT, color: MUTED, margin: 0,
  })
  slide.addText(`${page} / ${total}`, {
    x: 11.5, y: 7.1, w: 1.3, h: 0.25,
    fontSize: 10, fontFace: FONT, color: MUTED, align: 'right', margin: 0,
  })
}

function addLogo(slide, x = 11.2, y = 0.35, w = 1.6) {
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x, y, w, h: w / 2.506 })
  }
}

const total = 2 + outline.sections.length + 1 // cover agenda contents closing

// —— cover ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } })
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 7.15, w: 13.333, h: 0.35, fill: { color: RED } })
  addLogo(s, 0.55, 0.45, 2.0)
  s.addText(outline.title, {
    x: 0.55, y: 2.4, w: 12.2, h: 1.1,
    fontSize: 36, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addText(outline.subtitle, {
    x: 0.55, y: 3.6, w: 12.2, h: 0.45,
    fontSize: 18, fontFace: FONT, color: MUTED, margin: 0,
  })
  s.addText(`${outline.org}  ·  ${outline.date}`, {
    x: 0.55, y: 5.5, w: 12.2, h: 0.4,
    fontSize: 14, fontFace: FONT, color: TEXT, margin: 0,
  })
}

// —— agenda ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: RED } })
  addLogo(s)
  s.addText('目录', {
    x: 0.55, y: 0.45, w: 10, h: 0.55,
    fontSize: 28, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  // numbered without wingdings
  s.addText(
    outline.agenda.map((t, i) => ({
      text: `${i + 1}.  ${t}`,
      options: { breakLine: true, paraSpaceAfter: 10 },
    })),
    {
      x: 0.7, y: 1.5, w: 11.5, h: 4.5,
      fontSize: 20, fontFace: FONT, color: TEXT, margin: 0,
    },
  )
  addFooter(s, 2, total)
}

// —— content slides ——
outline.sections.forEach((sec, idx) => {
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: RED } })
  addLogo(s)
  s.addText(sec.title, {
    x: 0.55, y: 0.4, w: 10.3, h: 0.9,
    fontSize: 24, fontFace: FONT, bold: true, color: TEXT, margin: 0,
  })
  s.addText(
    sec.bullets.map((t) => ({
      text: t,
      options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 8 }, // • U+2022
    })),
    {
      x: 0.7, y: 1.5, w: 11.8, h: 4.2,
      fontSize: 18, fontFace: FONT, color: TEXT, margin: 0,
    },
  )
  if (sec.note) {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.55, y: 6.15, w: 12.2, h: 0.7,
      fill: { color: LIGHT }, rectRadius: 0.08,
    })
    s.addText(sec.note, {
      x: 0.7, y: 6.25, w: 11.9, h: 0.5,
      fontSize: 12, fontFace: FONT, color: MUTED, margin: 0,
    })
  }
  addFooter(s, 3 + idx, total)
})

// —— closing ——
{
  const s = pptx.addSlide()
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } })
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 0.2, fill: { color: RED } })
  addLogo(s, 5.85, 2.0, 1.8)
  s.addText(outline.closing || '谢谢', {
    x: 0.5, y: 3.3, w: 12.3, h: 0.8,
    fontSize: 36, fontFace: FONT, bold: true, color: TEXT, align: 'center', margin: 0,
  })
  s.addText(outline.org, {
    x: 0.5, y: 4.3, w: 12.3, h: 0.4,
    fontSize: 16, fontFace: FONT, color: MUTED, align: 'center', margin: 0,
  })
  addFooter(s, total, total)
}

await pptx.writeFile({ fileName: out })
console.log(`build-deck: wrote ${path.relative(repoRoot, out)} (${total} slides, brand.red #${RED})`)
