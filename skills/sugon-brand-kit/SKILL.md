---
name: sugon-brand-kit
description: >-
  曙光云 (Sugon Cloud) brand design system for generating UI: brand red #C8161D with gray/white
  neutrals, typography scale, radius, spacing, shadows and button default/hover/active states,
  shipped as ready-to-import CSS variables (tokens.css) plus a written spec (DESIGN.md).
  Use when building, restyling or reviewing any page, component, layout or CSS that should look
  like 曙光云 / Sugon products, or when the user asks for 曙光 / 曙光云 品牌风格, brand colors or
  design tokens. Read it before writing UI code, not after. Not a post-generation polish or
  audit tool.
license: MIT
metadata:
  author: 涛 李
  version: "0.4.0"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
---

# 曙光云品牌工具包 sugon-brand-kit（风格供给层）

> **角色**：风格供给层。AI 代理在生成 UI **之前 / 之中** 读取本技能。
> 主色曙光红 `#C8161D` + 灰白中性色。本技能不是质量层 / 打磨包。

本技能目录自带三份文件，下面提到的路径都**相对于本技能目录**：

| 文件 | 角色 |
|------|------|
| `SKILL.md` | 本入口（何时用、怎么用） |
| `DESIGN.md` | 设计规范：颜色、字体、圆角、间距、按钮三态、做 / 不做 |
| `tokens.css` | CSS 自定义属性（`:root` 变量），由仓库 `tokens/sugon.tokens.json` 经 `npm run build:kit` 生成 |
| `components.css` | 纯 CSS 片段：按钮、卡片、表单。类名一律 `sugon-` 开头。不是组件库 |

## 何时使用

- 新建或重绘页面、组件、布局、样式，要求符合曙光云 / Sugon 品牌
- 用户提到「曙光」「曙光云」「品牌风格」「品牌色」「设计令牌」
- 需要一套现成的颜色 / 字阶 / 圆角 / 间距 / 按钮状态，而不是临时编色值

## 品牌识别（logo / 印刷 / PPT）

涉及 logo、VI、PPT、印刷、新媒体时，请改用或一并安装 **`sugon-brand-core`** 与 **`sugon-logo-usage`**。识别红是 `#AF1F24`，与本技能的 UI 红 `#C8161D` 不同，不要混用。

## 何时不要使用

- 生成后的品味审计 / 打磨：交给外部质量层工具，不要把本技能扩成质量层
- 用户明确要求其他品牌或另一套主色板
- 需要托管 MCP、Figma 导入或远程市场：不在本技能范围

## 工作步骤

1. **先读 `DESIGN.md`**，确认颜色角色、字阶和按钮规则。
2. **确保项目已引入令牌**。在项目里找有没有已经包含 `--color-primary: #C8161D` 的 CSS（常见位置 `src/styles/sugon-tokens.css`）。用 shadcn 安装且已有 `components.json` 时，入口 CSS 顶部的 `@import` 会自动写上，不要再加一遍。没有的话，把本目录的 `tokens.css` 复制到项目里（建议 `src/styles/sugon-tokens.css`），并在入口 CSS **最顶部**引入：

   ```css
   /* src/index.css；若入口是 app/globals.css，改成相对它的路径 */
   @import "./styles/sugon-tokens.css";
   @import "tailwindcss"; /* 若使用 Tailwind v4，放在令牌之后 */
   ```

   只想快速试用、不落文件时，可用 CDN：
   `https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.4.0/skills/sugon-brand-kit/tokens.css`
3. **写样式时只用变量**：颜色用 `var(--color-*)`，字号 `var(--text-*)`，圆角 `var(--radius-*)`，间距 `var(--space-*)`，阴影 `var(--shadow-*)`。**不要硬编码 `#C8161D` 等色值**；Tailwind 中用任意值写法，例如 `bg-[var(--color-primary)]`、`rounded-[var(--radius-xl)]`。
4. **按钮、卡片、表单优先用 `components.css` 里的类，不要另写一套。** 先在令牌之后引入它（shadcn 安装时会写到 `src/styles/sugon-components.css`；已有 `components.json` 时这两行会自动出现在入口 CSS，不要重复添加）：

   ```css
   @import "./styles/sugon-tokens.css";
   @import "./styles/sugon-components.css";
   ```

   类名：`sugon-btn` + `sugon-btn-primary` / `sugon-btn-secondary` / `sugon-btn-ghost`（含 hover、active、focus-visible、disabled），`sugon-card` / `sugon-card-title` / `sugon-card-body`，`sugon-field` / `sugon-label` / `sugon-input` / `sugon-select` / `sugon-check` / `sugon-help` / `sugon-error`。输入错误态用 `aria-invalid="true"`。这些类只组合已有变量，不引入新颜色。
5. 卡片默认 `var(--radius-xl)` + `var(--color-surface)` + `1px solid var(--color-border)`（`sugon-card` 已按此实现）；区块交替底色用 `var(--color-bg-subtle)`。
6. **层级优先于装饰**：靠字阶、留白和对比建立层级，少用渐变和花哨阴影。
7. 不要发明第二套主色板。确实缺变量时，在项目自己的 CSS 里基于现有变量派生（如 `color-mix()`），不要改写品牌主色。
8. 界面文案默认中文（除非用户另有要求）。

## 自检清单（交付前）

- [ ] 组件里没有硬编码品牌色 / 灰阶色值
- [ ] 按钮 / 卡片 / 输入框用了 `sugon-*` 类（或与之等价的变量），主按钮 `--color-primary`，hover `--color-primary-hover`，active `--color-primary-active`
- [ ] 正文 `--color-text`，次要 `--color-text-secondary`，说明 / 占位 `--color-text-muted`
- [ ] 字体族用 `var(--font-sans)`
- [ ] 白字只出现在主色底上；深灰字配白底

## 来源与更新

- 源仓库：<https://github.com/tao66175545-boop/sugon-cloud-skillui>（`skills/sugon-brand-kit/`）
- 重新安装 / 更新：`npx skills add tao66175545-boop/sugon-cloud-skillui` 或 `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit`
- 代码与文档 MIT；“曙光 / 曙光云 / Sugon” 名称与标识不在 MIT 授权范围内（见源仓库 `TRADEMARKS.md`）。
