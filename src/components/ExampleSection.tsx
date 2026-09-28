import { useState } from 'react'
import { TokenUsageExample } from '../../examples/minimal-reference/TokenUsageExample'

/** 页脚折叠示例：非 Skill 管理入口，仅路径导入演示 */
export function ExampleSection() {
  const [open, setOpen] = useState(false)

  return (
    <footer
      id="example-preview"
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        scrollMarginTop: '5rem',
      }}
    >
      <div
        className="container-max"
        style={{
          paddingBlock: 'var(--space-4)',
          display: 'grid',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            选用说明：在对话说「看库」「选用某某」可复制供给层路径（如{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              design-skills/brand-kit/
            </code>
            ）。最小参考：
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              examples/minimal-reference/
            </code>
          </p>
          <button
            type="button"
            className="btn-secondary"
            style={{ height: '2rem', fontSize: 'var(--text-xs)' }}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? '收起示例' : '展开路径导入示例'}
          </button>
        </div>
        {open && (
          <div>
            <p
              style={{
                margin: '0 0 var(--space-4)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                maxWidth: '40rem',
              }}
            >
              其他项目可按相对路径 @import{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                design-skills/brand-kit/tokens.css
              </code>{' '}
              复用，无需 npm 发布。不引入质量层。
            </p>
            <TokenUsageExample />
          </div>
        )}
      </div>
    </footer>
  )
}
