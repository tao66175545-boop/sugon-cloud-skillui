import { useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Skill } from '../lib/skills'
import {
  copyText,
  loadStylePreview,
  type StylePreviewModel,
} from '../lib/stylePreview'

type StylePreviewCardProps = {
  skill: Skill
  onSelect: (skill: Skill) => void
}

/**
 * In-chat style preview card.
 * Isolation choice: Shadow DOM (not iframe) — preview CSS vars/fonts stay
 * inside the shadow root and never overwrite the shell :root primary/font.
 * Switching away / unmount restores the shell automatically.
 */
export function StylePreviewCard({ skill, onSelect }: StylePreviewCardProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const [model, setModel] = useState<StylePreviewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setModel(null)
    void loadStylePreview(skill).then((m) => {
      if (cancelled) return
      setModel(m)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [skill.id, skill.path, skill.name, skill.purpose, skill.content])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    if (!rootRef.current) {
      rootRef.current = createRoot(shadow)
    }
    const root = rootRef.current

    root.render(
      <ShadowCardFace
        loading={loading}
        model={model}
        feedback={feedback}
        onSelect={() => {
          if (!model) return
          onSelectRef.current(model.skill)
          setFeedback('已选用（当前会话）')
          window.setTimeout(() => setFeedback(null), 2000)
        }}
        onCopyPath={() => {
          if (!model) return
          void copyText(model.skill.path).then((ok) => {
            setFeedback(ok ? '已复制 path' : '复制失败')
            window.setTimeout(() => setFeedback(null), 2000)
          })
        }}
        onCopyImport={() => {
          if (!model) return
          void copyText(model.importSnippet).then((ok) => {
            setFeedback(ok ? '已复制 @import' : '复制失败')
            window.setTimeout(() => setFeedback(null), 2000)
          })
        }}
      />,
    )

    return () => {
      // Keep root across prop updates; only unmount when host leaves the tree.
    }
  }, [loading, model, feedback])

  useEffect(() => {
    return () => {
      const root = rootRef.current
      rootRef.current = null
      // Avoid synchronous unmount inside React's effect cleanup cycle.
      setTimeout(() => root?.unmount(), 0)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      data-style-preview-card
      style={{ display: 'block', width: '100%' }}
    />
  )
}

function sandboxStyleBlock(vars: Record<string, string> | undefined): string {
  if (!vars) return ''
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  return `.card {\n${body}\n}`
}

function ShadowCardFace({
  loading,
  model,
  feedback,
  onSelect,
  onCopyPath,
  onCopyImport,
}: {
  loading: boolean
  model: StylePreviewModel | null
  feedback: string | null
  onSelect: () => void
  onCopyPath: () => void
  onCopyImport: () => void
}) {
  const p = model?.preview
  const primary =
    p?.colors.find((c) => c.name === 'primary' || c.name === 'accent')?.value ||
    p?.colors[0]?.value ||
    '#C8161D'
  const surface =
    p?.colors.find((c) => c.name === 'surface' || c.name === 'bg')?.value ||
    '#ffffff'
  const text = p?.colors.find((c) => c.name === 'text')?.value || '#171717'
  const border =
    p?.colors.find((c) => c.name === 'border')?.value || '#e5e5e5'
  const muted =
    p?.colors.find((c) => c.name === 'muted' || c.name === 'text-secondary')
      ?.value || '#525252'

  return (
    <>
      <style>{`
        :host { display: block; width: 100%; }
        * { box-sizing: border-box; }
        ${sandboxStyleBlock(p?.sandboxVars)}
        .card {
          font-family: var(--font-sans, ${p?.fontSans || 'system-ui, sans-serif'});
          color: var(--color-text, ${text});
          background: var(--color-surface, ${surface});
          border: 1px solid var(--color-border, ${border});
          border-radius: 1rem;
          padding: 1rem 1.125rem;
          display: grid;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(23 23 23 / 0.05));
        }
        .head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .name {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--color-text, ${text});
        }
        .badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.125rem 0.4rem;
          border-radius: 9999px;
          background: var(--color-primary-muted, #FCE8E9);
          color: var(--color-primary, ${primary});
          border: 1px solid color-mix(in srgb, var(--color-primary, ${primary}) 22%, transparent);
        }
        .badge.seed {
          background: var(--color-bg-muted, #f4f4f5);
          color: var(--color-text-secondary, ${muted});
          border: 1px solid var(--color-border, #e5e5e5);
        }
        .purpose {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--color-text-secondary, ${muted});
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .path {
          margin: 0;
          font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
          font-size: 0.75rem;
          word-break: break-all;
          color: var(--color-text-secondary, ${muted});
        }
        .meta {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--color-text-secondary, ${muted});
        }
        .swatches {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .swatch {
          width: 1.35rem;
          height: 1.35rem;
          border-radius: 0.35rem;
          border: 1px solid var(--color-border, ${border});
          flex-shrink: 0;
        }
        .type-sample {
          margin: 0;
          font-size: ${p?.textSampleSize || '1rem'};
          line-height: 1.4;
          color: var(--color-text, ${text});
        }
        .spaces {
          display: grid;
          gap: 0.3rem;
        }
        .space-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6875rem;
          color: var(--color-text-secondary, ${muted});
          font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
        }
        .space-bar {
          height: 0.4rem;
          border-radius: 0.2rem;
          background: color-mix(in srgb, var(--color-primary, ${primary}) 55%, var(--color-border, ${border}));
          min-width: 0.25rem;
        }
        /* —— Deepen: demo controls (shadow-only, do not touch shell) —— */
        .deepen {
          display: grid;
          gap: 0.55rem;
          padding-top: 0.15rem;
          border-top: 1px dashed var(--color-border, ${border});
        }
        .deepen-label {
          margin: 0;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--color-text-secondary, ${muted});
        }
        .demo-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3, 0.75rem);
          align-items: center;
        }
        .demo-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: var(--btn-height, 2.25rem);
          padding-inline: var(--btn-px, 1rem);
          border-radius: var(--btn-radius, 0.75rem);
          font-size: var(--btn-font-size, 0.875rem);
          font-weight: var(--btn-font-weight, 600);
          font-family: inherit;
          line-height: 1;
          cursor: pointer;
          transition: var(--btn-transition, background-color 150ms ease, box-shadow 150ms ease);
        }
        .demo-btn-primary {
          color: var(--color-primary-foreground, #fff);
          background: var(--color-primary, ${primary});
          border: none;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(23 23 23 / 0.05));
        }
        .demo-btn-primary:hover {
          background: var(--color-primary-hover, ${primary});
          box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(23 23 23 / 0.08));
        }
        .demo-btn-primary:focus-visible {
          outline: none;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(23 23 23 / 0.05)), var(--focus-ring-strong, 0 0 0 3px color-mix(in srgb, ${primary} 28%, transparent));
        }
        .demo-btn-secondary {
          color: var(--color-text, ${text});
          background: var(--color-surface, ${surface});
          border: 1px solid var(--color-border-strong, ${border});
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(23 23 23 / 0.05));
        }
        .demo-btn-secondary:hover {
          background: var(--color-bg-muted, #f3f4f6);
        }
        .demo-btn-secondary:focus-visible {
          outline: none;
          border-color: var(--color-primary, ${primary});
          box-shadow: var(--focus-ring, 0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent));
        }
        .demo-input {
          width: 100%;
          max-width: 16rem;
          padding: 0.55rem 0.75rem;
          border: 1px solid var(--color-border-strong, ${border});
          border-radius: var(--radius-md, 0.5rem);
          background: var(--color-surface, ${surface});
          color: var(--color-text, ${text});
          font-size: var(--text-sm, 0.875rem);
          font-family: inherit;
          line-height: var(--leading-normal, 1.5);
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .demo-input::placeholder {
          color: var(--color-text-muted, ${muted});
        }
        .demo-input:hover:not(:disabled):not(:focus) {
          border-color: var(--color-text-muted, ${muted});
        }
        .demo-input:focus-visible {
          outline: none;
          border-color: var(--color-primary, ${primary});
          box-shadow: var(--focus-ring-strong, 0 0 0 3px color-mix(in srgb, ${primary} 28%, transparent));
        }
        .type-scale {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.75rem 1.25rem;
        }
        .type-scale-item {
          margin: 0;
          color: var(--color-text, ${text});
          line-height: 1.3;
        }
        .type-scale-item .tag {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--color-text-secondary, ${muted});
          font-family: var(--font-mono, ui-monospace, monospace);
          margin-bottom: 0.15rem;
        }
        .type-scale-sm { font-size: var(--text-sm, 0.875rem); }
        .type-scale-base { font-size: var(--text-base, 1rem); }
        .type-scale-xl { font-size: var(--text-xl, 1.25rem); font-weight: 600; }
        .actions {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.15rem;
        }
        button.action {
          height: 2rem;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border, ${border});
          background: var(--color-surface, ${surface});
          color: var(--color-text, ${text});
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        button.action.primary {
          background: var(--color-primary, ${primary});
          color: var(--color-primary-foreground, #fff);
          border-color: var(--color-primary, ${primary});
        }
        button.action:hover { filter: brightness(0.97); }
        button.action:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring-strong, 0 0 0 3px color-mix(in srgb, ${primary} 28%, transparent));
        }
        .feedback {
          margin: 0;
          font-size: 0.75rem;
          color: var(--color-primary, ${primary});
          font-weight: 600;
          min-height: 1.1em;
        }
        .loading {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--color-text-secondary, ${muted});
        }
      `}</style>
      <div className="card">
        {loading || !model ? (
          <p className="loading">加载风格预览…</p>
        ) : (
          <>
            <div className="head">
              <p className="name">{model.skill.name}</p>
              <span className={`badge${model.sourceBadge === '种子' ? ' seed' : ''}`}>{model.sourceBadge}</span>
            </div>
            <p className="purpose" title={model.skill.purpose}>
              {model.skill.purpose}
            </p>
            <p className="path">{model.skill.path}</p>
            <p className="meta">预览色来源：{model.preview.colorSource}</p>
            <div className="swatches" aria-label="色板">
              {model.preview.colors.map((c) => (
                <span
                  key={`${c.name}-${c.value}`}
                  className="swatch"
                  title={`${c.name}: ${c.value}`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
            <p className="type-sample">Aa · {model.shortLabel} · 字体样例</p>
            <div className="spaces" aria-label="间距">
              {model.preview.spaces.map((s) => (
                <div key={s.name} className="space-row">
                  <span style={{ width: '4.5rem' }}>{s.name}</span>
                  <span className="space-bar" style={{ width: s.value }} />
                  <span>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="deepen" data-style-preview-deepen>
              <p className="deepen-label">组件态 · 字阶对比</p>
              <div className="demo-row" aria-label="主次按钮">
                <button type="button" className="demo-btn demo-btn-primary">
                  主按钮
                </button>
                <button type="button" className="demo-btn demo-btn-secondary">
                  次按钮
                </button>
              </div>
              <div className="demo-row" aria-label="输入框">
                <input
                  className="demo-input"
                  type="text"
                  placeholder="空态输入 · 点此看焦点"
                  aria-label="预览输入框"
                />
              </div>
              <div className="type-scale" aria-label="字阶对比">
                <p className="type-scale-item type-scale-sm">
                  <span className="tag">text-sm</span>
                  字阶对比
                </p>
                <p className="type-scale-item type-scale-base">
                  <span className="tag">text-base</span>
                  字阶对比
                </p>
                <p className="type-scale-item type-scale-xl">
                  <span className="tag">text-xl</span>
                  字阶对比
                </p>
              </div>
            </div>
            <div className="actions">
              <button
                type="button"
                className="action primary"
                onClick={onSelect}
              >
                选用
              </button>
              <button type="button" className="action" onClick={onCopyPath}>
                复制 path
              </button>
              <button type="button" className="action" onClick={onCopyImport}>
                复制 @import
              </button>
            </div>
            <p className="feedback" role="status">
              {feedback || ''}
            </p>
          </>
        )}
      </div>
    </>
  )
}
