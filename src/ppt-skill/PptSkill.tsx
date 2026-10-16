/** PPT SKILL 模块页 — 政企 16:9 PPT 供给层入口与样张画廊 */

import { useState } from 'react'

const SAMPLE_PPTX = '/ppt-skill/sugon-od-v3-100.pptx'
const SKILL_PATH = 'skills/sugon-ppt-template/'
const INSTALL_CMD =
  'npx skills add tao66175545-boop/sugon-cloud-skillui --skill sugon-ppt-template'
const DECK_LABEL = 'sugon-od-v3-100 · dehom7 · ind7-YokM0y'

const GALLERY = [
  { src: '/ppt-skill/renders/contact.jpg', alt: '100 页联系表（缩略）', caption: '整本联系表' },
  { src: '/ppt-skill/renders/grid-1.jpg', alt: '预览网格 1', caption: '网格 1' },
  { src: '/ppt-skill/renders/grid-2.jpg', alt: '预览网格 2', caption: '网格 2' },
  { src: '/ppt-skill/renders/grid-3.jpg', alt: '预览网格 3', caption: '网格 3' },
  { src: '/ppt-skill/renders/slide-001.jpg', alt: '第 1 页', caption: 'P001' },
  { src: '/ppt-skill/renders/slide-025.jpg', alt: '第 25 页', caption: 'P025' },
  { src: '/ppt-skill/renders/slide-050.jpg', alt: '第 50 页', caption: 'P050' },
  { src: '/ppt-skill/renders/slide-075.jpg', alt: '第 75 页', caption: 'P075' },
  { src: '/ppt-skill/renders/slide-091.jpg', alt: '第 91 页', caption: 'P091' },
  { src: '/ppt-skill/renders/slide-100.jpg', alt: '第 100 页', caption: 'P100' },
] as const

const NOTES = [
  '识别红 #AF1F24；Logo 横式宽高比约 2.5，右上安全区 ≥8–10mm',
  '标题下短红线上下等距（默认各 6mm）；禁通栏色条 / 粉洗 / 假 KPI',
  '中文优先 Noto Sans CJK SC / Source Han Sans SC；默认不嵌入字体',
  '用户未说「门禁过 / 通过」→ 不宣称交付合格',
] as const

export function PptSkill() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied('fail')
      window.setTimeout(() => setCopied(null), 1600)
    }
  }

  return (
    <div className="ppt-skill" data-testid="ppt-skill">
      <section className="playground-hero">
        <p className="playground-eyebrow">PPT 供给层 · sugon-ppt-template</p>
        <h1 className="playground-title">PPT SKILL · 政企 16:9 演示文稿</h1>
        <p className="playground-lead">
          面向汇报材料、方案讲标与产品介绍的中文 PPT 技能包。装入 Agent 后读取{' '}
          <code>{SKILL_PATH}</code>
          ，按 DESIGN / GATES / RULES 出可编辑 <code>.pptx</code>。下方附带首席演示设计总监最新{' '}
          <strong>100 页样张</strong>（{DECK_LABEL}；预览用，不宣称「门禁过」）。
        </p>
      </section>

      <section className="ppt-skill-panel" aria-label="安装与下载">
        <h2 className="playground-panel-title">安装路径 · 样张下载</h2>
        <div className="ppt-skill-meta">
          <div className="ppt-skill-meta-row">
            <span className="ppt-skill-label">Agent Skills</span>
            <code>{SKILL_PATH}</code>
          </div>
          <div className="ppt-skill-meta-row">
            <span className="ppt-skill-label">技能名</span>
            <code>sugon-ppt-template</code>
          </div>
          <div className="ppt-skill-meta-row">
            <span className="ppt-skill-label">样张版本</span>
            <code>{DECK_LABEL}</code>
          </div>
          <div className="ppt-skill-meta-row">
            <span className="ppt-skill-label">识别红</span>
            <span className="ppt-skill-swatch" style={{ background: '#AF1F24' }} />
            <code>#AF1F24</code>
          </div>
        </div>
        <div className="ppt-skill-actions">
          <a className="sugon-btn sugon-btn-primary" href={SAMPLE_PPTX} download>
            下载 100 页样张 pptx
          </a>
          <button
            type="button"
            className="sugon-btn sugon-btn-secondary"
            onClick={() => copy(INSTALL_CMD, 'install')}
          >
            {copied === 'install' ? '已复制安装命令' : copied === 'fail' ? '复制失败' : '复制安装命令'}
          </button>
          <button
            type="button"
            className="sugon-btn sugon-btn-ghost"
            onClick={() => copy(SKILL_PATH, 'path')}
          >
            {copied === 'path' ? '已复制路径' : '复制技能路径'}
          </button>
        </div>
        <p className="ppt-skill-note">
          仓库内副本：<code>skills/sugon-ppt-template/examples/sugon-od-v3-100.pptx</code>
          （保留旧 <code>sample-deck.pptx</code> 母版展览）。本地：{' '}
          <code>npm run dev</code> 后打开「PPT SKILL」页签。
        </p>
      </section>

      <section className="ppt-skill-panel" aria-label="站立要点">
        <h2 className="playground-panel-title">站立要点（摘录）</h2>
        <ul className="ppt-skill-notes">
          {NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="ppt-skill-panel" aria-label="样张画廊">
        <h2 className="playground-panel-title">样张画廊 · {DECK_LABEL}</h2>
        <p className="ppt-skill-note" style={{ marginBottom: 'var(--space-4)' }}>
          联系表 + 三张网格 + 代表页（001 / 025 / 050 / 075 / 091 / 100）。完整 100 页请下 pptx。
        </p>
        <div className="ppt-skill-gallery">
          {GALLERY.map((item) => (
            <figure key={item.src} className="ppt-skill-card">
              <a href={item.src} target="_blank" rel="noreferrer" className="ppt-skill-thumb-link">
                <img src={item.src} alt={item.alt} className="ppt-skill-thumb" loading="lazy" />
              </a>
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
