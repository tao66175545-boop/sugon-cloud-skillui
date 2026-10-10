#!/usr/bin/env node
/**
 * Sugon 16:9 gov/enterprise deck — P0 redesign (v0.4.5).
 * Theme tokens + parameterized cards; sample ≤45 distinct masters.
 * Original pptxgenjs only. Brand accent #AF1F24 (restrained).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PptxGenJS from 'pptxgenjs'
import {
  COLOR,
  FONT,
  W,
  H,
  MARGIN,
  GUTTER,
  CARD_PAD,
  TITLE_TO_CONTENT,
  LOGO,
  TYPE,
  TICK,
  CW,
  logoPath,
  skillRoot,
  repoRoot,
} from './theme.mjs'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

/** Sample masters — distinct narrative roles (≤45). Parametric variants documented in layouts.md. */
export const LAYOUT_IDS = [
  'cover',
  'cover-band',
  'agenda',
  'agenda-cards',
  'section-number',
  'section-part',
  'exec-summary',
  'key-message',
  'content',
  'cards-2',
  'cards-3',
  'cards-4',
  'stack-2',
  'four-grid',
  'compare-2',
  'options-3',
  'matrix-2x2',
  'kpi-3',
  'kpi-4',
  'table-basic',
  'scorecard',
  'chart-slot',
  'timeline',
  'process-5',
  'roadmap',
  'checklist',
  'action-items',
  'risk-table',
  'gantt-lite',
  'status-rag',
  'pillars-3',
  'numbered-rows',
  'team',
  'faq',
  'decision',
  'quote',
  'closing',
  'appendix',
  'contact',
  'back-cover',
]

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: W, height: H })
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugon Cloud SkillUI'
pptx.title = '曙光云政企汇报母版展览'
pptx.subject = 'sugon-ppt-template v0.4.5 P0 masters'

const M = MARGIN.L
const total = LAYOUT_IDS.length
const builders = {}
function reg(id, fn) {
  builders[id] = fn
}

function logo(s, opts = {}) {
  if (!fs.existsSync(logoPath)) return
  const w = opts.w ?? LOGO.w
  const h = w / LOGO.aspect
  const x = opts.x ?? W - LOGO.inset - w
  const y = opts.y ?? LOGO.inset
  s.addImage({ path: logoPath, x, y, w, h })
}

function foot(s, page) {
  const y = H - MARGIN.B + 0.08
  s.addText('内部资料 · 注意保密', {
    x: M,
    y,
    w: 7,
    h: 0.22,
    fontSize: TYPE.aux,
    fontFace: FONT,
    color: COLOR.muted,
    margin: 0,
  })
  s.addText(`${page} / ${total}`, {
    x: W - MARGIN.R - 1.2,
    y,
    w: 1.2,
    h: 0.22,
    fontSize: TYPE.aux,
    fontFace: FONT,
    color: COLOR.muted,
    align: 'right',
    margin: 0,
  })
}

/** H1 + red tick (4×22pt) + short rule; H1 color #1A1A1A */
function titleBand(s, title) {
  const tickX = M
  const tickY = MARGIN.T
  s.addShape(pptx.shapes.RECTANGLE, {
    x: tickX,
    y: tickY,
    w: TICK.w,
    h: TICK.h,
    fill: { color: COLOR.brand },
  })
  s.addText(title, {
    x: tickX + TICK.w + TICK.gap,
    y: tickY - 0.02,
    w: CW - LOGO.w - 0.4,
    h: TICK.h + 0.08,
    fontSize: TYPE.h1,
    fontFace: FONT,
    bold: true,
    color: COLOR.text,
    margin: 0,
    valign: 'middle',
  })
  const ruleY = tickY + TICK.h + 0.1
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M,
    y: ruleY,
    w: 1.8,
    h: 0.022,
    fill: { color: COLOR.brand },
  })
}

function chip(s, id) {
  const y = MARGIN.T + TICK.h + 0.14
  s.addText(id, {
    x: M,
    y,
    w: 4,
    h: 0.22,
    fontSize: TYPE.aux,
    fontFace: FONT,
    color: COLOR.brand,
    bold: true,
    margin: 0,
  })
}

function contentY() {
  return MARGIN.T + TICK.h + 0.14 + 0.26 + TITLE_TO_CONTENT
}

function card(s, x, y, w, h) {
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: COLOR.card },
    rectRadius: 0.06,
  })
}

function txt(s, t, o) {
  s.addText(t, { fontFace: FONT, margin: 0, color: COLOR.body, ...o })
}

/**
 * Parameterized n-column info cards.
 * H2 default dark (#1A1A1A); set recommended:true on one card to use brand red on that H2 only.
 */
export function layoutCards(s, { n, title, items, y0, page, id }) {
  if (title) {
    logo(s)
    titleBand(s, title)
    if (id) chip(s, id)
  }
  const y = y0 ?? contentY()
  const availH = H - MARGIN.B - y - 0.15
  const colW = (CW - GUTTER * (n - 1)) / n
  items.slice(0, n).forEach((it, i) => {
    const x = M + i * (colW + GUTTER)
    card(s, x, y, colW, availH)
    const h2Color = it.recommended || it.current ? COLOR.brand : COLOR.text
    txt(s, it.title || it.h, {
      x: x + CARD_PAD.H,
      y: y + CARD_PAD.V,
      w: colW - CARD_PAD.H * 2,
      h: 0.4,
      fontSize: TYPE.h2,
      bold: true,
      color: h2Color,
    })
    const lines = it.items || (it.t ? [it.t] : it.body || [])
    lines.forEach((line, j) => {
      txt(s, line, {
        x: x + CARD_PAD.H,
        y: y + CARD_PAD.V + 0.55 + j * 0.55,
        w: colW - CARD_PAD.H * 2,
        h: 0.5,
        fontSize: TYPE.body,
        color: COLOR.body,
      })
    })
  })
  if (page != null) foot(s, page)
}

function layoutKpi(s, { n, items, y0 }) {
  const y = y0 ?? contentY()
  const availH = Math.min(3.6, H - MARGIN.B - y - 0.2)
  const colW = (CW - GUTTER * (n - 1)) / n
  items.slice(0, n).forEach((it, i) => {
    const x = M + i * (colW + GUTTER)
    card(s, x, y, colW, availH)
    const focus = i === 0 // ≤1 red KPI focus per page
    txt(s, it.v, {
      x: x + CARD_PAD.H,
      y: y + 0.55,
      w: colW - CARD_PAD.H * 2,
      h: 1.0,
      fontSize: TYPE.kpi,
      bold: true,
      color: focus ? COLOR.brand : COLOR.text,
      align: 'center',
    })
    txt(s, it.unit || '', {
      x: x + CARD_PAD.H,
      y: y + 1.55,
      w: colW - CARD_PAD.H * 2,
      h: 0.3,
      fontSize: TYPE.kpiUnit,
      color: COLOR.muted,
      align: 'center',
    })
    txt(s, it.l, {
      x: x + CARD_PAD.H,
      y: y + 2.1,
      w: colW - CARD_PAD.H * 2,
      h: 0.8,
      fontSize: TYPE.body,
      color: COLOR.body,
      align: 'center',
    })
  })
}

// ——— masters ———

reg('cover', (s) => {
  logo(s, { x: M, y: LOGO.inset, w: 2.0 })
  chip(s, 'cover')
  txt(s, '曙光云算力与运维能力汇报', {
    x: M,
    y: 2.35,
    w: CW * 0.85,
    h: 0.95,
    fontSize: TYPE.display,
    bold: true,
    color: COLOR.text,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M,
    y: 3.45,
    w: 2.4,
    h: 0.028,
    fill: { color: COLOR.brand },
  })
  txt(s, '面向政企客户的交付进展与下一步计划', {
    x: M,
    y: 3.7,
    w: CW * 0.75,
    h: 0.4,
    fontSize: 16,
    color: COLOR.muted,
  })
  txt(s, '曙光云    2026 年 10 月', {
    x: M,
    y: H - MARGIN.B - 0.35,
    w: CW,
    h: 0.3,
    fontSize: 14,
    color: COLOR.body,
  })
})

reg('cover-band', (s, page) => {
  logo(s)
  chip(s, 'cover-band')
  txt(s, '季度经营与交付复盘', {
    x: M,
    y: 2.5,
    w: CW * 0.8,
    h: 0.7,
    fontSize: TYPE.display,
    bold: true,
    color: COLOR.text,
  })
  txt(s, '结论先行 · 数据支撑 · 明确决策项', {
    x: M,
    y: 3.35,
    w: CW * 0.7,
    h: 0.35,
    fontSize: TYPE.body,
    color: COLOR.muted,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: H - 1.15,
    w: W,
    h: 1.15,
    fill: { color: COLOR.card },
  })
  txt(s, '汇报人：项目组    |    密级：内部', {
    x: M,
    y: H - 0.75,
    w: CW,
    h: 0.35,
    fontSize: TYPE.subtitle,
    color: COLOR.body,
  })
  foot(s, page)
})

reg('agenda', (s, page) => {
  logo(s)
  titleBand(s, '目录')
  chip(s, 'agenda')
  const items = [
    '背景与目标已对齐重点客户诉求',
    '核心能力覆盖调度、监控与集成',
    '本季度三项落地按期完成',
    '下一步聚焦规模化与规范沉淀',
  ]
  const y0 = contentY()
  items.forEach((item, i) => {
    const y = y0 + i * 1.05
    txt(s, String(i + 1).padStart(2, '0'), {
      x: M,
      y,
      w: 0.75,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: COLOR.brand,
      valign: 'middle',
    })
    txt(s, item, {
      x: M + 0.95,
      y,
      w: CW - 1.0,
      h: 0.5,
      fontSize: 16,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('agenda-cards', (s, page) => {
  logo(s)
  titleBand(s, '汇报结构')
  chip(s, 'agenda-cards')
  layoutCards(s, {
    n: 4,
    items: [
      { title: '01 背景', items: ['客户诉求', '边界与假设'] },
      { title: '02 能力', items: ['调度', '监控闭环'] },
      { title: '03 进展', items: ['三项交付', '验收结论'] },
      { title: '04 决策', items: ['扩面清单', '资源诉求'] },
    ],
    y0: contentY(),
  })
  foot(s, page)
})

reg('section-number', (s, page) => {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: COLOR.subtle },
  })
  logo(s)
  chip(s, 'section-number')
  txt(s, '01', {
    x: M,
    y: 2.2,
    w: CW,
    h: 1.2,
    fontSize: TYPE.sectionDigit,
    bold: true,
    color: COLOR.brand,
  })
  txt(s, '能力与进展', {
    x: M,
    y: 3.5,
    w: CW * 0.7,
    h: 0.55,
    fontSize: 28,
    bold: true,
    color: COLOR.text,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M,
    y: 4.2,
    w: 1.6,
    h: 0.028,
    fill: { color: COLOR.brand },
  })
  foot(s, page)
})

reg('section-part', (s, page) => {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: COLOR.subtle },
  })
  logo(s)
  chip(s, 'section-part')
  txt(s, 'PART 02', {
    x: M,
    y: 2.6,
    w: CW,
    h: 0.4,
    fontSize: TYPE.subtitle,
    bold: true,
    color: COLOR.muted,
  })
  txt(s, '风险与资源', {
    x: M,
    y: 3.15,
    w: CW * 0.75,
    h: 0.7,
    fontSize: 32,
    bold: true,
    color: COLOR.text,
  })
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M,
    y: 4.0,
    w: 2.2,
    h: 0.06,
    fill: { color: COLOR.card },
  })
  foot(s, page)
})

reg('exec-summary', (s, page) => {
  logo(s)
  titleBand(s, '执行摘要：本轮只需拍板三件事')
  chip(s, 'exec-summary')
  const y = contentY()
  const leftW = CW * 0.55
  const rightW = CW * 0.42
  const rightX = M + leftW + GUTTER
  txt(s, '统一调度、运维闭环与规范沉淀已具备规模化条件。建议确认试点扩面清单，锁定运维编制，并将规范纳入交付基线。', {
    x: M,
    y,
    w: leftW,
    h: 3.8,
    fontSize: TYPE.body,
    color: COLOR.body,
    valign: 'top',
  })
  card(s, rightX, y, rightW, 4.2)
  ;['确认试点扩面清单', '锁定运维编制与预算', '批准规范纳入基线'].forEach((t, i) => {
    txt(s, String(i + 1).padStart(2, '0'), {
      x: rightX + CARD_PAD.H,
      y: y + CARD_PAD.V + i * 1.15,
      w: 0.55,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: COLOR.brand,
    })
    txt(s, t, {
      x: rightX + CARD_PAD.H + 0.65,
      y: y + CARD_PAD.V + i * 1.15,
      w: rightW - CARD_PAD.H * 2 - 0.65,
      h: 0.55,
      fontSize: TYPE.body,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('key-message', (s, page) => {
  logo(s)
  titleBand(s, '一句话结论')
  chip(s, 'key-message')
  card(s, M, contentY(), CW, 4.0)
  txt(s, '本季度交付按期完成，下季度应以「扩面 + 规范入基线」为主线，而不是再开新的试点课题。', {
    x: M + 0.5,
    y: contentY() + 1.2,
    w: CW - 1.0,
    h: 1.6,
    fontSize: 20,
    bold: true,
    color: COLOR.text,
    align: 'center',
    valign: 'middle',
  })
  foot(s, page)
})

reg('content', (s, page) => {
  logo(s)
  titleBand(s, '中密度正文：现状已具备扩面条件')
  chip(s, 'content')
  const y = contentY()
  const bullets = [
    '调度链路已在三个重点客户侧稳定运行超过一个季度。',
    '告警到复盘的闭环时长从 48 小时压到 12 小时以内。',
    '规范文档已完成评审，可直接纳入项目交付检查单。',
    '剩余缺口主要在编制与跨部门协同，而非技术能力。',
  ]
  bullets.forEach((t, i) => {
    const yy = y + i * 0.85
    s.addShape(pptx.shapes.OVAL, {
      x: M,
      y: yy + 0.12,
      w: 0.14,
      h: 0.14,
      fill: { color: COLOR.brand },
    })
    txt(s, t, {
      x: M + 0.4,
      y: yy,
      w: CW - 0.4,
      h: 0.7,
      fontSize: TYPE.body,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('cards-2', (s, page) => {
  layoutCards(s, {
    n: 2,
    title: '双栏能力对照',
    id: 'cards-2',
    page,
    items: [
      { title: '调度与编排', items: ['统一入口', '策略可配置', '审计可追溯'] },
      { title: '运维闭环', items: ['告警收敛', '值班协同', '复盘沉淀'] },
    ],
  })
})

reg('cards-3', (s, page) => {
  layoutCards(s, {
    n: 3,
    title: '三项落地按期完成',
    id: 'cards-3',
    page,
    items: [
      { title: '试点 A', items: ['已验收', '可复制'] },
      { title: '试点 B', items: ['已验收', '待扩面'], recommended: true },
      { title: '规范包', items: ['已评审', '入基线'] },
    ],
  })
})

reg('cards-4', (s, page) => {
  layoutCards(s, {
    n: 4,
    title: '四条工作流并行推进',
    id: 'cards-4',
    page,
    items: [
      { title: '接入', items: ['清单冻结'] },
      { title: '联调', items: ['环境就绪'] },
      { title: '验收', items: ['纪要完成'] },
      { title: '移交', items: ['值班接手'] },
    ],
  })
})

reg('stack-2', (s, page) => {
  logo(s)
  titleBand(s, '上下双栈：问题与对策')
  chip(s, 'stack-2')
  const y = contentY()
  const h = (H - MARGIN.B - y - GUTTER - 0.1) / 2
  card(s, M, y, CW, h)
  txt(s, '问题', {
    x: M + CARD_PAD.H,
    y: y + CARD_PAD.V,
    w: CW - CARD_PAD.H * 2,
    h: 0.35,
    fontSize: TYPE.h2,
    bold: true,
    color: COLOR.text,
  })
  txt(s, '跨部门协同慢，导致扩面节奏受编制约束而非技术约束。', {
    x: M + CARD_PAD.H,
    y: y + 0.55,
    w: CW - CARD_PAD.H * 2,
    h: 0.8,
    fontSize: TYPE.body,
    color: COLOR.body,
  })
  const y2 = y + h + GUTTER
  card(s, M, y2, CW, h)
  txt(s, '对策', {
    x: M + CARD_PAD.H,
    y: y2 + CARD_PAD.V,
    w: CW - CARD_PAD.H * 2,
    h: 0.35,
    fontSize: TYPE.h2,
    bold: true,
    color: COLOR.text,
  })
  txt(s, '以联合编制包锁定责任人，把规范检查前置到立项门禁。', {
    x: M + CARD_PAD.H,
    y: y2 + 0.55,
    w: CW - CARD_PAD.H * 2,
    h: 0.8,
    fontSize: TYPE.body,
    color: COLOR.body,
  })
  foot(s, page)
})

reg('four-grid', (s, page) => {
  logo(s)
  titleBand(s, '四宫格：能力切片')
  chip(s, 'four-grid')
  const cells = [
    { h: '接入', t: '标准 API 与账号体系' },
    { h: '调度', t: '策略与配额统一' },
    { h: '观测', t: '指标、日志、链路' },
    { h: '治理', t: '规范、审计、移交' },
  ]
  const y0 = contentY()
  const cols = 2
  const rows = 2
  const colW = (CW - GUTTER) / cols
  const rowH = (H - MARGIN.B - y0 - GUTTER - 0.1) / rows
  cells.forEach((c, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = M + col * (colW + GUTTER)
    const y = y0 + row * (rowH + GUTTER)
    card(s, x, y, colW, rowH)
    txt(s, c.h, {
      x: x + CARD_PAD.H,
      y: y + CARD_PAD.V,
      w: colW - CARD_PAD.H * 2,
      h: 0.4,
      fontSize: TYPE.h2,
      bold: true,
      color: COLOR.text,
    })
    txt(s, c.t, {
      x: x + CARD_PAD.H,
      y: y + 0.7,
      w: colW - CARD_PAD.H * 2,
      h: rowH - 1.0,
      fontSize: TYPE.body,
      color: COLOR.body,
    })
  })
  foot(s, page)
})

reg('compare-2', (s, page) => {
  logo(s)
  titleBand(s, '改造前后对照')
  chip(s, 'compare-2')
  layoutCards(s, {
    n: 2,
    items: [
      { title: '改造前', items: ['多入口并行', '告警分散', '规范靠人口口相传'] },
      { title: '改造后', items: ['统一调度入口', '闭环可度量', '检查单可复制'], recommended: true },
    ],
    y0: contentY(),
  })
  foot(s, page)
})

reg('options-3', (s, page) => {
  layoutCards(s, {
    n: 3,
    title: '三方案比选',
    id: 'options-3',
    page,
    items: [
      { title: '方案 A 保守', items: ['低风险', '扩面慢'] },
      { title: '方案 B 推荐', items: ['均衡节奏', '可复制'], recommended: true },
      { title: '方案 C 激进', items: ['快', '编制压力大'] },
    ],
  })
})

reg('matrix-2x2', (s, page) => {
  logo(s)
  titleBand(s, '2×2 矩阵（统一 Token）')
  chip(s, 'matrix-2x2')
  const labels = [
    { h: '高价值 · 易落地', t: '优先扩面' },
    { h: '高价值 · 难落地', t: '专项攻坚' },
    { h: '低价值 · 易落地', t: '排期靠后' },
    { h: '低价值 · 难落地', t: '暂缓' },
  ]
  const y0 = contentY()
  const colW = (CW - GUTTER) / 2
  const rowH = (H - MARGIN.B - y0 - GUTTER - 0.1) / 2
  labels.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + GUTTER)
    const y = y0 + row * (rowH + GUTTER)
    card(s, x, y, colW, rowH)
    txt(s, c.h, {
      x: x + CARD_PAD.H,
      y: y + CARD_PAD.V,
      w: colW - CARD_PAD.H * 2,
      h: 0.4,
      fontSize: TYPE.h2,
      bold: true,
      color: COLOR.text,
    })
    txt(s, c.t, {
      x: x + CARD_PAD.H,
      y: y + 0.75,
      w: colW - CARD_PAD.H * 2,
      h: 0.5,
      fontSize: TYPE.body,
      color: COLOR.body,
    })
  })
  foot(s, page)
})

reg('kpi-3', (s, page) => {
  logo(s)
  titleBand(s, '关键指标（三）')
  chip(s, 'kpi-3')
  layoutKpi(s, {
    n: 3,
    items: [
      { v: '12h', unit: '闭环时长', l: '告警到复盘' },
      { v: '3', unit: '家', l: '重点客户稳定运行' },
      { v: '100%', unit: '', l: '本季里程碑按期' },
    ],
  })
  foot(s, page)
})

reg('kpi-4', (s, page) => {
  logo(s)
  titleBand(s, '关键指标（四）')
  chip(s, 'kpi-4')
  layoutKpi(s, {
    n: 4,
    items: [
      { v: '98%', l: '调度成功率' },
      { v: '12h', l: '闭环时长' },
      { v: '4', l: '规范检查项' },
      { v: '2', l: '待拍板事项' },
    ],
  })
  foot(s, page)
})

reg('table-basic', (s, page) => {
  logo(s)
  titleBand(s, '交付清单')
  chip(s, 'table-basic')
  s.addTable(
    [
      [
        { text: '事项', options: { bold: true, color: COLOR.text } },
        { text: '负责人', options: { bold: true, color: COLOR.text } },
        { text: '状态', options: { bold: true, color: COLOR.text } },
      ],
      ['调度试点扩面', '张三', '进行中'],
      ['运维编制包', '李四', '待批'],
      ['规范入基线', '王五', '已完成'],
    ],
    {
      x: M,
      y: contentY(),
      w: CW,
      h: 3.8,
      colW: [CW * 0.45, CW * 0.25, CW * 0.3],
      border: [
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
      ],
      fontFace: FONT,
      fontSize: TYPE.body,
      color: COLOR.body,
      align: 'left',
      valign: 'middle',
      fill: { color: COLOR.white },
    },
  )
  // header wash via small shape behind first row is hard in pptxgen; use card hint
  foot(s, page)
})

reg('scorecard', (s, page) => {
  logo(s)
  titleBand(s, '评分卡')
  chip(s, 'scorecard')
  s.addTable(
    [
      [
        { text: '维度', options: { bold: true, color: COLOR.text } },
        { text: '得分', options: { bold: true, color: COLOR.text } },
        { text: '说明', options: { bold: true, color: COLOR.text } },
      ],
      ['稳定性', 'A', '连续一季无 P1'],
      ['可复制性', 'B+', '缺编制包'],
      ['规范完备度', 'A-', '已评审待入库'],
    ],
    {
      x: M,
      y: contentY(),
      w: CW,
      h: 3.8,
      colW: [CW * 0.28, CW * 0.18, CW * 0.54],
      border: [
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
      ],
      fontFace: FONT,
      fontSize: TYPE.body,
      color: COLOR.body,
      align: 'left',
      valign: 'middle',
    },
  )
  foot(s, page)
})

reg('chart-slot', (s, page) => {
  logo(s)
  titleBand(s, '图表槽位（规格示意）')
  chip(s, 'chart-slot')
  const y = contentY()
  card(s, M, y, CW, 4.0)
  txt(s, 'Chart slot', {
    x: M,
    y: y + 1.3,
    w: CW,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: COLOR.muted,
    align: 'center',
  })
  txt(s, '建议宽高：内容区满宽 × 3.6–4.0"；标题区在上，注释 10–11pt 在下', {
    x: M + 0.5,
    y: y + 2.0,
    w: CW - 1.0,
    h: 0.6,
    fontSize: TYPE.aux,
    color: COLOR.muted,
    align: 'center',
  })
  foot(s, page)
})

reg('timeline', (s, page) => {
  logo(s)
  titleBand(s, '时间线')
  chip(s, 'timeline')
  const steps = ['立项', '试点', '验收', '扩面', '入基线']
  const y = contentY() + 1.2
  const colW = (CW - GUTTER * (steps.length - 1)) / steps.length
  s.addShape(pptx.shapes.RECTANGLE, {
    x: M + colW / 2,
    y: y + 0.18,
    w: CW - colW,
    h: 0.04,
    fill: { color: COLOR.line },
  })
  steps.forEach((t, i) => {
    const x = M + i * (colW + GUTTER)
    s.addShape(pptx.shapes.OVAL, {
      x: x + colW / 2 - 0.12,
      y: y,
      w: 0.28,
      h: 0.28,
      fill: { color: i === 3 ? COLOR.brand : COLOR.text },
    })
    txt(s, t, {
      x,
      y: y + 0.55,
      w: colW,
      h: 0.4,
      fontSize: TYPE.body,
      color: COLOR.body,
      align: 'center',
    })
  })
  foot(s, page)
})

reg('process-5', (s, page) => {
  logo(s)
  titleBand(s, '五步流程')
  chip(s, 'process-5')
  const steps = ['采集', '研判', '处置', '验证', '复盘']
  const y = contentY()
  const colW = (CW - GUTTER * 4) / 5
  steps.forEach((t, i) => {
    const x = M + i * (colW + GUTTER)
    card(s, x, y, colW, 3.8)
    txt(s, String(i + 1), {
      x,
      y: y + 0.8,
      w: colW,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: i === 2 ? COLOR.brand : COLOR.text,
      align: 'center',
    })
    txt(s, t, {
      x: x + 0.1,
      y: y + 1.8,
      w: colW - 0.2,
      h: 0.5,
      fontSize: TYPE.h2,
      bold: true,
      color: COLOR.text,
      align: 'center',
    })
  })
  foot(s, page)
})

reg('roadmap', (s, page) => {
  logo(s)
  titleBand(s, '路线图（季度）')
  chip(s, 'roadmap')
  const rows = [
    { q: 'Q4', t: '扩面 3 家 · 规范入库' },
    { q: 'Q1', t: '联合编制包落地' },
    { q: 'Q2', t: '自动化检查上线' },
  ]
  const y0 = contentY()
  rows.forEach((r, i) => {
    const y = y0 + i * 1.25
    card(s, M, y, CW, 1.1)
    txt(s, r.q, {
      x: M + CARD_PAD.H,
      y: y + 0.3,
      w: 1.2,
      h: 0.45,
      fontSize: TYPE.h2,
      bold: true,
      color: COLOR.brand,
    })
    txt(s, r.t, {
      x: M + 1.6,
      y: y + 0.3,
      w: CW - 2.0,
      h: 0.45,
      fontSize: TYPE.body,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('checklist', (s, page) => {
  logo(s)
  titleBand(s, '检查清单')
  chip(s, 'checklist')
  const items = [
    'Logo 与识别红仅用于品牌位与关键结论',
    '正文对比度达到投影可读（#333 on 白 / 灰卡）',
    '同稿只使用一种章节语法',
    '不嵌入字体；导出禁用符号字体与雅黑类字体',
  ]
  const y0 = contentY()
  items.forEach((t, i) => {
    const y = y0 + i * 0.9
    card(s, M, y, CW, 0.75)
    txt(s, '[ ]', {
      x: M + CARD_PAD.H,
      y: y + 0.18,
      w: 0.4,
      h: 0.4,
      fontSize: 16,
      color: COLOR.text,
    })
    txt(s, t, {
      x: M + 0.7,
      y: y + 0.18,
      w: CW - 1.0,
      h: 0.4,
      fontSize: TYPE.body,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('action-items', (s, page) => {
  logo(s)
  titleBand(s, '行动项')
  chip(s, 'action-items')
  s.addTable(
    [
      [
        { text: '任务', options: { bold: true, color: COLOR.text } },
        { text: '责任人', options: { bold: true, color: COLOR.text } },
        { text: '截止日期', options: { bold: true, color: COLOR.text } },
      ],
      ['输出扩面清单', '张三', '10-20'],
      ['编制包评审', '李四', '10-25'],
      ['规范合入基线', '王五', '10-30'],
    ],
    {
      x: M,
      y: contentY(),
      w: CW,
      h: 3.6,
      colW: [CW * 0.45, CW * 0.25, CW * 0.3],
      border: [
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
      ],
      fontFace: FONT,
      fontSize: TYPE.body,
      color: COLOR.body,
      align: 'left',
      valign: 'middle',
    },
  )
  foot(s, page)
})

reg('risk-table', (s, page) => {
  logo(s)
  titleBand(s, '风险与对策')
  chip(s, 'risk-table')
  s.addTable(
    [
      [
        { text: '风险', options: { bold: true, color: COLOR.text } },
        { text: '等级', options: { bold: true, color: COLOR.text } },
        { text: '对策', options: { bold: true, color: COLOR.text } },
      ],
      [
        { text: '编制不到位', options: { color: COLOR.body } },
        { text: '高', options: { color: COLOR.brand, bold: true } },
        { text: '联合编制包提前锁定', options: { color: COLOR.body } },
      ],
      [
        { text: '客户窗口冲突', options: { color: COLOR.body } },
        { text: '中', options: { color: COLOR.warn, bold: true } },
        { text: '错峰扩面日历', options: { color: COLOR.body } },
      ],
      [
        { text: '规范未入库', options: { color: COLOR.body } },
        { text: '低', options: { color: COLOR.ok, bold: true } },
        { text: '本迭代合入检查单', options: { color: COLOR.body } },
      ],
    ],
    {
      x: M,
      y: contentY(),
      w: CW,
      h: 3.8,
      colW: [CW * 0.32, CW * 0.15, CW * 0.53],
      border: [
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
        { pt: 0.5, color: COLOR.line },
      ],
      fontFace: FONT,
      fontSize: TYPE.body,
      align: 'left',
      valign: 'middle',
    },
  )
  foot(s, page)
})

reg('gantt-lite', (s, page) => {
  logo(s)
  titleBand(s, '简易甘特')
  chip(s, 'gantt-lite')
  const rows = [
    { name: '扩面准备', span: [0, 2] },
    { name: '联调验收', span: [1, 3] },
    { name: '规范入库', span: [2, 4] },
  ]
  const y0 = contentY()
  const barMax = CW * 0.62
  const labelW = CW * 0.32
  rows.forEach((r, i) => {
    const y = y0 + i * 1.15
    txt(s, r.name, {
      x: M,
      y: y + 0.25,
      w: labelW,
      h: 0.4,
      fontSize: TYPE.body,
      color: COLOR.body,
    })
    card(s, M + labelW, y, barMax, 0.85)
    const [a, b] = r.span
    const x = M + labelW + (a / 4) * barMax
    const w = ((b - a) / 4) * barMax
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: y + 0.22,
      w,
      h: 0.4,
      fill: { color: i === 0 ? COLOR.brand : COLOR.text },
      rectRadius: 0.04,
    })
  })
  foot(s, page)
})

reg('status-rag', (s, page) => {
  logo(s)
  titleBand(s, '状态总览（语义色克制）')
  chip(s, 'status-rag')
  layoutCards(s, {
    n: 3,
    items: [
      { title: '正常', items: ['调度成功率达标'] },
      { title: '关注', items: ['两家窗口冲突'] },
      { title: '阻断', items: ['编制包未批'] },
    ],
    y0: contentY(),
  })
  // semantic tags
  const y = contentY() + 3.5
  ;[
    { t: '正常', c: COLOR.ok },
    { t: '关注', c: COLOR.warn },
    { t: '阻断', c: COLOR.brand },
  ].forEach((it, i) => {
    const x = M + i * ((CW - GUTTER * 2) / 3 + GUTTER)
    txt(s, it.t, {
      x,
      y,
      w: (CW - GUTTER * 2) / 3,
      h: 0.35,
      fontSize: TYPE.aux,
      bold: true,
      color: it.c,
      align: 'center',
    })
  })
  foot(s, page)
})

reg('pillars-3', (s, page) => {
  layoutCards(s, {
    n: 3,
    title: '三根支柱',
    id: 'pillars-3',
    page,
    items: [
      { title: '统一调度', items: ['入口', '策略', '审计'] },
      { title: '运维闭环', items: ['告警', '值班', '复盘'] },
      { title: '规范基线', items: ['检查单', '模板', '培训'] },
    ],
  })
})

reg('numbered-rows', (s, page) => {
  logo(s)
  titleBand(s, '编号列表（中密度）')
  chip(s, 'numbered-rows')
  const items = [
    '把扩面清单从「意向」改成「可排期客户」',
    '编制包与值班表一并提交评审',
    '规范检查前置到立项门禁',
    '下季度不再新开无关试点课题',
  ]
  const y0 = contentY()
  items.forEach((t, i) => {
    const y = y0 + i * 0.95
    txt(s, String(i + 1).padStart(2, '0'), {
      x: M,
      y,
      w: 0.7,
      h: 0.55,
      fontSize: 20,
      bold: true,
      color: COLOR.brand,
      valign: 'middle',
    })
    txt(s, t, {
      x: M + 0.9,
      y,
      w: CW - 0.9,
      h: 0.55,
      fontSize: TYPE.body,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('team', (s, page) => {
  layoutCards(s, {
    n: 3,
    title: '角色与分工',
    id: 'team',
    page,
    items: [
      { title: '项目经理', items: ['节奏', '决策事项'] },
      { title: '交付负责人', items: ['验收', '移交'] },
      { title: '运维负责人', items: ['值班', '闭环'] },
    ],
  })
})

reg('faq', (s, page) => {
  logo(s)
  titleBand(s, '常见问题')
  chip(s, 'faq')
  const qa = [
    { q: '是否必须换母版？', a: '有官方 .potx 优先用官方；否则用本通用母版。' },
    { q: '能否嵌入字体？', a: '默认不嵌入，便于 WPS / 信创环境打开。' },
    { q: '红色怎么用？', a: '仅品牌、关键数字、当前步/推荐项。' },
  ]
  const y0 = contentY()
  qa.forEach((item, i) => {
    const y = y0 + i * 1.25
    txt(s, `Q：${item.q}`, {
      x: M,
      y,
      w: CW,
      h: 0.35,
      fontSize: TYPE.h2,
      bold: true,
      color: COLOR.text,
    })
    txt(s, `A：${item.a}`, {
      x: M,
      y: y + 0.4,
      w: CW,
      h: 0.4,
      fontSize: TYPE.body,
      color: COLOR.body,
    })
  })
  foot(s, page)
})

reg('decision', (s, page) => {
  logo(s)
  titleBand(s, '请决策')
  chip(s, 'decision')
  layoutCards(s, {
    n: 3,
    items: [
      { title: '批准扩面清单', items: ['本周内'] },
      { title: '批准编制包', items: ['本月内'], recommended: true },
      { title: '规范入基线', items: ['随下个迭代'] },
    ],
    y0: contentY(),
  })
  foot(s, page)
})

reg('quote', (s, page) => {
  logo(s)
  titleBand(s, '引用')
  chip(s, 'quote')
  card(s, M, contentY(), CW, 4.0)
  txt(s, '「先把可复制的做扎实，再谈铺开。」', {
    x: M + 0.6,
    y: contentY() + 1.2,
    w: CW - 1.2,
    h: 1.0,
    fontSize: 22,
    bold: true,
    color: COLOR.text,
    align: 'center',
  })
  txt(s, '— 内部评审纪要（样例）', {
    x: M + 0.6,
    y: contentY() + 2.5,
    w: CW - 1.2,
    h: 0.4,
    fontSize: TYPE.subtitle,
    color: COLOR.muted,
    align: 'center',
  })
  foot(s, page)
})

reg('closing', (s, page) => {
  logo(s)
  titleBand(s, '小结')
  chip(s, 'closing')
  const points = [
    '本季交付按期，能力已具备扩面条件。',
    '下季主线：扩面 + 规范入基线。',
    '请批准扩面清单与编制包。',
  ]
  const y0 = contentY()
  points.forEach((t, i) => {
    const y = y0 + i * 1.1
    txt(s, String(i + 1).padStart(2, '0'), {
      x: M,
      y,
      w: 0.7,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: COLOR.brand,
    })
    txt(s, t, {
      x: M + 0.9,
      y,
      w: CW - 0.9,
      h: 0.5,
      fontSize: 16,
      color: COLOR.body,
      valign: 'middle',
    })
  })
  foot(s, page)
})

reg('appendix', (s, page) => {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: COLOR.subtle },
  })
  logo(s)
  chip(s, 'appendix')
  txt(s, '附录', {
    x: M,
    y: 3.0,
    w: CW,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: COLOR.text,
    align: 'center',
  })
  txt(s, '补充数据与原始材料', {
    x: M,
    y: 3.8,
    w: CW,
    h: 0.4,
    fontSize: TYPE.body,
    color: COLOR.muted,
    align: 'center',
  })
  foot(s, page)
})

reg('contact', (s, page) => {
  logo(s)
  titleBand(s, '联系方式')
  chip(s, 'contact')
  card(s, M + CW * 0.18, contentY(), CW * 0.64, 3.6)
  txt(s, '曙光云项目组', {
    x: M + CW * 0.18,
    y: contentY() + 0.9,
    w: CW * 0.64,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLOR.text,
    align: 'center',
  })
  txt(s, '邮箱：contact@example.com', {
    x: M + CW * 0.18,
    y: contentY() + 1.7,
    w: CW * 0.64,
    h: 0.4,
    fontSize: TYPE.body,
    color: COLOR.muted,
    align: 'center',
  })
  txt(s, '电话：000-0000-0000', {
    x: M + CW * 0.18,
    y: contentY() + 2.3,
    w: CW * 0.64,
    h: 0.4,
    fontSize: TYPE.body,
    color: COLOR.muted,
    align: 'center',
  })
  foot(s, page)
})

reg('back-cover', (s) => {
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: COLOR.subtle },
  })
  if (fs.existsSync(logoPath)) {
    const lw = 2.0
    s.addImage({
      path: logoPath,
      x: (W - lw) / 2,
      y: 2.5,
      w: lw,
      h: lw / LOGO.aspect,
    })
  }
  chip(s, 'back-cover')
  txt(s, '曙光云', {
    x: M,
    y: 4.1,
    w: CW,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLOR.text,
    align: 'center',
  })
  txt(s, '内部资料 · 注意保密', {
    x: M,
    y: 4.7,
    w: CW,
    h: 0.35,
    fontSize: TYPE.subtitle,
    color: COLOR.muted,
    align: 'center',
  })
})

const missing = LAYOUT_IDS.filter((id) => !builders[id])
if (missing.length) {
  console.error('missing builders:', missing.join(','))
  process.exit(1)
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isMain) {
  LAYOUT_IDS.forEach((id, idx) => {
    const s = pptx.addSlide()
    builders[id](s, idx + 1)
  })

  const out = path.resolve(skillRoot, arg('out', 'examples/sample-deck.pptx'))
  fs.mkdirSync(path.dirname(out), { recursive: true })
  await pptx.writeFile({ fileName: out })
  console.log(
    `build-deck: wrote ${path.relative(repoRoot, out)} (${total} masters, brand.red #${COLOR.brand})`,
  )
  console.log('layout-ids: ' + LAYOUT_IDS.join(','))
}
