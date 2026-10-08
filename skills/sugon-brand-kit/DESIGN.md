# 曙光云 SkillUI 库 — 设计规范（sugon-brand-kit）

本规范是风格供给层的视觉语言。**令牌的唯一事实来源是同目录的 `tokens.css`**：本文所有色值、字体、尺寸都抄自它；两者不一致时以 `tokens.css` 为准（源仓库 `npm run check:tokens` 会校验本文颜色表与 `tokens.css` 一致）。

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

## 按钮

按钮必须具备 **default / hover / active**，并提供 `focus-visible` 与 `disabled`。尺寸令牌：`--btn-height` 2.75rem、`--btn-px` 1.25rem、`--btn-font-size`、`--btn-font-weight`、`--btn-transition`。可直接使用以下配方：

```css
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  height: var(--btn-height); padding-inline: var(--btn-px);
  border-radius: var(--btn-radius); border: none; cursor: pointer;
  font-size: var(--btn-font-size); font-weight: var(--btn-font-weight); line-height: 1;
  color: var(--color-primary-foreground); background-color: var(--color-primary);
  box-shadow: var(--shadow-sm); transition: var(--btn-transition);
}
.btn-primary:hover { background-color: var(--color-primary-hover); box-shadow: var(--shadow-md); }
.btn-primary:active { background-color: var(--color-primary-active); transform: scale(0.98); box-shadow: var(--shadow-sm); }
.btn-primary:focus-visible { outline: none; box-shadow: var(--shadow-sm), var(--focus-ring-strong); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-secondary {
  /* 尺寸同 .btn-primary */
  color: var(--color-text); background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
}
.btn-secondary:hover { background-color: var(--color-bg-muted); }
.btn-secondary:active { background-color: var(--color-bg-subtle); transform: scale(0.98); }
.btn-secondary:focus-visible { outline: none; border-color: var(--color-primary); box-shadow: var(--focus-ring); }
```

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
