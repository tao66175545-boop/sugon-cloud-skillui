import brandLogo from '../assets/brand-logo.svg'
import { useMemo, useState } from 'react'
import tokens from './tokens.generated.json'

type InstallKey = keyof typeof tokens.install

const INSTALL_LABELS: Record<InstallKey, string> = {
  skills: 'Agent Skills',
  skillsPinned: `Skills（锁 v${tokens.version}）`,
  shadcnKit: 'shadcn · brand-kit',
  shadcnTokens: 'shadcn · tokens',
  shadcnTheme: 'shadcn · theme',
  cdnTokens: 'CDN tokens.css',
  cdnComponents: 'CDN components.css',
}

const SWATCH_KEYS = [
  'primary',
  'primary-hover',
  'primary-muted',
  'bg',
  'bg-subtle',
  'bg-muted',
  'surface',
  'border',
  'text',
  'text-secondary',
  'text-muted',
  'success',
  'warning',
  'danger',
] as const

export function Playground() {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeInstall, setActiveInstall] = useState<InstallKey>('shadcnKit')

  const command = tokens.install[activeInstall]

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

  const radiusEntries = useMemo(() => Object.entries(tokens.radius), [])
  const textEntries = useMemo(() => Object.entries(tokens.text), [])

  return (
    <div className="playground" data-testid="playground">
      <section className="playground-hero">
        <p className="playground-eyebrow">风格供给层 · v{tokens.version}</p>
        <h1 className="playground-title">看见曙光红，再复制安装命令</h1>
        <p className="playground-lead">
          下面预览用的就是公开安装后会拿到的 <code>tokens.css</code> +{' '}
          <code>components.css</code>。不需要 API Key。对话归库已移到「实验」页签。
        </p>
      </section>

      
      <section className="playground-brand" aria-label="品牌识别">
        <div className="playground-brand-row">
          <img src={brandLogo} alt="曙光云 Sugon" className="playground-brand-logo" width={200} height={80} />
          <div className="playground-brand-meta">
            <h2 className="playground-panel-title" style={{ margin: 0 }}>识别层 · brand.red</h2>
            <p className="playground-brand-note">
              Logo 与 VI 用 <code>#AF1F24</code>；网页按钮仍用 UI <code>#C8161D</code>。装{' '}
              <code>sugon-brand-core</code> / <code>sugon-logo-usage</code> 获取规则与脚本。
            </p>
            <div className="playground-brand-swatches">
              <span className="playground-swatch-chip" style={{ background: '#AF1F24' }} title="brand.red" />
              <code>#AF1F24</code>
              <span className="playground-swatch-chip" style={{ background: '#727272' }} title="brand.gray" />
              <code>#727272</code>
              <span className="playground-swatch-chip" style={{ background: '#C8161D' }} title="ui.primary" />
              <code>#C8161D UI</code>
            </div>
          </div>
        </div>
      </section>

      <div className="playground-grid">
        <aside className="playground-panel" aria-label="令牌面板">
          <h2 className="playground-panel-title">色板</h2>
          <div className="playground-swatches">
            {SWATCH_KEYS.map((key) => {
              const value = tokens.colors[key as keyof typeof tokens.colors]
              if (!value) return null
              return (
                <button
                  key={key}
                  type="button"
                  className="playground-swatch"
                  title={`${key} ${value}`}
                  onClick={() => copy(value, `swatch-${key}`)}
                >
                  <span className="playground-swatch-chip" style={{ background: value }} />
                  <span className="playground-swatch-meta">
                    <strong>{key}</strong>
                    <code>{value}</code>
                  </span>
                </button>
              )
            })}
          </div>

          <h2 className="playground-panel-title" style={{ marginTop: 'var(--space-6)' }}>
            圆角 / 字阶
          </h2>
          <div className="playground-scales">
            {radiusEntries.map(([k, v]) => (
              <div key={k} className="playground-scale-row">
                <span
                  className="playground-radius-demo"
                  style={{ borderRadius: v }}
                  title={`radius-${k}`}
                />
                <code>
                  {k} · {v}
                </code>
              </div>
            ))}
          </div>
          <div className="playground-type-scale">
            {textEntries.map(([k, v]) => (
              <div key={k} className="playground-type-row" style={{ fontSize: v }}>
                <span>字阶 {k}</span>
                <code>{v}</code>
              </div>
            ))}
          </div>
        </aside>

        <section className="playground-preview" aria-label="实时预览">
          <h2 className="playground-panel-title">实时预览 · sugon-* 类</h2>

          <div className="playground-preview-stack">
            <div className="sugon-card">
              <h3 className="sugon-card-title">工单摘要</h3>
              <p className="sugon-card-body">
                主色 <strong style={{ color: 'var(--color-primary)' }}>{tokens.primary}</strong>
                。按钮、卡片、表单都来自 <code>components.css</code>，颜色只引用令牌变量。
              </p>
              <div className="playground-btn-row">
                <button type="button" className="sugon-btn sugon-btn-primary" data-testid="playground-primary-btn">
                  主按钮
                </button>
                <button type="button" className="sugon-btn sugon-btn-secondary">
                  次按钮
                </button>
                <button type="button" className="sugon-btn sugon-btn-ghost">
                  幽灵
                </button>
                <button type="button" className="sugon-btn sugon-btn-primary" disabled>
                  禁用
                </button>
              </div>
            </div>

            <form className="sugon-card" onSubmit={(e) => e.preventDefault()}>
              <h3 className="sugon-card-title">新建联系人</h3>
              <div className="sugon-field">
                <label className="sugon-label" htmlFor="pg-name">
                  姓名
                </label>
                <input id="pg-name" className="sugon-input" placeholder="张三" defaultValue="李涛" />
                <p className="sugon-help">显示在工单页眉</p>
              </div>
              <div className="sugon-field">
                <label className="sugon-label" htmlFor="pg-role">
                  角色
                </label>
                <select id="pg-role" className="sugon-select" defaultValue="owner">
                  <option value="owner">负责人</option>
                  <option value="member">成员</option>
                </select>
              </div>
              <div className="sugon-field">
                <label className="sugon-label" htmlFor="pg-email">
                  邮箱（错误态）
                </label>
                <input
                  id="pg-email"
                  className="sugon-input"
                  aria-invalid="true"
                  defaultValue="not-an-email"
                />
                <p className="sugon-error">请输入有效邮箱</p>
              </div>
              <label className="sugon-check">
                <input type="checkbox" defaultChecked />
                <span>同步到通知中心</span>
              </label>
            </form>
          </div>
        </section>
      </div>

      <div className="playground-install-bar" role="region" aria-label="安装命令">
        <div className="playground-install-inner">
          <div className="playground-install-tabs">
            {(Object.keys(INSTALL_LABELS) as InstallKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={
                  key === activeInstall
                    ? 'playground-install-tab is-active'
                    : 'playground-install-tab'
                }
                onClick={() => setActiveInstall(key)}
              >
                {INSTALL_LABELS[key]}
              </button>
            ))}
          </div>
          <div className="playground-install-row">
            <code className="playground-install-cmd">{command}</code>
            <button
              type="button"
              className="sugon-btn sugon-btn-primary playground-copy-btn"
              onClick={() => copy(command, 'install')}
            >
              {copied === 'install' ? '已复制' : '复制命令'}
            </button>
          </div>
          <p className="playground-install-note">
            纯 Vite 项目装完后，在入口 CSS 顶部加两行{' '}
            <code>@import &quot;./styles/sugon-tokens.css&quot;</code> 与{' '}
            <code>@import &quot;./styles/sugon-components.css&quot;</code>
            。已有 <code>components.json</code> 时这两行会自动写入。版本锁定{' '}
            <strong>v{tokens.version}</strong>。
          </p>
        </div>
      </div>
    </div>
  )
}
