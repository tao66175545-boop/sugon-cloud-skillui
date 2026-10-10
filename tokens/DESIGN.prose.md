# 曙光云 SkillUI 库 — 设计规范（sugon-brand-kit）

本规范是风格供给层的视觉语言。**唯一事实来源是仓库根目录 `tokens/sugon.tokens.json`**：本文 YAML frontmatter、颜色表与同目录 `tokens.css` 都由 `npm run build:kit` 生成；手改会被下次生成覆盖。源仓库 `npm run check:tokens` 会校验生成物无漂移。

> **层级：** 风格供给层。代理在生成 UI 之前 / 之中消费本规范。生成后打磨（品味审计、质量检查）属于外部质量层，不要把本文扩成质量包。

## 品牌气质

专业、干净。主色曙光红 `#C8161D`，辅以灰 / 白。留白充足，圆角卡片，清晰字阶。

---

## 颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#C8161D` | 主按钮、链接、关键强调 |
| `--color-primary-hover` | `#A81218` | 主色悬停 |
| `--color-primary-active` | `#8F0F14` | 主色按下 |
| `--color-primary-foreground` | `#ffffff` | 主色上的文字 |
| `--color-primary-muted` | `#FCE8E9` | 浅主色底、焦点环 |
| `--color-accent` | `#C8161D` | 次要强调（与主色一致） |
| `--color-accent-hover` | `#A81218` | 次要强调悬停 |
| `--color-accent-muted` | `#FCE8E9` | 次要强调浅底 |
| `--color-bg` | `#ffffff` | 页面背景 |
| `--color-bg-subtle` | `#fafafa` | 交替区块底、次按钮按下 |
| `--color-bg-muted` | `#f4f4f5` | 弱化面板、次按钮悬停 |
| `--color-surface` | `#ffffff` | 卡片 |
| `--color-border` | `#e5e5e5` | 默认边框 |
| `--color-border-strong` | `#d4d4d4` | 强调边框、次按钮描边 |
| `--color-text` | `#171717` | 主文字 |
| `--color-text-secondary` | `#525252` | 次要正文 |
| `--color-text-muted` | `#a3a3a3` | 说明 / 占位 |
| `--color-text-inverse` | `#ffffff` | 深色 / 主色底上的文字 |
| `--color-success` | `#059669` | 成功 |
| `--color-warning` | `#d97706` | 警告 |
| `--color-danger` | `#C8161D` | 危险 / 错误强调 |
| `--color-danger-muted` | `#FEF2F2` | 错误提示底 |
| `--color-danger-border` | `#FECACA` | 错误提示边框 |
| `--color-danger-foreground` | `#B91C1C` | 错误提示文字 |

焦点环：`--focus-ring`（3px 浅主色）、`--focus-ring-strong`（3px 主色 28% 透明）。

---

## 字体

**家族（`--font-sans`）：** 中文优先 —— `"Noto Sans SC"`, `"PingFang SC"`, `"Microsoft YaHei"`，其后是 `"Inter"` 与系统无衬线回退（`ui-sans-serif`, `system-ui`, `-apple-system`, `"Segoe UI"`, `Roboto`, …）。等宽：`--font-mono`。

字号阶梯：`--text-xs` 0.75rem · `--text-sm` 0.875rem · `--text-base` 1rem · `--text-lg` 1.125rem · `--text-xl` 1.25rem · `--text-2xl` 1.5rem · `--text-3xl` 1.875rem · `--text-4xl` 2.25rem · `--text-5xl` 3rem · `--text-6xl` 3.75rem。

| 角色 | 尺寸 | 字重 |
|------|------|------|
| 页面大标题 | `--text-3xl`–`--text-5xl` | 700（`--font-weight-bold`） |
| 区块标题 | `--text-2xl`–`--text-3xl` | 700 |
| 卡片标题 | `--text-xl` | 600（`--font-weight-semibold`） |
| 正文 | `--text-base`，行高 `--leading-relaxed` | 400 |
| 说明 | `--text-sm` | 500–600 |

---

## 圆角 / 间距 / 阴影 / 布局

- 圆角：`--radius-sm` 0.375rem · `--radius-md` 0.5rem · `--radius-lg` 0.75rem · `--radius-xl` 1rem · `--radius-2xl` 1.5rem · `--radius-full`。**卡片默认 `--radius-xl`**，按钮 `--btn-radius`（= `--radius-lg`）。
- 间距：4px 基准，`--space-1`（0.25rem）… `--space-24`（6rem）；区块纵向 `--section-py`（= `--space-20`）。
- 阴影：`--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl`，偏淡，按层级递增。
- 布局：内容最大宽 `--container-max`（80rem），左右留白 `--container-pad-inline`。

---

## 按钮 / 卡片 / 表单

可直接用的类在同目录 [`components.css`](./components.css)（类名以 `sugon-` 开头，只引用本规范的变量）。引入顺序：先 `tokens.css`，再 `components.css`。不要另写一套按钮或输入框。

| 类 | 用途 |
|----|------|
| `sugon-btn` `sugon-btn-primary` | 主按钮。底 `--color-primary`，hover `--color-primary-hover`，active `--color-primary-active`，focus `--focus-ring-strong`，disabled 透明度 0.55 |
| `sugon-btn` `sugon-btn-secondary` | 次按钮。底 `--color-surface`，描边 `--color-border-strong`，hover `--color-bg-muted`，active `--color-bg-subtle`，focus `--focus-ring` |
| `sugon-btn` `sugon-btn-ghost` | 幽灵按钮（补充，不改变上面两种的状态）。透明底、无描边，hover / active 同次按钮的底色 |
| `sugon-card` `sugon-card-title` `sugon-card-body` | 卡片：`--radius-xl`、`--color-surface`、`--color-border`、`--shadow-sm` |
| `sugon-field` `sugon-label` | 字段间距：字段之间 `--space-4`，标签与控件 `--space-2` |
| `sugon-input` `sugon-select` | 文本框与下拉。focus 描边 `--color-primary`；`aria-invalid="true"` 时用 `--color-danger-border` / `--color-danger-muted` |
| `sugon-check` | 复选框行，选中色 `accent-color: var(--color-primary)` |
| `sugon-help` `sugon-error` | 说明（`--color-text-muted`）与错误（`--color-danger-foreground`） |

按钮必须具备 **default / hover / active**，并提供 `focus-visible` 与 `disabled`。尺寸仍用 `--btn-height`、`--btn-px`、`--btn-radius`、`--btn-font-size`、`--btn-font-weight`、`--btn-transition`。primary / secondary 的颜色与上一版配方相同，只是类名改为 `sugon-btn-*`，避免和项目里已有的 `.btn-primary` 撞名。

---

## 做 / 不做

**做**

- 一律使用令牌（`var(--color-*)`、`var(--text-*)`、`var(--radius-*)`、`var(--space-*)`）
- 保持对比度：深灰字配白底，白字配 `--color-primary`
- 靠字阶、留白和对比建立层级
- UI 文案中文（除非另有要求）

**不做**

- 在有令牌时硬编码色值（包括 `#C8161D`）
- 发明第二套主色板或改写品牌主色
- 省略按钮 hover / active
- 引入质量层依赖
