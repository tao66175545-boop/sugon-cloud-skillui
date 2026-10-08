<!--
  可选：让 Codex / Claude Code / Gemini CLI 等「常驻」遵守曙光云品牌。
  请把下面「## 曙光云品牌」这一节手动追加到你项目的 AGENTS.md（Claude Code 用 CLAUDE.md）。
  本仓库的 registry 不会自动写入或覆盖你的 AGENTS.md / CLAUDE.md。
-->

## 曙光云品牌（sugon-brand-kit）

- 生成或修改 UI 前先读 `.agents/skills/sugon-brand-kit/DESIGN.md`（Claude Code：`.claude/skills/sugon-brand-kit/DESIGN.md`），令牌以同目录 `tokens.css` 为准。
- 入口 CSS 需 `@import` 品牌令牌（默认 `src/styles/sugon-tokens.css`）。
- 颜色 / 字号 / 圆角 / 间距 / 阴影一律用 `var(--color-*)` 等 CSS 变量，不要硬编码 `#C8161D` 等色值；按钮必须有 default / hover / active。
