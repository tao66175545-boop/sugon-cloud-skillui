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
  const primary = p?.colors[0]?.value || '#9ca3af'
  const surface =
    p?.colors.find((c) => c.name === 'surface' || c.name === 'bg')?.value ||
    '#ffffff'
  const text = p?.colors.find((c) => c.name === 'text')?.value || '#0f172a'
  const border =
    p?.colors.find((c) => c.name === 'border')?.value || '#e2e8f0'
  const muted =
    p?.colors.find((c) => c.name === 'muted' || c.name === 'text-secondary')
      ?.value || '#64748b'

  return (
    <>
      <style>{`
        :host { display: block; width: 100%; }
        * { box-sizing: border-box; }
        .card {
          font-family: ${p?.fontSans || 'system-ui, sans-serif'};
          color: ${text};
          background: ${surface};
          border: 1px solid ${border};
          border-radius: 1rem;
          padding: 1rem 1.125rem;
          display: grid;
          gap: 0.75rem;
          box-shadow: 0 1px 2px 0 rgb(23 23 23 / 0.05);
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
          color: ${primary};
        }
        .badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.125rem 0.4rem;
          border-radius: 9999px;
          background: color-mix(in srgb, ${primary} 14%, transparent);
          color: ${primary};
          border: 1px solid color-mix(in srgb, ${primary} 35%, transparent);
        }
        .purpose {
          margin: 0;
          font-size: 0.8125rem;
          color: ${muted};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .path {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.75rem;
          word-break: break-all;
          color: ${text};
        }
        .meta {
          margin: 0;
          font-size: 0.6875rem;
          color: ${muted};
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
          border: 1px solid ${border};
          flex-shrink: 0;
        }
        .type-sample {
          margin: 0;
          font-size: ${p?.textSampleSize || '1rem'};
          line-height: 1.4;
          color: ${text};
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
          color: ${muted};
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }
        .space-bar {
          height: 0.4rem;
          border-radius: 0.2rem;
          background: color-mix(in srgb, ${primary} 55%, ${border});
          min-width: 0.25rem;
        }
        .actions {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.15rem;
        }
        button {
          height: 2rem;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid ${border};
          background: ${surface};
          color: ${text};
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        button.primary {
          background: ${primary};
          color: #fff;
          border-color: ${primary};
        }
        button:hover { filter: brightness(0.97); }
        .feedback {
          margin: 0;
          font-size: 0.75rem;
          color: ${primary};
          font-weight: 600;
          min-height: 1.1em;
        }
        .loading {
          margin: 0;
          font-size: 0.8125rem;
          color: ${muted};
        }
      `}</style>
      <div className="card">
        {loading || !model ? (
          <p className="loading">加载风格预览…</p>
        ) : (
          <>
            <div className="head">
              <p className="name">{model.skill.name}</p>
              <span className="badge">{model.sourceBadge}</span>
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
            <p className="type-sample">Aa 曙光云 SkillUI · 字体样例</p>
            <div className="spaces" aria-label="间距">
              {model.preview.spaces.map((s) => (
                <div key={s.name} className="space-row">
                  <span style={{ width: '4.5rem' }}>{s.name}</span>
                  <span className="space-bar" style={{ width: s.value }} />
                  <span>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="actions">
              <button type="button" className="primary" onClick={onSelect}>
                选用
              </button>
              <button type="button" onClick={onCopyPath}>
                复制 path
              </button>
              <button type="button" onClick={onCopyImport}>
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