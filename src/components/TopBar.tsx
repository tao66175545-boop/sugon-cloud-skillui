import logoUrl from '../assets/logo.svg'

type TopBarProps = {
  skillCount: number
}

export function TopBar({ skillCount }: TopBarProps) {
  return (
    <header
      className="topbar-frost"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
      }}
    >
      <div
        aria-hidden
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: '0 0 auto',
          height: '100%',
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-surface) 88%, transparent), color-mix(in srgb, var(--color-surface) 55%, transparent))',
        }}
      />
      <div
        className="container-max"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          minHeight: '3.75rem',
          flexWrap: 'wrap',
          paddingBlock: 'var(--space-3)',
        }}
      >
        <a
          href="#agent"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
            color: 'var(--color-text)',
          }}
        >
          <img
            src={logoUrl}
            alt="曙光云"
            width={120}
            height={48}
            style={{
              height: '2.25rem',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <span>
            <strong style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
              曙光云 SkillUI 库
            </strong>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              风格供给层 · 本地可复用 · 已登记 {skillCount} 项
            </span>
          </span>
        </a>
        <nav
          aria-label="页面导航"
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="#agent"
            className="btn-secondary"
            style={{
              height: '2.25rem',
              paddingInline: '0.875rem',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            对话
          </a>
        </nav>
      </div>
    </header>
  )
}
