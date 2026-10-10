import logoUrl from '../assets/logo.svg'
import type { AppTab } from '../App'

type TopBarProps = {
  skillCount: number
  tab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function TopBar({ skillCount, tab, onTabChange }: TopBarProps) {
  return (
    <header
      className="topbar-frost"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid var(--topbar-border)',
      }}
    >
      <div
        className="container-max"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          minHeight: '4rem',
          flexWrap: 'wrap',
          paddingBlock: 'var(--space-3)',
        }}
      >
        <a
          href="#playground"
          onClick={(e) => {
            e.preventDefault()
            onTabChange('playground')
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
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
          <span style={{ display: 'grid', gap: '0.125rem' }}>
            <strong
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-tight)',
              }}
            >
              曙光云 SkillUI 库
            </strong>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--leading-snug)',
              }}
            >
              风格供给层 · Playground · 已登记 {skillCount} 项
            </span>
          </span>
        </a>

        <nav className="app-tabs" aria-label="主导航">
          <button
            type="button"
            className={tab === 'playground' ? 'app-tab is-active' : 'app-tab'}
            aria-current={tab === 'playground' ? 'page' : undefined}
            onClick={() => onTabChange('playground')}
          >
            Playground
          </button>
          <button
            type="button"
            className={tab === 'agent' ? 'app-tab is-active' : 'app-tab'}
            aria-current={tab === 'agent' ? 'page' : undefined}
            onClick={() => onTabChange('agent')}
            title="实验功能：需要自备 LLM Key，归库只写入本机浏览器"
          >
            实验：AI 起草 Skill
          </button>
        </nav>
      </div>
    </header>
  )
}
