# 曙光云 SkillUI 库 — 设计规范

本规范为风格供给层的视觉语言；令牌见 `tokens.css`，请与本文保持同步。

> **层级：** 风格供给层。代理在生成 UI 之前/之中消费本规范。生成后打磨（Impeccable / Hallmark / Taste）为外部质量层，勿把本文扩成质量包。

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
| `--color-primary-muted` | `#FCE8E9` | 浅主色底 |
| `--color-accent` | `#C8161D` | 次要强调（与主色一致） |
| `--color-bg` | `#ffffff` | 页面背景 |
| `--color-bg-subtle` | `#f5f5f5` | 交替区块底 |
| `--color-bg-muted` | `#eeeeee` | 弱化面板 |
| `--color-surface` | `#ffffff` | 卡片 |
| `--color-border` | `#e5e5e5` | 默认边框 |
| `--color-border-strong` | `#d4d4d4` | 强调边框 |
| `--color-text` | `#171717` | 主文字 |
| `--color-text-secondary` | `#525252` | 次要正文 |
| `--color-text-muted` | `#a3a3a3` | 说明 / 占位 |

---

## 字体

**家族：** Inter + 中文系统字体（`--font-sans`）。

| 角色 | 尺寸 | 字重 |
|------|------|------|
| 页面大标题 | `--text-3xl`–`--text-5xl` | 700 |
| 区块标题 | `--text-2xl`–`--text-3xl` | 700 |
| 卡片标题 | `--text-xl` | 600 |
| 正文 | `--text-base` | 400 |
| 说明 | `--text-sm` | 500–600 |

---

## 圆角 / 间距 / 按钮

- 卡片默认：`--radius-xl`
- 间距基准 4px；区块纵向 `--section-py`
- 按钮必须具备 **default / hover / active** 三态（见 `tokens.css` 与 `src/index.css` 的 `.btn-primary` / `.btn-secondary`）

---

## 做 / 不做

**做**

- 使用令牌与对齐本规范的工具类
- 保持对比度（深灰字配白底，白字配 `#C8161D`）
- UI 文案中文

**不做**

- 引入质量层依赖
- 在有令牌时硬编码色值
- 省略按钮 hover/active
