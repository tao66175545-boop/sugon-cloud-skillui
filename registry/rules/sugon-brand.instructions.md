---
applyTo: "**/*.tsx,**/*.jsx,**/*.vue,**/*.svelte,**/*.astro,**/*.html,**/*.css,**/*.scss"
description: 曙光云 (Sugon Cloud) brand rules for UI code
---

# 曙光云品牌（sugon-brand-kit）

生成或修改 UI 时：

1. 先读 `.agents/skills/sugon-brand-kit/DESIGN.md`（没有就读 `.claude/skills/sugon-brand-kit/DESIGN.md`），令牌以同目录 `tokens.css` 为准。
2. 确认入口 CSS 已 `@import` 品牌令牌（默认 `src/styles/sugon-tokens.css`）；没有就先引入。
3. 颜色、字号、圆角、间距、阴影一律用 `var(--color-*)`、`var(--text-*)`、`var(--radius-*)`、`var(--space-*)`、`var(--shadow-*)`；不要硬编码 `#C8161D` 等色值。
4. 按钮必须有 default / hover / active（含 focus-visible、disabled）。

技能未安装时：`npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit`
