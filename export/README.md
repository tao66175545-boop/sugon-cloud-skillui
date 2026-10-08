# 对外统一出口 — 曙光云 SkillUI 库（风格供给层）

本目录是**其他项目消费本库风格供给层**的统一入口。
机器可读清单：[`manifest.json`](./manifest.json)。
**3 步接入**：[`CONSUME.md`](./CONSUME.md)。

> 对话（`#agent`）仅为库壳前端的管理入口，**不是**对外出口；对外只分发 `skills/sugon-brand-kit/`（令牌 + Skill 文档）、`registry.json` 条目与本目录的 CSS 再导出。

---

## 三种一键方式（推荐）

| 渠道 | 命令 | 适合 |
|------|------|------|
| Agent Skills（[`skills` CLI](https://github.com/vercel-labs/skills)） | `npx skills add tao66175545-boop/sugon-cloud-skillui` | 让 Claude Code / Codex / Cursor / Copilot / Gemini CLI 等在写 UI 时按品牌生成 |
| shadcn GitHub registry（根目录 [`registry.json`](../registry.json)） | `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit#v0.2.0` | 一次把技能 + 令牌写进项目；`sugon-tokens` 只要令牌；`sugon-brand-rules` 可选常驻规则 |
| jsDelivr CDN | `https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.2.0/skills/sugon-brand-kit/tokens.css` | 浏览器 `<link>` / `@import url()`，按 tag 版本化 |

锁定版本：shadcn 用 `#v0.2.0`（或完整 commit SHA），jsDelivr 用 `@v0.2.0`，skills 用
`npx skills add https://github.com/tao66175545-boop/sugon-cloud-skillui/tree/v0.2.0/skills/sugon-brand-kit`。
装之前可用 `npx shadcn@latest view tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit` 或 `add … --dry-run` 预览要写入的文件。

---

## 路径方式

### 方式 A：`@import` 令牌

在目标项目 CSS 入口中按**本地相对路径**引入：

```css
/* 直接引入 tokens（与本仓 src/index.css 一致） */
@import "../path-to/sugon-skillui/skills/sugon-brand-kit/tokens.css";

/* 或统一出口 re-export */
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
```

若通过 `file:` / 本地 path 安装并能解析 `package.json` `exports`：

```css
@import "sugon-skillui/css";
/* 或 */
@import "sugon-skillui/tokens";
```

然后在组件中使用 CSS 变量，例如 `var(--color-primary)`（`#C8161D`）。

### 方式 B：复制技能目录

把本仓库的 `skills/sugon-brand-kit/` 整夹复制到目标项目（AI 工具读取位置为 `.agents/skills/` 或 `.claude/skills/`），再按本地 `@import` 引入其 `tokens.css`。

---

## package.json exports

`package.json` 目前 `private: true`（npm 包 `sugon-skillui` 在计划中、尚未发布；GitHub 仓库本身公开），仍提供稳定 `exports` 便于 path / `file:` 引用：

| 子路径 | 真实文件 |
|--------|----------|
| `.` / `./css` | `export/sugon-skillui.css` |
| `./tokens` / `./tokens.css` | `skills/sugon-brand-kit/tokens.css` |
| `./skills/sugon-brand-kit/*` | 技能三件套 |
| `./manifest` | `export/manifest.json` |
| `./design-skills/brand-kit/*` | 0.1.x 旧路径（转发 stub，0.3.0 删除） |

`style` 字段同指向 `./export/sugon-skillui.css`。`files` 包含 `skills`、`export`、`design-skills`、`examples`、`public/logo.svg` 及 LICENSE / TRADEMARKS / CHANGELOG。

---

## 固定文档

| 文件 | 用途 |
|------|------|
| [`CONSUME.md`](./CONSUME.md) | 第三方 3 步接入 |
| [`skills/sugon-brand-kit/SKILL.md`](../skills/sugon-brand-kit/SKILL.md) | Agent Skill 入口（何时 / 如何用供给层） |
| [`skills/sugon-brand-kit/DESIGN.md`](../skills/sugon-brand-kit/DESIGN.md) | 设计规范（色、字、圆角、间距、按钮状态） |
| [`skills/sugon-brand-kit/tokens.css`](../skills/sugon-brand-kit/tokens.css) | CSS 变量唯一事实来源 |
| [`registry.json`](../registry.json) | shadcn registry 条目定义 |
| [`registry/rules/`](../registry/rules/) | 可选常驻规则与 AGENTS.md 片段 |
| [`examples/minimal-reference/`](../examples/minimal-reference/) | 最小参考（静态 HTML + TSX） |
| [`examples/import-from-export/`](../examples/import-from-export/) | package exports 引用注释样例 |

---

## URL 说明

本仓已公开，以下 URL 均**无需登录 / token**：

1. **jsDelivr**（`cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/<path>`）— 版本化 CDN，`text/css`，可直接 `<link>`；生产锁 tag
2. **GitHub raw**（`raw.githubusercontent.com/...`）— text/plain，适合 curl / 工具读取；可固定到 tag 或 commit
3. **GitHub Pages**（`https://tao66175545-boop.github.io/sugon-cloud-skillui/...`）— 演示站同站提供 `skills/`、`export/` 与 [`llms.txt`](https://tao66175545-boop.github.io/sugon-cloud-skillui/llms.txt)，始终是 `main` 最新内容，适合演示
4. **GitHub blob**（`github.com/.../blob/...`）— 给人看网页用

`manifest.json` 里 `install` 段列出三种安装命令；每条 `entries[]` 带 `relative` / `raw` / `blob`（Pages 上有的文件另带 `pages`，令牌另带 `jsdelivr`），以及 `importHint` / `copyHint` / `packageExport`。

下载 raw 示例：

```bash
curl -L "https://raw.githubusercontent.com/tao66175545-boop/sugon-cloud-skillui/v0.2.0/skills/sugon-brand-kit/tokens.css" \
  -o tokens.css
```

---

## 最小示例

```css
/* consumer.css */
@import "./styles/sugon-tokens.css";

.hero-cta {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-lg);
  height: var(--btn-height);
  padding-inline: var(--btn-px);
}
```

完整可打开样例见 [`examples/minimal-reference/index.html`](../examples/minimal-reference/index.html)；组件对照见 [`TokenUsageExample.tsx`](../examples/minimal-reference/TokenUsageExample.tsx)。

---

## 边界（请勿越界）

| 做 | 不做 |
|----|------|
| 安装 / 引用 / 复制 `skills/sugon-brand-kit/*` | 改 Agent / 对话管理壳当出口 |
| `@import` tokens 或 `export/sugon-skillui.css` | 引入质量层（Taste / Impeccable / Hallmark） |
| 读 `SKILL.md` / `DESIGN.md` | Figma / 托管服务 |

版本与品牌主色以根目录 `package.json` 与 `manifest.json` 为准（当前主色 `#C8161D`）。“曙光 / 曙光云 / Sugon” 名称与标识的使用见 [`TRADEMARKS.md`](../TRADEMARKS.md)。
