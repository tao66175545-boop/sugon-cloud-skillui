# 第三方消费：3 步接入

本库是 **风格供给层（style-supply）**，不是 Agent UI。
机器可读清单见 [`manifest.json`](./manifest.json)（`install` 段给出全部安装命令）；`package.json` `exports` 已指向真实文件。

> **版本**：下面命令里的 `v0.2.0` 是固定版本（git tag），生产环境请锁版本；换成 `main` 即为尝鲜版。本仓公开，所有方式都**无需登录 / token**。

---

## 步骤 1 — 装 / 拿到文件

任选其一：

| 方式 | 命令 / 操作 | 得到什么 |
|------|-------------|----------|
| **AI 编程工具技能**（推荐） | `npx skills add tao66175545-boop/sugon-cloud-skillui` | `.agents/skills/sugon-brand-kit/`（+ `.claude/skills/` 等，按所选工具） |
| **技能 + 令牌进项目**（推荐） | `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit#v0.2.0` | 技能写入 `.agents/skills/` 与 `.claude/skills/`，令牌写入 `src/styles/sugon-tokens.css` |
| 只要令牌 | `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-tokens#v0.2.0` | `src/styles/sugon-tokens.css` |
| 可选常驻规则 | `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-rules#v0.2.0` | `.cursor/rules/sugon-brand.mdc`、`.github/instructions/sugon-brand.instructions.md`（不会改 `AGENTS.md` / `CLAUDE.md`；需要时手动追加 [`registry/rules/AGENTS.snippet.md`](../registry/rules/AGENTS.snippet.md)） |
| CDN（浏览器快速试用 / 生产 `<link>`） | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.2.0/skills/sugon-brand-kit/tokens.css">` | jsDelivr 按 tag 版本化，`text/css` |
| 本地 clone | `git clone https://github.com/tao66175545-boop/sugon-cloud-skillui.git` 后按相对路径引用 | 整个仓库 |
| 复制技能目录 | `cp -r skills/sugon-brand-kit <your-app>/.agents/skills/` | 技能三件套 |
| 公开 raw 下载 | `curl -L "https://raw.githubusercontent.com/tao66175545-boop/sugon-cloud-skillui/v0.2.0/skills/sugon-brand-kit/tokens.css" -o tokens.css` | 单个文件（raw 是 text/plain，不能直接当样式表 `<link>`） |

---

## 步骤 2 — `@import` CSS

任选其一（路径按你的目录调整）：

```css
/* A. shadcn 安装后的默认位置（入口 CSS 最顶部；Tailwind v4 时放在 @import "tailwindcss" 之前） */
@import "./styles/sugon-tokens.css";

/* B. CDN */
@import url("https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.2.0/skills/sugon-brand-kit/tokens.css");

/* C. clone / 复制后的相对路径 */
@import "../path-to/sugon-skillui/skills/sugon-brand-kit/tokens.css";
/*    或统一出口 re-export */
@import "../path-to/sugon-skillui/export/sugon-skillui.css";

/* D. 若用 file: / 本地 path 安装且解析 package exports（npm 包尚未发布） */
@import "sugon-skillui/css";
@import "sugon-skillui/tokens";
```

`package.json` exports 摘要：

| 子路径 | 指向 |
|--------|------|
| `.` / `./css` | `export/sugon-skillui.css` |
| `./tokens` / `./tokens.css` | `skills/sugon-brand-kit/tokens.css` |
| `./manifest` | `export/manifest.json` |
| `./design-skills/brand-kit/*` | 0.1.x 旧路径（转发 stub，0.3.0 删除） |

---

## 步骤 3 — 用变量

- 技能说明：`skills/sugon-brand-kit/SKILL.md`
- 设计规范：`skills/sugon-brand-kit/DESIGN.md`（数值以 `tokens.css` 为准）
- 在组件里用 `var(--color-primary)` 等，**不要硬编码** `#C8161D`（除非做对照文档）

对照样例：

- [`examples/minimal-reference/`](../examples/minimal-reference/) — 静态 HTML 可打开 + TSX
- [`examples/import-from-export/`](../examples/import-from-export/) — package exports 风格注释

---

## 边界

| 要做 | 不要做 |
|------|--------|
| 安装 / 引用 / 复制 `skills/sugon-brand-kit/` 与 `export/` | 把 Agent 对话当对外出口 |
| 用 CSS 变量 | 引入 Taste / Impeccable / Hallmark |
| 锁版本（`#v0.2.0` / `@v0.2.0`） | 生产环境直接用 `@main` / GitHub Pages 文件 |

“曙光 / 曙光云 / Sugon” 名称、logo 与品牌标识不在 MIT 授权范围内，见 [`TRADEMARKS.md`](../TRADEMARKS.md)。
