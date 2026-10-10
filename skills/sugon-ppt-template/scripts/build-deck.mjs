#!/usr/bin/env node
/**
 * Sugon 16:9 gov/enterprise deck — original layouts only (v0.4.4 ~100).
 * No proprietary skill code. Brand accents = short tick + short rule.
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
const TEXT = '171717', MUTED = '525252', LIGHT = 'F4F4F5', SUBTLE = 'FAFAFA', WHITE = 'FFFFFF', LINE = 'E5E5E5'
const FONT = 'Source Han Sans SC'
const logoPath = path.join(skillRoot, 'assets/logo.png')
const M = 0.65, W = 13.333, H = 7.5, CW = W - 2 * M, GAP = 0.3

export const LAYOUT_IDS = [
  'cover', 'cover-split', 'agenda', 'toc-two-col', 'section', 'section-band', 'exec-summary', 'content', 'content-two-level', 'two-col', 'three-col', 'four-grid', 'icon-rows', 'callout', 'compare', 'pros-cons', 'options-3', 'matrix-2x2', 'swot', 'table', 'kpi-3', 'kpi-4', 'kpi-row', 'chart-frame', 'bridge-frame', 'timeline', 'process-h', 'process-v', 'roadmap', 'risk', 'next-steps', 'team', 'quote', 'closing', 'appendix', 'cover-center', 'cover-band', 'cover-logo-right', 'agenda-5', 'agenda-cards', 'toc-dense', 'section-right', 'section-minimal', 'chapter-list', 'key-message', 'bullets-tight', 'two-col-header', 'three-icon', 'five-col', 'six-grid', 'highlight-left', 'highlight-right', 'before-after', 'vs-score', 'criteria-table', 'pricing-3', 'pricing-table', 'faq', 'checklist', 'status-rag', 'okr', 'smart-goals', 'pestle', 'porter-lite', 'bcg-matrix', 'ansoff', 'value-chain', 'stakeholder', 'org-3', 'org-tree', 'raci', 'kanban-3', 'gantt-lite', 'gantt-miles', 'funnel-4', 'pyramid-4', 'cycle-4', 'fishbone-lite', 'force-field', 'risk-heat', 'heat-lite', 'big-number', 'big-number-pair', 'metric-bars', 'bar-frame', 'pie-frame', 'line-frame', 'combo-frame', 'map-ph', 'photo-caption', 'photo-grid-2', 'quote-attr', 'testimonial-2', 'decision', 'signoff', 'qa', 'glossary', 'refs-sources', 'contact-card', 'back-cover']

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'LAYOUT_WIDE', width: W, height: H })
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugon Cloud SkillUI'
pptx.title = '曙光云政企汇报版式全集'
pptx.subject = 'sugon-ppt-template v0.4.4 showcase'

function logo(s, x = W - M - 1.5, y = 0.36, w = 1.5) {
  if (fs.existsSync(logoPath)) s.addImage({ path: logoPath, x, y, w, h: w / 2.506 })
}
function foot(s, page, total) {
  s.addText('内部资料 · 注意保密', { x: M, y: H - 0.36, w: 7, h: 0.2, fontSize: 10, fontFace: FONT, color: MUTED, margin: 0 })
  s.addText(`${page} / ${total}`, { x: W - M - 1.2, y: H - 0.36, w: 1.2, h: 0.2, fontSize: 10, fontFace: FONT, color: MUTED, align: 'right', margin: 0 })
}
function titleBand(s, title) {
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 0.46, w: 0.07, h: 0.4, fill: { color: RED } })
  s.addText(title, { x: M + 0.2, y: 0.36, w: CW - 1.9, h: 0.65, fontSize: 22, fontFace: FONT, bold: true, color: TEXT, margin: 0, valign: 'middle' })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 1.08, w: 2.0, h: 0.028, fill: { color: RED } })
}
function chip(s, id) {
  s.addText(id, { x: M, y: 1.18, w: 3.5, h: 0.24, fontSize: 10, fontFace: FONT, color: RED, bold: true, margin: 0 })
}
function card(s, x, y, w, h) {
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: LIGHT }, rectRadius: 0.07 })
}
function txt(s, t, o) { s.addText(t, { fontFace: FONT, margin: 0, color: TEXT, ...o }) }

const total = LAYOUT_IDS.length
const builders = {}

function reg(id, fn) { builders[id] = fn }

// ——— shared helpers for grids ———
function kpiCards(s, items, y0 = 1.55) {
  const n = items.length, colW = (CW - GAP * (n - 1)) / n
  items.forEach((it, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, y0, colW, 4.2)
    txt(s, it.v, { x: x + 0.1, y: y0 + 0.7, w: colW - 0.2, h: 1.0, fontSize: 32, bold: true, color: RED, align: 'center' })
    txt(s, it.l, { x: x + 0.15, y: y0 + 2.1, w: colW - 0.3, h: 1.2, fontSize: 13, align: 'center' })
  })
}
function colCards(s, cols, y0 = 1.55) {
  const n = cols.length, colW = (CW - GAP * (n - 1)) / n
  cols.forEach((c, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, y0, colW, 4.3)
    txt(s, c.h, { x: x + 0.25, y: y0 + 0.35, w: colW - 0.5, h: 0.45, fontSize: 16, bold: true, color: RED })
    ;(c.items || [c.t]).forEach((t, j) => {
      txt(s, t, { x: x + 0.25, y: y0 + 1.1 + j * 0.65, w: colW - 0.5, h: 0.55, fontSize: 13, color: TEXT })
    })
  })
}
function gridCards(s, cells, cols = 2, y0 = 1.55) {
  const rows = Math.ceil(cells.length / cols)
  const colW = (CW - GAP * (cols - 1)) / cols
  const rowH = (4.4 - GAP * (rows - 1)) / rows
  cells.forEach((c, i) => {
    const col = i % cols, row = Math.floor(i / cols)
    const x = M + col * (colW + GAP), y = y0 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    txt(s, c.h, { x: x + 0.28, y: y + 0.28, w: colW - 0.55, h: 0.4, fontSize: 15, bold: true, color: RED })
    txt(s, c.t, { x: x + 0.28, y: y + 0.85, w: colW - 0.55, h: rowH - 1.1, fontSize: 13 })
  })
}

reg('cover', (s, page) => {

  logo(s, M, 0.45, 2.0)
  chip(s, 'cover')
  txt(s, '曙光云算力与运维能力汇报', { x: M, y: 2.15, w: CW, h: 0.95, fontSize: 38, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.25, w: 2.6, h: 0.035, fill: { color: RED } })
  txt(s, '面向政企客户的交付进展与下一步计划', { x: M, y: 3.5, w: CW * 0.85, h: 0.45, fontSize: 17, color: MUTED })
  txt(s, '曙光云    2026 年 10 月', { x: M, y: 6.55, w: CW, h: 0.3, fontSize: 14 })

})
reg('cover-split', (s, page) => {

  logo(s); titleBand(s, '本轮汇报聚焦三件必须拍板的事项'); chip(s, 'cover-split')
  txt(s, '统一调度、运维闭环与规范沉淀已具备规模化条件。', { x: M, y: 1.6, w: CW * 0.48, h: 2.0, fontSize: 17 })
  const rw = CW * 0.48, rx = M + CW * 0.52
  ;['确认试点扩面清单', '锁定运维编制与预算', '批准规范纳入基线'].forEach((t, i) => {
    const y = 1.6 + i * 1.2
    card(s, rx, y, rw, 1.05)
    txt(s, String(i + 1).padStart(2, '0'), { x: rx + 0.2, y: y + 0.25, w: 0.6, h: 0.5, fontSize: 20, bold: true, color: RED })
    txt(s, t, { x: rx + 0.9, y: y + 0.28, w: rw - 1.15, h: 0.5, fontSize: 14, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('agenda', (s, page) => {

  logo(s); titleBand(s, '目录'); chip(s, 'agenda')
  const items = ['背景与目标已对齐重点客户诉求', '核心能力覆盖调度、监控与集成', '本季度三项落地按期完成', '下一步聚焦规模化与规范沉淀']
  items.forEach((item, i) => {
    const y = 1.55 + i * 1.05
    txt(s, String(i + 1).padStart(2, '0'), { x: M, y, w: 0.8, h: 0.5, fontSize: 26, bold: true, color: RED, valign: 'middle' })
    txt(s, item, { x: M + 1.0, y, w: CW - 1.1, h: 0.5, fontSize: 17, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('toc-two-col', (s, page) => {

  logo(s); titleBand(s, '汇报结构一览'); chip(s, 'toc-two-col')
  const colW = (CW - GAP) / 2
  const L = ['01 背景与目标', '02 能力全景', '03 本季交付', '04 风险与对策']
  const R = ['05 资源诉求', '06 下季路线', '07 决策事项', '08 附录材料']
  ;[{ x: M, list: L }, { x: M + colW + GAP, list: R }].forEach(({ x, list }) => {
    list.forEach((t, i) => { const y = 1.55 + i * 1.05; card(s, x, y, colW, 0.9); txt(s, t, { x: x + 0.28, y: y + 0.22, w: colW - 0.5, h: 0.45, fontSize: 15, valign: 'middle' }) })
  })
  foot(s, page, total)

})
reg('section', (s, page) => {

  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE } })
  logo(s); chip(s, 'section')
  txt(s, '01', { x: M, y: 2.4, w: CW, h: 0.65, fontSize: 46, bold: true, color: RED })
  txt(s, '能力与进展', { x: M, y: 3.15, w: CW * 0.7, h: 0.6, fontSize: 30, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.95, w: 1.7, h: 0.035, fill: { color: RED } })
  foot(s, page, total)

})
reg('section-band', (s, page) => {

  logo(s)
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 2.55, w: W, h: 2.2, fill: { color: LIGHT } })
  chip(s, 'section-band')
  txt(s, '02  ·  治理与计划', { x: M, y: 3.2, w: CW, h: 0.7, fontSize: 32, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 4.1, w: 2.2, h: 0.035, fill: { color: RED } })
  foot(s, page, total)

})
reg('exec-summary', (s, page) => {

  logo(s); titleBand(s, '建议批准扩面：三项能力已具备可复制条件'); chip(s, 'exec-summary')
  colCards(s, [
    { h: '调度就绪', items: ['异构纳管与配额审计已闭环'] },
    { h: '运维闭环', items: ['告警—工单—复盘可度量'] },
    { h: '规范可装', items: ['品牌与模板可版本化分发'] },
  ])
  foot(s, page, total)

})
reg('content', (s, page) => {

  logo(s); titleBand(s, '统一调度已打通异构算力纳管与配额审计'); chip(s, 'content')
  card(s, M, 1.55, CW, 4.5)
  ;['按项目配额与审计追踪，满足内控与合规要求', '监控告警接入工单闭环，故障响应路径可度量', '对外开放标准 API，业务系统可按周迭代接入'].forEach((t, i) => {
    txt(s, `${i + 1}.  ${t}`, { x: M + 0.4, y: 1.95 + i * 0.9, w: CW - 0.8, h: 0.7, fontSize: 15 })
  })
  txt(s, '指标为样例占位，正式稿请替换为真实数据。', { x: M + 0.4, y: 5.4, w: CW - 0.8, h: 0.3, fontSize: 11, color: MUTED })
  foot(s, page, total)

})
reg('content-two-level', (s, page) => {

  logo(s); titleBand(s, '运维体系建设分两层推进：平台能力与现场规范'); chip(s, 'content-two-level')
  ;[
    { h: '平台能力', subs: ['统一告警收敛与升级策略', '知识库与标准作业条目化'] },
    { h: '现场规范', subs: ['值班交接与复盘模板固化', '重大变更双人复核'] },
  ].forEach((b, i) => {
    const y = 1.55 + i * 2.3
    card(s, M, y, CW, 2.1)
    txt(s, b.h, { x: M + 0.35, y: y + 0.25, w: CW - 0.7, h: 0.4, fontSize: 16, bold: true })
    b.subs.forEach((sub, j) => txt(s, `·  ${sub}`, { x: M + 0.5, y: y + 0.85 + j * 0.45, w: CW - 1.0, h: 0.4, fontSize: 14, color: MUTED }))
  })
  foot(s, page, total)

})
reg('two-col', (s, page) => {

  logo(s); titleBand(s, '试点交付与规范沉淀同步推进'); chip(s, 'two-col')
  colCards(s, [
    { h: '试点交付', items: ['重点客户环境已上线试运行', '操作手册与培训材料完成归档'] },
    { h: '规范沉淀', items: ['品牌与 logo 规则可版本化安装', '汇报模板统一 16:9 与识别色'] },
  ])
  foot(s, page, total)

})
reg('three-col', (s, page) => {

  logo(s); titleBand(s, '三类能力共同支撑政企交付可信度'); chip(s, 'three-col')
  colCards(s, [
    { h: '调度', items: ['配额、审计、异构纳管'] },
    { h: '监控', items: ['告警收敛与工单闭环'] },
    { h: '集成', items: ['标准 API 与周级迭代'] },
  ])
  foot(s, page, total)

})
reg('four-grid', (s, page) => {

  logo(s); titleBand(s, '四项保障条件决定扩面节奏'); chip(s, 'four-grid')
  gridCards(s, [
    { h: '人员', t: '运维编制到位' }, { h: '预算', t: '年度资源锁定' },
    { h: '规范', t: '基线已发布' }, { h: '客户', t: '扩面名单确认' },
  ])
  foot(s, page, total)

})
reg('icon-rows', (s, page) => {

  logo(s); titleBand(s, '四条工作原则贯穿本轮交付'); chip(s, 'icon-rows')
  ;[
    ['结论先行', '每页页头写清「所以什么」'],
    ['证据可核', '关键数字附来源与口径'],
    ['节奏可控', '里程碑与责任人一一对应'],
    ['风险透明', '高影响项必须给出缓解动作'],
  ].forEach((r, i) => {
    const y = 1.5 + i * 1.15
    s.addShape(pptx.shapes.OVAL, { x: M, y: y + 0.1, w: 0.5, h: 0.5, fill: { color: RED } })
    txt(s, String(i + 1), { x: M, y: y + 0.18, w: 0.5, h: 0.35, fontSize: 14, bold: true, color: WHITE, align: 'center' })
    txt(s, r[0], { x: M + 0.75, y: y, w: 2.8, h: 0.4, fontSize: 15, bold: true })
    txt(s, r[1], { x: M + 3.7, y: y, w: CW - 3.7, h: 0.7, fontSize: 14, color: MUTED, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('callout', (s, page) => {

  logo(s); chip(s, 'callout')
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 2.5, w: 0.09, h: 2.0, fill: { color: RED } })
  txt(s, '没有可度量的运维闭环，扩面只会放大故障半径。', { x: M + 0.4, y: 2.6, w: CW - 0.5, h: 1.2, fontSize: 26, bold: true })
  txt(s, '本页用于强调单一关键结论，正文汇报中慎用、少用。', { x: M + 0.4, y: 4.1, w: CW - 0.5, h: 0.4, fontSize: 13, color: MUTED })
  foot(s, page, total)

})
reg('compare', (s, page) => {

  logo(s); titleBand(s, '从烟囱式运维走向统一闭环'); chip(s, 'compare')
  colCards(s, [
    { h: '现状', items: ['多套工具并行', '告警噪声高', '手册分散难检索'] },
    { h: '目标', items: ['统一调度与监控', '工单可度量', '规范可安装分发'] },
  ])
  foot(s, page, total)

})
reg('pros-cons', (s, page) => {

  logo(s); titleBand(s, '自建监控扩展的利与弊需要当面说清'); chip(s, 'pros-cons')
  colCards(s, [
    { h: '有利', items: ['贴合现有工单习惯', '短期可见度高'] },
    { h: '不利', items: ['重复建设成本高', '难与统一调度对齐'] },
  ])
  foot(s, page, total)

})
reg('options-3', (s, page) => {

  logo(s); titleBand(s, '三条路径对比后建议选「统一平台 + 试点扩面」'); chip(s, 'options-3')
  const opts = [
    { tag: '不推荐', h: '维持现状', t: '成本低，风险累积' },
    { tag: '备选', h: '全面自建', t: '灵活但周期长' },
    { tag: '建议', h: '统一平台', t: '可复制、可审计' },
  ]
  const colW = (CW - GAP * 2) / 3
  opts.forEach((o, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.55, colW, 4.3)
    txt(s, o.tag, { x: x + 0.25, y: 1.8, w: colW - 0.5, h: 0.35, fontSize: 12, bold: true, color: i === 2 ? RED : MUTED })
    txt(s, o.h, { x: x + 0.25, y: 2.4, w: colW - 0.5, h: 0.5, fontSize: 17, bold: true })
    txt(s, o.t, { x: x + 0.25, y: 3.2, w: colW - 0.5, h: 1.5, fontSize: 14, color: MUTED })
  })
  foot(s, page, total)

})
reg('matrix-2x2', (s, page) => {

  logo(s); titleBand(s, '事项按影响与紧急度落入四个行动格'); chip(s, 'matrix-2x2')
  gridCards(s, [
    { h: '立即做', t: '告警闭环、配额审计' }, { h: '计划做', t: '扩面培训、API 目录' },
    { h: '委托做', t: '驻场手册修订' }, { h: '观察', t: '边缘定制需求' },
  ])
  foot(s, page, total)

})
reg('swot', (s, page) => {

  logo(s); titleBand(s, '扩面决策的 SWOT 摘要'); chip(s, 'swot')
  gridCards(s, [
    { h: '优势 S', t: '试点证据充分、规范可装' }, { h: '劣势 W', t: '编制尚未完全到位' },
    { h: '机会 O', t: '多客户同构需求集中' }, { h: '威胁 T', t: '局部定制可能撕裂基线' },
  ])
  foot(s, page, total)

})
reg('table', (s, page) => {

  logo(s); titleBand(s, '关键交付物与责任归属一览'); chip(s, 'table')
  s.addTable([
    [{ text: '交付物', options: { bold: true } }, { text: '状态', options: { bold: true } }, { text: '责任人', options: { bold: true } }],
    ['调度试点报告', '已完成', '平台组'], ['运维闭环手册', '评审中', '运维组'],
    ['扩面客户清单', '待确认', '客户成功'], ['规范安装包', '已发布', '品牌与工具'],
  ], { x: M, y: 1.55, w: CW, h: 4.3, colW: [CW * 0.4, CW * 0.25, CW * 0.35], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'left', valign: 'middle' })
  foot(s, page, total)

})
reg('kpi-3', (s, page) => {

  logo(s); titleBand(s, '三项关键结果支撑本轮汇报结论'); chip(s, 'kpi-3')
  kpiCards(s, [{ v: '3', l: '重点试点已交付' }, { v: '4', l: '可安装品牌技能' }, { v: '16:9', l: '统一汇报画幅' }])
  foot(s, page, total)

})
reg('kpi-4', (s, page) => {

  logo(s); titleBand(s, '四项运行指标周环比保持改善'); chip(s, 'kpi-4')
  kpiCards(s, [{ v: '98%', l: '调度可用性' }, { v: '12m', l: '告警中位响应' }, { v: '35%', l: '重复告警下降' }, { v: '6', l: '周级接入系统' }])
  foot(s, page, total)

})
reg('kpi-row', (s, page) => {

  logo(s); titleBand(s, '本周经营与交付快照'); chip(s, 'kpi-row')
  kpiCards(s, [{ v: '5', l: '在途项目' }, { v: '2', l: '待决策项' }, { v: '1', l: '高风险项' }, { v: '100%', l: '里程碑按期' }], 2.2)
  foot(s, page, total)

})
reg('chart-frame', (s, page) => {

  logo(s); titleBand(s, '告警量与闭环时长呈同步改善趋势'); chip(s, 'chart-frame')
  card(s, M, 1.55, CW * 0.62, 4.5)
  txt(s, '此处插入折线 / 柱状图', { x: M + 0.3, y: 3.2, w: CW * 0.62 - 0.6, h: 0.45, fontSize: 15, color: MUTED, align: 'center' })
  const rx = M + CW * 0.62 + GAP, rw = CW * 0.38 - GAP
  card(s, rx, 1.55, rw, 4.5)
  txt(s, '读图要点', { x: rx + 0.2, y: 1.85, w: rw - 0.4, h: 0.4, fontSize: 15, bold: true })
  ;['峰值已回落', '闭环时长缩短', '周末波动仍在'].forEach((t, i) => txt(s, `·  ${t}`, { x: rx + 0.2, y: 2.5 + i * 0.7, w: rw - 0.4, h: 0.5, fontSize: 13 }))
  foot(s, page, total)

})
reg('bridge-frame', (s, page) => {

  logo(s); titleBand(s, '从基线到目标的能力桥段'); chip(s, 'bridge-frame')
  const steps = [['基线', '分散工具'], ['+调度', '统一纳管'], ['+闭环', '工单度量'], ['+规范', '可安装'], ['目标', '可扩面']]
  const colW = (CW - GAP * 4) / 5
  steps.forEach((st, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.4, colW, 2.9)
    txt(s, st[0], { x: x + 0.08, y: 2.8, w: colW - 0.16, h: 0.6, fontSize: 14, bold: true, color: i === 0 || i === 4 ? RED : TEXT, align: 'center' })
    txt(s, st[1], { x: x + 0.08, y: 3.7, w: colW - 0.16, h: 0.6, fontSize: 12, color: MUTED, align: 'center' })
  })
  foot(s, page, total)

})
reg('timeline', (s, page) => {

  logo(s); titleBand(s, '关键里程碑按季度落地'); chip(s, 'timeline')
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.3, w: CW, h: 0.035, fill: { color: RED } })
  ;[['Q1', '试点上线'], ['Q2', '闭环验收'], ['Q3', '规范发布'], ['Q4', '扩面启动']].forEach((m, i) => {
    const colW = CW / 4, x = M + i * colW + colW / 2 - 0.18
    s.addShape(pptx.shapes.OVAL, { x, y: 3.15, w: 0.32, h: 0.32, fill: { color: RED } })
    txt(s, m[0], { x: M + i * colW, y: 2.25, w: colW, h: 0.4, fontSize: 17, bold: true, align: 'center' })
    txt(s, m[1], { x: M + i * colW, y: 3.75, w: colW, h: 0.4, fontSize: 13, color: MUTED, align: 'center' })
  })
  foot(s, page, total)

})
reg('process-h', (s, page) => {

  logo(s); titleBand(s, '故障处置标准五步流程'); chip(s, 'process-h')
  const steps = ['发现', '分级', '处置', '复盘', '沉淀']
  const colW = (CW - GAP * 4) / 5
  steps.forEach((st, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.5, colW, 2.5)
    txt(s, String(i + 1), { x: x + 0.08, y: 2.85, w: colW - 0.16, h: 0.5, fontSize: 20, bold: true, color: RED, align: 'center' })
    txt(s, st, { x: x + 0.08, y: 3.6, w: colW - 0.16, h: 0.5, fontSize: 15, align: 'center' })
  })
  foot(s, page, total)

})
reg('process-v', (s, page) => {

  logo(s); titleBand(s, '变更发布准入的纵向检查链'); chip(s, 'process-v')
  ;['方案评审通过', '灰度范围确认', '回滚预案就绪', '双人复核放行'].forEach((t, i) => {
    const y = 1.5 + i * 1.15
    s.addShape(pptx.shapes.OVAL, { x: M, y: y + 0.15, w: 0.48, h: 0.48, fill: { color: RED } })
    txt(s, String(i + 1), { x: M, y: y + 0.22, w: 0.48, h: 0.35, fontSize: 13, bold: true, color: WHITE, align: 'center' })
    card(s, M + 0.8, y, CW - 0.8, 0.9)
    txt(s, t, { x: M + 1.1, y: y + 0.22, w: CW - 1.3, h: 0.45, fontSize: 15, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('roadmap', (s, page) => {

  logo(s); titleBand(s, '下两季度路线按工作流排期'); chip(s, 'roadmap')
  txt(s, '工作流', { x: M, y: 1.5, w: 2.0, h: 0.35, fontSize: 12, bold: true, color: MUTED })
  txt(s, 'Q4', { x: M + 2.8, y: 1.5, w: 3.4, h: 0.35, fontSize: 12, bold: true, color: MUTED, align: 'center' })
  txt(s, 'Q1', { x: M + 6.8, y: 1.5, w: 3.4, h: 0.35, fontSize: 12, bold: true, color: MUTED, align: 'center' })
  ;[['调度', 1, 1], ['运维', 1, 1], ['规范', 0, 1], ['扩面', 0, 1]].forEach((r, i) => {
    const y = 2.05 + i * 1.0
    txt(s, r[0], { x: M, y: y + 0.15, w: 2.0, h: 0.4, fontSize: 14 })
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: M + 2.8, y, w: 3.2, h: 0.65, fill: { color: r[1] ? RED : LIGHT }, rectRadius: 0.05 })
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: M + 6.8, y, w: 3.2, h: 0.65, fill: { color: r[2] ? RED : LIGHT }, rectRadius: 0.05 })
  })
  foot(s, page, total)

})
reg('risk', (s, page) => {

  logo(s); titleBand(s, '高影响风险与缓解动作'); chip(s, 'risk')
  s.addTable([
    [{ text: '风险', options: { bold: true } }, { text: '影响', options: { bold: true } }, { text: '缓解', options: { bold: true } }],
    ['编制不足', '高', '先锁定值班最小班底'], ['定制撕裂基线', '中', '变更评审强约束'], ['数据口径不一', '中', '统一指标字典'],
  ], { x: M, y: 1.55, w: CW, h: 4.0, colW: [CW * 0.32, CW * 0.18, CW * 0.5], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'left', valign: 'middle' })
  foot(s, page, total)

})
reg('next-steps', (s, page) => {

  logo(s); titleBand(s, '会后两周内必须完成的行动'); chip(s, 'next-steps')
  ;[['确认扩面客户名单', '客户成功'], ['锁定运维编制与预算', '综合管理'], ['发布规范安装说明', '品牌与工具'], ['安排试点复盘会', '平台组']].forEach((it, i) => {
    const y = 1.5 + i * 1.15
    card(s, M, y, CW, 1.0)
    txt(s, String(i + 1).padStart(2, '0'), { x: M + 0.25, y: y + 0.25, w: 0.65, h: 0.5, fontSize: 18, bold: true, color: RED })
    txt(s, it[0], { x: M + 1.1, y: y + 0.25, w: CW * 0.55, h: 0.5, fontSize: 15, valign: 'middle' })
    txt(s, it[1], { x: M + CW * 0.65, y: y + 0.25, w: CW * 0.3, h: 0.5, fontSize: 13, color: MUTED, align: 'right', valign: 'middle' })
  })
  foot(s, page, total)

})
reg('team', (s, page) => {

  logo(s); titleBand(s, '本轮汇报相关角色'); chip(s, 'team')
  const people = [['总负责', '姓名'], ['平台', '姓名'], ['运维', '姓名'], ['客户成功', '姓名']]
  const colW = (CW - GAP * 3) / 4
  people.forEach((pe, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 1.9, colW, 3.5)
    s.addShape(pptx.shapes.OVAL, { x: x + colW / 2 - 0.4, y: 2.3, w: 0.8, h: 0.8, fill: { color: RED } })
    txt(s, pe[0], { x: x + 0.1, y: 3.5, w: colW - 0.2, h: 0.4, fontSize: 14, bold: true, align: 'center' })
    txt(s, pe[1], { x: x + 0.1, y: 4.1, w: colW - 0.2, h: 0.35, fontSize: 12, color: MUTED, align: 'center' })
  })
  foot(s, page, total)

})
reg('quote', (s, page) => {

  logo(s); chip(s, 'quote')
  txt(s, '「先把可复制的能力做硬，再谈全面铺开。」', { x: M + 0.35, y: 2.6, w: CW - 0.7, h: 1.3, fontSize: 24, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M + 0.35, y: 4.15, w: 1.5, h: 0.035, fill: { color: RED } })
  txt(s, '内部工作要求 · 样例表述', { x: M + 0.35, y: 4.4, w: CW - 0.7, h: 0.35, fontSize: 13, color: MUTED })
  foot(s, page, total)

})
reg('closing', (s, page) => {

  if (fs.existsSync(logoPath)) { const lw = 1.85; s.addImage({ path: logoPath, x: (W - lw) / 2, y: 1.95, w: lw, h: lw / 2.506 }) }
  chip(s, 'closing')
  txt(s, '谢谢 · 请指正', { x: M, y: 3.35, w: CW, h: 0.65, fontSize: 32, bold: true, align: 'center' })
  s.addShape(pptx.shapes.RECTANGLE, { x: (W - 1.5) / 2, y: 4.15, w: 1.5, h: 0.035, fill: { color: RED } })
  txt(s, '曙光云', { x: M, y: 4.45, w: CW, h: 0.35, fontSize: 15, color: MUTED, align: 'center' })
  txt(s, '联系人 / 邮箱（请替换为本单位信息）', { x: M, y: 5.0, w: CW, h: 0.35, fontSize: 12, color: MUTED, align: 'center' })

})
reg('appendix', (s, page) => {

  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE } })
  logo(s); chip(s, 'appendix')
  txt(s, '附录', { x: M, y: 2.85, w: CW, h: 0.7, fontSize: 38, bold: true })
  txt(s, '补充数据、接口清单与操作摘录', { x: M, y: 3.7, w: CW * 0.7, h: 0.45, fontSize: 17, color: MUTED })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 4.35, w: 1.7, h: 0.035, fill: { color: RED } })
  foot(s, page, total)

})
reg('cover-center', (s, page) => {

  logo(s, (W - 2.0) / 2, 1.2, 2.0); chip(s, 'cover-center')
  txt(s, '曙光云政企能力汇报', { x: M, y: 3.0, w: CW, h: 0.7, fontSize: 34, bold: true, align: 'center' })
  s.addShape(pptx.shapes.RECTANGLE, { x: (W - 2.0) / 2, y: 3.85, w: 2.0, h: 0.035, fill: { color: RED } })
  txt(s, '2026 年 10 月', { x: M, y: 4.2, w: CW, h: 0.4, fontSize: 16, color: MUTED, align: 'center' })

})
reg('cover-band', (s, page) => {

  logo(s, M, 0.4, 1.8)
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.6, w: W, h: 1.9, fill: { color: LIGHT } })
  chip(s, 'cover-band')
  txt(s, '年度运维与算力服务总结', { x: M, y: 2.4, w: CW, h: 0.8, fontSize: 34, bold: true })
  txt(s, '曙光云  ·  内部汇报材料', { x: M, y: 6.15, w: CW, h: 0.4, fontSize: 15 })

})
reg('cover-logo-right', (s, page) => {

  logo(s, W - M - 2.2, 0.45, 2.2); chip(s, 'cover-logo-right')
  txt(s, '可信算力底座建设进展', { x: M, y: 2.5, w: CW * 0.7, h: 1.0, fontSize: 34, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.7, w: 2.4, h: 0.035, fill: { color: RED } })
  txt(s, '汇报单位：曙光云', { x: M, y: 6.4, w: CW * 0.6, h: 0.35, fontSize: 14, color: MUTED })

})
reg('agenda-5', (s, page) => {

  logo(s); titleBand(s, '五段式议程'); chip(s, 'agenda-5')
  ;['开场与目标', '现状诊断', '方案比选', '实施路线', '决策事项'].forEach((t, i) => {
    const y = 1.5 + i * 0.9
    txt(s, String(i + 1).padStart(2, '0'), { x: M, y, w: 0.7, h: 0.55, fontSize: 22, bold: true, color: RED, valign: 'middle' })
    txt(s, t, { x: M + 0.9, y, w: CW - 1.0, h: 0.55, fontSize: 16, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('agenda-cards', (s, page) => {

  logo(s); titleBand(s, '议程卡片'); chip(s, 'agenda-cards')
  ;['背景', '能力', '进展', '计划', '决策', '附录'].forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3)
    const colW = (CW - GAP * 2) / 3, rowH = 1.9
    const x = M + col * (colW + GAP), y = 1.55 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    txt(s, String(i + 1).padStart(2, '0'), { x: x + 0.25, y: y + 0.35, w: colW - 0.5, h: 0.4, fontSize: 18, bold: true, color: RED })
    txt(s, t, { x: x + 0.25, y: y + 0.95, w: colW - 0.5, h: 0.45, fontSize: 16, bold: true })
  })
  foot(s, page, total)

})
reg('toc-dense', (s, page) => {

  logo(s); titleBand(s, '详细目录'); chip(s, 'toc-dense')
  const items = Array.from({ length: 10 }, (_, i) => `${String(i + 1).padStart(2, '0')}  议题条目 ${i + 1}`)
  items.forEach((t, i) => {
    const col = i < 5 ? 0 : 1, row = i % 5
    const x = M + col * (CW / 2 + GAP / 2)
    txt(s, t, { x, y: 1.55 + row * 0.85, w: CW / 2 - GAP, h: 0.55, fontSize: 14, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('section-right', (s, page) => {

  logo(s); chip(s, 'section-right')
  txt(s, '03', { x: M, y: 2.5, w: CW * 0.4, h: 0.7, fontSize: 48, bold: true, color: RED })
  txt(s, '实施保障', { x: M + CW * 0.35, y: 2.7, w: CW * 0.55, h: 0.7, fontSize: 32, bold: true, align: 'right' })
  s.addShape(pptx.shapes.RECTANGLE, { x: M, y: 3.7, w: CW, h: 0.03, fill: { color: RED } })
  foot(s, page, total)

})
reg('section-minimal', (s, page) => {

  logo(s); chip(s, 'section-minimal')
  txt(s, 'PART 04', { x: M, y: 3.0, w: CW, h: 0.4, fontSize: 14, color: RED, bold: true, align: 'center' })
  txt(s, '决策与下一步', { x: M, y: 3.5, w: CW, h: 0.7, fontSize: 32, bold: true, align: 'center' })
  foot(s, page, total)

})
reg('chapter-list', (s, page) => {

  logo(s); titleBand(s, '本章要点预告'); chip(s, 'chapter-list')
  ;['问题界定', '根因分析', '对策选项', '推荐方案'].forEach((t, i) => {
    const y = 1.55 + i * 1.1
    card(s, M, y, CW, 0.95)
    txt(s, `${i + 1}`, { x: M + 0.3, y: y + 0.22, w: 0.5, h: 0.5, fontSize: 20, bold: true, color: RED })
    txt(s, t, { x: M + 1.0, y: y + 0.22, w: CW - 1.4, h: 0.5, fontSize: 16, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('key-message', (s, page) => {

  logo(s); titleBand(s, '本页唯一要记住的话'); chip(s, 'key-message')
  card(s, M, 2.3, CW, 3.0)
  txt(s, '先固化可复制基线，再谈个性化扩展。', { x: M + 0.5, y: 3.1, w: CW - 1.0, h: 1.2, fontSize: 24, bold: true, align: 'center' })
  foot(s, page, total)

})
reg('bullets-tight', (s, page) => {

  logo(s); titleBand(s, '要点速览（紧凑列表）'); chip(s, 'bullets-tight')
  card(s, M, 1.55, CW, 4.5)
  for (let i = 0; i < 8; i++) {
    txt(s, `·  紧凑要点 ${i + 1}：说明事项与责任边界`, { x: M + 0.4, y: 1.8 + i * 0.48, w: CW - 0.8, h: 0.42, fontSize: 13 })
  }
  foot(s, page, total)

})
reg('two-col-header', (s, page) => {

  logo(s); titleBand(s, '总述 + 双栏展开'); chip(s, 'two-col-header')
  txt(s, '上方总述一句：本方案同时满足合规与交付节奏。', { x: M, y: 1.5, w: CW, h: 0.45, fontSize: 14, color: MUTED })
  colCards(s, [
    { h: '合规', items: ['审计可追踪', '权限最小化'] },
    { h: '交付', items: ['按周迭代', '验收清单化'] },
  ], 2.15)
  foot(s, page, total)

})
reg('three-icon', (s, page) => {

  logo(s); titleBand(s, '三支柱模型'); chip(s, 'three-icon')
  ;['稳定', '安全', '效率'].forEach((t, i) => {
    const colW = (CW - GAP * 2) / 3, x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 4.0)
    s.addShape(pptx.shapes.OVAL, { x: x + colW / 2 - 0.45, y: 2.3, w: 0.9, h: 0.9, fill: { color: RED } })
    txt(s, String(i + 1), { x: x + colW / 2 - 0.45, y: 2.5, w: 0.9, h: 0.5, fontSize: 18, bold: true, color: WHITE, align: 'center' })
    txt(s, t, { x: x + 0.2, y: 3.6, w: colW - 0.4, h: 0.5, fontSize: 18, bold: true, align: 'center' })
    txt(s, '配套制度与工具到位', { x: x + 0.25, y: 4.4, w: colW - 0.5, h: 0.7, fontSize: 13, color: MUTED, align: 'center' })
  })
  foot(s, page, total)

})
reg('five-col', (s, page) => {

  logo(s); titleBand(s, '五维能力切片'); chip(s, 'five-col')
  colCards(s, ['算力', '网络', '存储', '安全', '运维'].map((h) => ({ h, items: ['达标'] })))
  foot(s, page, total)

})
reg('six-grid', (s, page) => {

  logo(s); titleBand(s, '六项落地检查'); chip(s, 'six-grid')
  gridCards(s, ['制度', '流程', '工具', '人员', '数据', '演练'].map((h) => ({ h, t: '已覆盖 / 待补强' })), 3)
  foot(s, page, total)

})
reg('highlight-left', (s, page) => {

  logo(s); titleBand(s, '左侧强调 + 右侧说明'); chip(s, 'highlight-left')
  card(s, M, 1.55, CW * 0.32, 4.5)
  txt(s, '98%', { x: M + 0.2, y: 2.8, w: CW * 0.32 - 0.4, h: 1.0, fontSize: 40, bold: true, color: RED, align: 'center' })
  txt(s, '可用性', { x: M + 0.2, y: 4.0, w: CW * 0.32 - 0.4, h: 0.4, fontSize: 14, align: 'center' })
  card(s, M + CW * 0.35, 1.55, CW * 0.65, 4.5)
  ;['核心链路双活', '变更窗口受控', '重大故障演练完成'].forEach((t, i) => txt(s, `·  ${t}`, { x: M + CW * 0.35 + 0.35, y: 2.2 + i * 0.85, w: CW * 0.65 - 0.7, h: 0.6, fontSize: 15 }))
  foot(s, page, total)

})
reg('highlight-right', (s, page) => {

  logo(s); titleBand(s, '左侧说明 + 右侧强调'); chip(s, 'highlight-right')
  card(s, M, 1.55, CW * 0.65, 4.5)
  ;['工单闭环率提升', '重复告警下降', '知识条目沉淀'].forEach((t, i) => txt(s, `·  ${t}`, { x: M + 0.35, y: 2.2 + i * 0.85, w: CW * 0.65 - 0.7, h: 0.6, fontSize: 15 }))
  card(s, M + CW * 0.68, 1.55, CW * 0.32, 4.5)
  txt(s, '35%', { x: M + CW * 0.68 + 0.15, y: 2.8, w: CW * 0.32 - 0.3, h: 1.0, fontSize: 36, bold: true, color: RED, align: 'center' })
  txt(s, '噪声下降', { x: M + CW * 0.68 + 0.15, y: 4.0, w: CW * 0.32 - 0.3, h: 0.4, fontSize: 14, align: 'center' })
  foot(s, page, total)

})
reg('before-after', (s, page) => {

  logo(s); titleBand(s, '改造前后对照'); chip(s, 'before-after')
  colCards(s, [
    { h: '改造前', items: ['多入口登录', '指标口径不一', '复盘靠口头'] },
    { h: '改造后', items: ['统一门户', '指标字典固化', '复盘模板强制'] },
  ])
  foot(s, page, total)

})
reg('vs-score', (s, page) => {

  logo(s); titleBand(s, '方案评分卡'); chip(s, 'vs-score')
  s.addTable([
    [{ text: '维度', options: { bold: true } }, { text: '方案 A', options: { bold: true } }, { text: '方案 B', options: { bold: true } }, { text: '方案 C', options: { bold: true } }],
    ['成本', '高', '中', '低'], ['周期', '长', '中', '短'], ['风险', '低', '中', '高'], ['推荐', '', '是', ''],
  ], { x: M, y: 1.55, w: CW, h: 4.3, colW: [CW * 0.25, CW * 0.25, CW * 0.25, CW * 0.25], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'center', valign: 'middle' })
  foot(s, page, total)

})
reg('criteria-table', (s, page) => {

  logo(s); titleBand(s, '验收标准表'); chip(s, 'criteria-table')
  s.addTable([
    [{ text: '标准', options: { bold: true } }, { text: '阈值', options: { bold: true } }, { text: '方法', options: { bold: true } }],
    ['可用性 ≥ 99.5%', '月', '监控报表'], ['变更成功率 ≥ 98%', '月', '变更台账'], ['演练完成率 100%', '季', '演练记录'],
  ], { x: M, y: 1.55, w: CW, h: 4.0, colW: [CW * 0.4, CW * 0.2, CW * 0.4], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'left', valign: 'middle' })
  foot(s, page, total)

})
reg('pricing-3', (s, page) => {

  logo(s); titleBand(s, '三档服务包（示意）'); chip(s, 'pricing-3')
  ;[
    { h: '基础', t: '值班 + 监控', p: '标准' },
    { h: '进阶', t: '含变更与演练', p: '推荐' },
    { h: '旗舰', t: '驻场 + 专属通道', p: '定制' },
  ].forEach((o, i) => {
    const colW = (CW - GAP * 2) / 3, x = M + i * (colW + GAP)
    card(s, x, 1.55, colW, 4.4)
    txt(s, o.p, { x: x + 0.25, y: 1.8, w: colW - 0.5, h: 0.35, fontSize: 12, bold: true, color: i === 1 ? RED : MUTED })
    txt(s, o.h, { x: x + 0.25, y: 2.4, w: colW - 0.5, h: 0.5, fontSize: 20, bold: true })
    txt(s, o.t, { x: x + 0.25, y: 3.3, w: colW - 0.5, h: 1.2, fontSize: 14, color: MUTED })
  })
  foot(s, page, total)

})
reg('pricing-table', (s, page) => {

  logo(s); titleBand(s, '服务项对照表'); chip(s, 'pricing-table')
  s.addTable([
    [{ text: '服务项', options: { bold: true } }, { text: '基础', options: { bold: true } }, { text: '进阶', options: { bold: true } }, { text: '旗舰', options: { bold: true } }],
    ['7×24 值班', '是', '是', '是'], ['变更窗口', '—', '是', '是'], ['驻场', '—', '—', '是'],
  ], { x: M, y: 1.55, w: CW, h: 4.0, colW: [CW * 0.34, CW * 0.22, CW * 0.22, CW * 0.22], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'center', valign: 'middle' })
  foot(s, page, total)

})
reg('faq', (s, page) => {

  logo(s); titleBand(s, '常见问题'); chip(s, 'faq')
  ;[
    ['Q：是否支持信创环境？', 'A：版式与字体策略按 WPS/信创约束设计。'],
    ['Q：能否替换官方母版？', 'A：有官方 potx 时优先填母版。'],
    ['Q：图表如何处理？', 'A：占位页提示插入原生图表对象。'],
  ].forEach((qa, i) => {
    const y = 1.55 + i * 1.5
    card(s, M, y, CW, 1.35)
    txt(s, qa[0], { x: M + 0.35, y: y + 0.2, w: CW - 0.7, h: 0.4, fontSize: 14, bold: true })
    txt(s, qa[1], { x: M + 0.35, y: y + 0.7, w: CW - 0.7, h: 0.4, fontSize: 13, color: MUTED })
  })
  foot(s, page, total)

})
reg('checklist', (s, page) => {

  logo(s); titleBand(s, '上线前检查清单'); chip(s, 'checklist')
  ;['监控探针就绪', '备份与回滚验证', '值班表发布', '客户通知完成', '知识条目归档', '复盘会议预约'].forEach((t, i) => {
    const y = 1.5 + i * 0.75
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: M, y: y + 0.1, w: 0.35, h: 0.35, fill: { color: RED }, rectRadius: 0.04 })
    txt(s, t, { x: M + 0.6, y, w: CW - 0.7, h: 0.55, fontSize: 15, valign: 'middle' })
  })
  foot(s, page, total)

})
reg('status-rag', (s, page) => {
  logo(s); titleBand(s, '项目状态一览'); chip(s, 'status-rag')
  ;[
    { h: '阻塞', t: '编制缺口未关闭' },
    { h: '关注', t: '扩面名单待确认' },
    { h: '正常', t: '试点验收已完成' },
  ].forEach((o, i) => {
    const colW = (CW - GAP * 2) / 3, x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 4.0)
    txt(s, o.h, { x: x + 0.25, y: 2.5, w: colW - 0.5, h: 0.5, fontSize: 20, bold: true, color: RED, align: 'center' })
    txt(s, o.t, { x: x + 0.3, y: 3.5, w: colW - 0.6, h: 1.2, fontSize: 14, align: 'center' })
  })
  foot(s, page, total)
})
reg('okr', (s, page) => {

  logo(s); titleBand(s, '本季 OKR'); chip(s, 'okr')
  colCards(s, [
    { h: 'O：扩面就绪', items: ['KR1 试点复盘关闭', 'KR2 规范包发布', 'KR3 名单确认'] },
    { h: 'O：运维提效', items: ['KR1 噪声下降 30%', 'KR2 中位响应 <15m'] },
  ])
  foot(s, page, total)

})
reg('smart-goals', (s, page) => {

  logo(s); titleBand(s, 'SMART 目标卡'); chip(s, 'smart-goals')
  gridCards(s, [
    { h: 'S 具体', t: '完成 3 家扩面试点' }, { h: 'M 可测', t: '验收清单 100% 勾选' },
    { h: 'A 可达', t: '编制与预算已预留' }, { h: 'R 相关', t: '对齐年度运维目标' },
    { h: 'T 时限', t: '本季度末前' }, { h: '负责人', t: '平台 + 客户成功' },
  ], 3)
  foot(s, page, total)

})
reg('pestle', (s, page) => {

  logo(s); titleBand(s, 'PESTLE 摘要（示意）'); chip(s, 'pestle')
  gridCards(s, [
    { h: 'P 政策', t: '信创与等保要求' }, { h: 'E 经济', t: '预算滚动管控' },
    { h: 'S 社会', t: '服务连续性预期' }, { h: 'T 技术', t: '异构算力普及' },
    { h: 'L 法律', t: '数据分级保护' }, { h: 'E 环境', t: '机房能耗约束' },
  ], 3)
  foot(s, page, total)

})
reg('porter-lite', (s, page) => {

  logo(s); titleBand(s, '竞争五力（简化卡片）'); chip(s, 'porter-lite')
  colCards(s, [
    { h: '现有竞争', items: ['同构方案增多'] },
    { h: '买方议价', items: ['集中采购压价'] },
    { h: '替代威胁', items: ['公有云弹性'] },
  ])
  foot(s, page, total)

})
reg('bcg-matrix', (s, page) => {

  logo(s); titleBand(s, '组合定位（示意四象限）'); chip(s, 'bcg-matrix')
  gridCards(s, [
    { h: '明星', t: '统一调度平台' }, { h: '现金牛', t: '标准运维包' },
    { h: '问题', t: '边缘定制项目' }, { h: '瘦狗', t: '低活性旧工具' },
  ])
  foot(s, page, total)

})
reg('ansoff', (s, page) => {

  logo(s); titleBand(s, '增长路径（安索夫示意）'); chip(s, 'ansoff')
  gridCards(s, [
    { h: '市场渗透', t: '现有客户扩面' }, { h: '市场开发', t: '新行业复制' },
    { h: '产品开发', t: '新能力包' }, { h: '多元化', t: '谨慎评估' },
  ])
  foot(s, page, total)

})
reg('value-chain', (s, page) => {

  logo(s); titleBand(s, '价值活动链'); chip(s, 'value-chain')
  const steps = ['需求', '设计', '交付', '运维', '优化']
  const colW = (CW - GAP * 4) / 5
  steps.forEach((st, i) => {
    const x = M + i * (colW + GAP)
    card(s, x, 2.5, colW, 2.6)
    txt(s, st, { x: x + 0.1, y: 3.3, w: colW - 0.2, h: 0.55, fontSize: 16, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('stakeholder', (s, page) => {

  logo(s); titleBand(s, '干系人关注点'); chip(s, 'stakeholder')
  gridCards(s, [
    { h: '业务主管', t: '可用性与体验' }, { h: '信息化', t: '标准与集成' },
    { h: '财务', t: '成本与预算' }, { h: '安全', t: '合规与审计' },
  ])
  foot(s, page, total)

})
reg('org-3', (s, page) => {

  logo(s); titleBand(s, '三级组织示意'); chip(s, 'org-3')
  card(s, M + CW * 0.3, 1.55, CW * 0.4, 1.1)
  txt(s, '领导小组', { x: M + CW * 0.3, y: 1.85, w: CW * 0.4, h: 0.5, fontSize: 16, bold: true, align: 'center' })
  ;['平台组', '运维组', '客户成功'].forEach((t, i) => {
    const colW = (CW - GAP * 2) / 3, x = M + i * (colW + GAP)
    card(s, x, 3.3, colW, 2.2)
    txt(s, t, { x: x + 0.15, y: 4.0, w: colW - 0.3, h: 0.5, fontSize: 15, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('org-tree', (s, page) => {

  logo(s); titleBand(s, '汇报关系树（示意）'); chip(s, 'org-tree')
  card(s, M + CW * 0.35, 1.55, CW * 0.3, 0.9)
  txt(s, '项目经理', { x: M + CW * 0.35, y: 1.75, w: CW * 0.3, h: 0.5, fontSize: 14, bold: true, align: 'center' })
  ;['架构', '开发', '测试', '运维'].forEach((t, i) => {
    const colW = (CW - GAP * 3) / 4, x = M + i * (colW + GAP)
    card(s, x, 3.2, colW, 2.3)
    txt(s, t, { x: x + 0.1, y: 4.0, w: colW - 0.2, h: 0.5, fontSize: 14, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('raci', (s, page) => {

  logo(s); titleBand(s, 'RACI 责任矩阵'); chip(s, 'raci')
  s.addTable([
    [{ text: '活动', options: { bold: true } }, { text: '平台', options: { bold: true } }, { text: '运维', options: { bold: true } }, { text: '业务', options: { bold: true } }],
    ['需求确认', 'C', 'C', 'A/R'], ['方案设计', 'A/R', 'C', 'I'], ['上线变更', 'C', 'A/R', 'I'], ['复盘改进', 'R', 'A', 'C'],
  ], { x: M, y: 1.55, w: CW, h: 4.3, colW: [CW * 0.28, CW * 0.24, CW * 0.24, CW * 0.24], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 13, color: TEXT, align: 'center', valign: 'middle' })
  foot(s, page, total)

})
reg('kanban-3', (s, page) => {

  logo(s); titleBand(s, '看板三列'); chip(s, 'kanban-3')
  ;[
    { h: '待办', items: ['名单确认', '预算签批'] },
    { h: '进行中', items: ['规范发布', '培训排期'] },
    { h: '完成', items: ['试点验收'] },
  ].forEach((c, i) => {
    const colW = (CW - GAP * 2) / 3, x = M + i * (colW + GAP)
    card(s, x, 1.55, colW, 4.5)
    txt(s, c.h, { x: x + 0.25, y: 1.8, w: colW - 0.5, h: 0.4, fontSize: 16, bold: true, color: RED })
    c.items.forEach((t, j) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: x + 0.25, y: 2.5 + j * 0.95, w: colW - 0.5, h: 0.8, fill: { color: WHITE }, rectRadius: 0.05 })
      txt(s, t, { x: x + 0.35, y: 2.65 + j * 0.95, w: colW - 0.7, h: 0.5, fontSize: 13, valign: 'middle' })
    })
  })
  foot(s, page, total)

})
reg('gantt-lite', (s, page) => {

  logo(s); titleBand(s, '简易甘特（阶段条）'); chip(s, 'gantt-lite')
  ;[['调研', 0, 2], ['建设', 1, 3], ['试点', 2, 4], ['扩面', 3, 5]].forEach((r, i) => {
    const y = 1.7 + i * 1.05
    txt(s, r[0], { x: M, y: y + 0.15, w: 1.6, h: 0.45, fontSize: 14 })
    const unit = (CW - 2.0) / 6
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: M + 1.9 + r[1] * unit, y, w: (r[2] - r[1]) * unit, h: 0.7, fill: { color: RED }, rectRadius: 0.05 })
  })
  foot(s, page, total)

})
reg('gantt-miles', (s, page) => {

  logo(s); titleBand(s, '里程碑甘特'); chip(s, 'gantt-miles')
  s.addShape(pptx.shapes.RECTANGLE, { x: M + 2.0, y: 3.2, w: CW - 2.0, h: 0.03, fill: { color: LINE } })
  ;[['M1', 0.15], ['M2', 0.4], ['M3', 0.65], ['M4', 0.88]].forEach((m) => {
    const x = M + 2.0 + (CW - 2.0) * m[1]
    s.addShape(pptx.shapes.OVAL, { x, y: 3.05, w: 0.3, h: 0.3, fill: { color: RED } })
    txt(s, m[0], { x: x - 0.35, y: 3.55, w: 1.0, h: 0.35, fontSize: 12, align: 'center' })
  })
  ;['启动', '设计完成', '试点完成', '扩面启动'].forEach((t, i) => txt(s, t, { x: M, y: 1.6 + i * 0.55, w: CW, h: 0.4, fontSize: 13, color: MUTED }))
  foot(s, page, total)

})
reg('funnel-4', (s, page) => {

  logo(s); titleBand(s, '转化漏斗（示意）'); chip(s, 'funnel-4')
  ;[['线索', 1.0], ['评估', 0.82], ['试点', 0.64], ['签约', 0.48]].forEach((st, i) => {
    const maxW = CW * 0.7, w = maxW * st[1], x = M + (CW - w) / 2, y = 1.55 + i * 1.15
    card(s, x, y, w, 1.0)
    txt(s, `${st[0]}  ·  阶段 ${i + 1}`, { x, y: y + 0.28, w, h: 0.45, fontSize: 15, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('pyramid-4', (s, page) => {

  logo(s); titleBand(s, '能力金字塔'); chip(s, 'pyramid-4')
  ;[['战略目标', 0.45], ['制度流程', 0.6], ['平台工具', 0.75], ['基础资源', 0.9]].forEach((st, i) => {
    const w = CW * st[1], x = M + (CW - w) / 2, y = 1.55 + i * 1.15
    card(s, x, y, w, 1.0)
    txt(s, st[0], { x, y: y + 0.28, w, h: 0.45, fontSize: 15, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('cycle-4', (s, page) => {

  logo(s); titleBand(s, '持续改进环'); chip(s, 'cycle-4')
  ;['计划', '执行', '检查', '改进'].forEach((t, i) => {
    const colW = (CW - GAP * 3) / 4, x = M + i * (colW + GAP)
    card(s, x, 2.4, colW, 2.8)
    txt(s, String(i + 1), { x: x + 0.1, y: 2.8, w: colW - 0.2, h: 0.5, fontSize: 20, bold: true, color: RED, align: 'center' })
    txt(s, t, { x: x + 0.1, y: 3.6, w: colW - 0.2, h: 0.5, fontSize: 16, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('fishbone-lite', (s, page) => {

  logo(s); titleBand(s, '因果分析（简图）'); chip(s, 'fishbone-lite')
  s.addShape(pptx.shapes.RECTANGLE, { x: M + 1.5, y: 3.5, w: CW - 3.0, h: 0.04, fill: { color: RED } })
  card(s, W - M - 2.2, 3.1, 2.0, 0.9)
  txt(s, '结果', { x: W - M - 2.2, y: 3.3, w: 2.0, h: 0.5, fontSize: 14, bold: true, align: 'center' })
  ;['人员', '流程', '工具', '数据'].forEach((t, i) => {
    const y = 1.55 + (i % 2) * 3.2
    const x = M + 1.8 + Math.floor(i / 2) * 3.5
    card(s, x, y, 2.4, 0.9)
    txt(s, t, { x, y: y + 0.22, w: 2.4, h: 0.45, fontSize: 14, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('force-field', (s, page) => {

  logo(s); titleBand(s, '动力 / 阻力场'); chip(s, 'force-field')
  colCards(s, [
    { h: '动力', items: ['领导重视', '客户紧迫感', '规范已就绪'] },
    { h: '阻力', items: ['编制不足', '习惯路径依赖', '局部定制压力'] },
  ])
  foot(s, page, total)

})
reg('risk-heat', (s, page) => {

  logo(s); titleBand(s, '风险影响矩阵'); chip(s, 'risk-heat')
  gridCards(s, [
    { h: '高影响·高可能', t: '编制缺口' }, { h: '高影响·低可能', t: '重大故障' },
    { h: '低影响·高可能', t: '小需求堆积' }, { h: '低影响·低可能', t: '边角兼容' },
  ])
  foot(s, page, total)

})
reg('heat-lite', (s, page) => {

  logo(s); titleBand(s, '模块健康度（示意）'); chip(s, 'heat-lite')
  const mods = ['调度', '监控', '工单', '知识', '权限', '报表', 'API', '培训', '演练']
  mods.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3)
    const colW = (CW - GAP * 2) / 3, rowH = 1.35
    const x = M + col * (colW + GAP), y = 1.55 + row * (rowH + GAP)
    card(s, x, y, colW, rowH)
    txt(s, t, { x: x + 0.2, y: y + 0.4, w: colW - 0.4, h: 0.45, fontSize: 15, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('big-number', (s, page) => {

  logo(s); chip(s, 'big-number')
  txt(s, '99.95%', { x: M, y: 2.4, w: CW, h: 1.4, fontSize: 72, bold: true, color: RED, align: 'center' })
  txt(s, '核心调度链路月度可用性', { x: M, y: 4.1, w: CW, h: 0.5, fontSize: 18, align: 'center' })
  foot(s, page, total)

})
reg('big-number-pair', (s, page) => {

  logo(s); titleBand(s, '成对关键数字'); chip(s, 'big-number-pair')
  ;[{ v: '12m', l: '告警中位响应' }, { v: '3', l: '未关闭高风险' }].forEach((it, i) => {
    const colW = (CW - GAP) / 2, x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 4.0)
    txt(s, it.v, { x: x + 0.2, y: 2.7, w: colW - 0.4, h: 1.1, fontSize: 48, bold: true, color: RED, align: 'center' })
    txt(s, it.l, { x: x + 0.2, y: 4.2, w: colW - 0.4, h: 0.5, fontSize: 16, align: 'center' })
  })
  foot(s, page, total)

})
reg('metric-bars', (s, page) => {

  logo(s); titleBand(s, '指标条形示意'); chip(s, 'metric-bars')
  ;[['可用性', 0.92], ['闭环率', 0.78], ['文档完备', 0.65], ['培训覆盖', 0.55]].forEach((r, i) => {
    const y = 1.7 + i * 1.1
    txt(s, r[0], { x: M, y: y + 0.1, w: 2.2, h: 0.4, fontSize: 14 })
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: M + 2.4, y, w: (CW - 2.4) * r[1], h: 0.65, fill: { color: RED }, rectRadius: 0.05 })
  })
  foot(s, page, total)

})
reg('bar-frame', (s, page) => {

  logo(s); titleBand(s, '柱状图占位'); chip(s, 'bar-frame')
  card(s, M, 1.55, CW, 4.5)
  txt(s, '此处插入柱状图（原生图表）', { x: M, y: 3.3, w: CW, h: 0.5, fontSize: 16, color: MUTED, align: 'center' })
  foot(s, page, total)

})
reg('pie-frame', (s, page) => {

  logo(s); titleBand(s, '饼图占位'); chip(s, 'pie-frame')
  card(s, M, 1.55, CW * 0.55, 4.5)
  txt(s, '饼图区域', { x: M, y: 3.3, w: CW * 0.55, h: 0.5, fontSize: 15, color: MUTED, align: 'center' })
  card(s, M + CW * 0.58, 1.55, CW * 0.42, 4.5)
  ;['类别 A 40%', '类别 B 35%', '类别 C 25%'].forEach((t, i) => txt(s, `·  ${t}`, { x: M + CW * 0.58 + 0.3, y: 2.3 + i * 0.8, w: CW * 0.42 - 0.6, h: 0.5, fontSize: 14 }))
  foot(s, page, total)

})
reg('line-frame', (s, page) => {

  logo(s); titleBand(s, '折线图占位'); chip(s, 'line-frame')
  card(s, M, 1.55, CW, 4.5)
  txt(s, '此处插入折线图（趋势）', { x: M, y: 3.3, w: CW, h: 0.5, fontSize: 16, color: MUTED, align: 'center' })
  foot(s, page, total)

})
reg('combo-frame', (s, page) => {

  logo(s); titleBand(s, '组合图占位'); chip(s, 'combo-frame')
  card(s, M, 1.55, CW * 0.68, 4.5)
  txt(s, '柱 + 折线组合图区域', { x: M, y: 3.3, w: CW * 0.68, h: 0.5, fontSize: 15, color: MUTED, align: 'center' })
  card(s, M + CW * 0.71, 1.55, CW * 0.29, 4.5)
  txt(s, '注释', { x: M + CW * 0.71 + 0.2, y: 2.0, w: CW * 0.29 - 0.4, h: 0.4, fontSize: 14, bold: true })
  txt(s, '替换为真实数据与口径说明', { x: M + CW * 0.71 + 0.2, y: 2.6, w: CW * 0.29 - 0.4, h: 2.0, fontSize: 12, color: MUTED })
  foot(s, page, total)

})
reg('map-ph', (s, page) => {

  logo(s); titleBand(s, '区域布局示意（地图占位）'); chip(s, 'map-ph')
  card(s, M, 1.55, CW * 0.62, 4.5)
  txt(s, '地图 / 拓扑占位', { x: M, y: 3.3, w: CW * 0.62, h: 0.5, fontSize: 16, color: MUTED, align: 'center' })
  card(s, M + CW * 0.65, 1.55, CW * 0.35, 4.5)
  ;['华北节点', '华东节点', '华南节点'].forEach((t, i) => txt(s, `·  ${t}`, { x: M + CW * 0.65 + 0.25, y: 2.3 + i * 0.85, w: CW * 0.35 - 0.5, h: 0.55, fontSize: 14 }))
  foot(s, page, total)

})
reg('photo-caption', (s, page) => {

  logo(s); titleBand(s, '图文说明'); chip(s, 'photo-caption')
  card(s, M, 1.55, CW * 0.55, 4.5)
  if (fs.existsSync(logoPath)) s.addImage({ path: logoPath, x: M + CW * 0.55 / 2 - 1.1, y: 3.0, w: 2.2, h: 2.2 / 2.506 })
  txt(s, '配图区（可换实景）', { x: M, y: 5.3, w: CW * 0.55, h: 0.35, fontSize: 12, color: MUTED, align: 'center' })
  card(s, M + CW * 0.58, 1.55, CW * 0.42, 4.5)
  txt(s, '说明文字', { x: M + CW * 0.58 + 0.25, y: 2.0, w: CW * 0.42 - 0.5, h: 0.4, fontSize: 16, bold: true })
  txt(s, '用于机房、现场或界面截图旁注，保持留白。', { x: M + CW * 0.58 + 0.25, y: 2.7, w: CW * 0.42 - 0.5, h: 2.2, fontSize: 14, color: MUTED })
  foot(s, page, total)

})
reg('photo-grid-2', (s, page) => {

  logo(s); titleBand(s, '双图对比'); chip(s, 'photo-grid-2')
  ;['现场 A', '现场 B'].forEach((t, i) => {
    const colW = (CW - GAP) / 2, x = M + i * (colW + GAP)
    card(s, x, 1.55, colW, 4.5)
    txt(s, t, { x: x + 0.25, y: 3.4, w: colW - 0.5, h: 0.5, fontSize: 16, bold: true, align: 'center' })
  })
  foot(s, page, total)

})
reg('quote-attr', (s, page) => {

  logo(s); chip(s, 'quote-attr')
  txt(s, '「标准先行，例外可控。」', { x: M + 0.4, y: 2.5, w: CW - 0.8, h: 1.2, fontSize: 26, bold: true })
  s.addShape(pptx.shapes.RECTANGLE, { x: M + 0.4, y: 4.0, w: 1.5, h: 0.035, fill: { color: RED } })
  txt(s, '— 项目督导组', { x: M + 0.4, y: 4.3, w: CW - 0.8, h: 0.4, fontSize: 14, color: MUTED })
  foot(s, page, total)

})
reg('testimonial-2', (s, page) => {

  logo(s); titleBand(s, '两则反馈摘要'); chip(s, 'testimonial-2')
  ;['试点单位反馈流程更清晰', '值班同学反馈告警噪声下降'].forEach((t, i) => {
    const colW = (CW - GAP) / 2, x = M + i * (colW + GAP)
    card(s, x, 1.8, colW, 4.0)
    txt(s, t, { x: x + 0.35, y: 3.2, w: colW - 0.7, h: 1.2, fontSize: 16, align: 'center' })
  })
  foot(s, page, total)

})
reg('decision', (s, page) => {

  logo(s); titleBand(s, '提请决策'); chip(s, 'decision')
  card(s, M, 1.55, CW, 4.5)
  txt(s, '请批准：按「统一平台 + 试点扩面」路径执行，并锁定编制与预算。', { x: M + 0.5, y: 2.5, w: CW - 1.0, h: 1.2, fontSize: 20, bold: true })
  txt(s, '备选：维持现状（不推荐） / 全面自建（周期不可控）', { x: M + 0.5, y: 4.2, w: CW - 1.0, h: 0.6, fontSize: 14, color: MUTED })
  foot(s, page, total)

})
reg('signoff', (s, page) => {

  logo(s); titleBand(s, '签批页'); chip(s, 'signoff')
  s.addTable([
    [{ text: '角色', options: { bold: true } }, { text: '姓名', options: { bold: true } }, { text: '意见', options: { bold: true } }, { text: '日期', options: { bold: true } }],
    ['起草', '', '', ''], ['审核', '', '', ''], ['批准', '', '', ''],
  ], { x: M, y: 1.55, w: CW, h: 4.3, colW: [CW * 0.2, CW * 0.25, CW * 0.35, CW * 0.2], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'center', valign: 'middle' })
  foot(s, page, total)

})
reg('qa', (s, page) => {

  logo(s); titleBand(s, '问答'); chip(s, 'qa')
  card(s, M, 2.2, CW, 3.2)
  txt(s, 'Q & A', { x: M, y: 3.2, w: CW, h: 0.8, fontSize: 40, bold: true, color: RED, align: 'center' })
  txt(s, '请提问', { x: M, y: 4.2, w: CW, h: 0.4, fontSize: 16, color: MUTED, align: 'center' })
  foot(s, page, total)

})
reg('glossary', (s, page) => {

  logo(s); titleBand(s, '名词表'); chip(s, 'glossary')
  s.addTable([
    [{ text: '名词', options: { bold: true } }, { text: '含义', options: { bold: true } }],
    ['闭环', '告警到复盘的完整路径'], ['基线', '可复制的标准配置与规范'], ['扩面', '在试点成功后复制到更多客户'],
  ], { x: M, y: 1.55, w: CW, h: 4.0, colW: [CW * 0.25, CW * 0.75], border: [{ pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }, { pt: 0.5, color: LINE }], fontFace: FONT, fontSize: 14, color: TEXT, align: 'left', valign: 'middle' })
  foot(s, page, total)

})
reg('refs-sources', (s, page) => {

  logo(s); titleBand(s, '数据来源与参考'); chip(s, 'refs-sources')
  card(s, M, 1.55, CW, 4.5)
  ;['内部运维周报（样例）', '试点验收纪要（样例）', '品牌与模板规范 v0.4.x'].forEach((t, i) => {
    txt(s, `${i + 1}.  ${t}`, { x: M + 0.45, y: 2.1 + i * 0.9, w: CW - 0.9, h: 0.6, fontSize: 15 })
  })
  foot(s, page, total)

})
reg('contact-card', (s, page) => {

  logo(s); titleBand(s, '联系方式'); chip(s, 'contact-card')
  card(s, M + CW * 0.15, 2.0, CW * 0.7, 3.5)
  txt(s, '曙光云项目组', { x: M + CW * 0.15, y: 2.5, w: CW * 0.7, h: 0.5, fontSize: 20, bold: true, align: 'center' })
  txt(s, '邮箱：contact@example.com', { x: M + CW * 0.15, y: 3.4, w: CW * 0.7, h: 0.4, fontSize: 14, color: MUTED, align: 'center' })
  txt(s, '电话：000-0000-0000', { x: M + CW * 0.15, y: 4.0, w: CW * 0.7, h: 0.4, fontSize: 14, color: MUTED, align: 'center' })
  foot(s, page, total)

})
reg('back-cover', (s, page) => {

  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: SUBTLE } })
  if (fs.existsSync(logoPath)) { const lw = 2.0; s.addImage({ path: logoPath, x: (W - lw) / 2, y: 2.4, w: lw, h: lw / 2.506 }) }
  chip(s, 'back-cover')
  txt(s, '曙光云', { x: M, y: 4.0, w: CW, h: 0.5, fontSize: 22, bold: true, align: 'center' })
  txt(s, '内部资料 · 注意保密', { x: M, y: 4.7, w: CW, h: 0.4, fontSize: 13, color: MUTED, align: 'center' })

})

const missing = LAYOUT_IDS.filter((id) => !builders[id])
if (missing.length) {
  console.error('missing builders:', missing.join(','))
  process.exit(1)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isMain) {
LAYOUT_IDS.forEach((id, idx) => {
  const s = pptx.addSlide()
  builders[id](s, idx + 1)
})

const out = path.resolve(skillRoot, arg('out', 'examples/sample-deck.pptx'))
fs.mkdirSync(path.dirname(out), { recursive: true })
await pptx.writeFile({ fileName: out })
console.log(`build-deck: wrote ${path.relative(repoRoot, out)} (${total} layouts, brand.red #${RED})`)
console.log('layout-ids: ' + LAYOUT_IDS.join(','))
}
