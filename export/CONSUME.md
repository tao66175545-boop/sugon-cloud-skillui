# 第三方消费：3 步接入

本库是 **风格供给层（style-supply）**，不是 CDN，也不是 Agent UI。  
机器可读清单见 [`manifest.json`](./manifest.json)；`package.json` `exports` 已指向真实文件。

> **公开仓说明**：本仓已公开（<https://github.com/tao66175545-boop/sugon-cloud-skillui>），GitHub raw **无需登录 / token**。生产环境建议 **本地 clone / 复制 + 相对路径**（或固定到某个 commit 的 raw URL）；GitHub Pages 上的文件适合演示与快速试用，不是带版本的 CDN。

---

## 步骤 1 — 拿到文件

任选其一：

| 方式 | 命令 / 操作 |
|------|-------------|
| 本地 clone | `git clone https://github.com/tao66175545-boop/sugon-cloud-skillui.git` 后按相对路径引用 |
| 复制品牌包 | `cp -r design-skills/brand-kit <your-app>/vendor/brand-kit` |
| 公开 raw 下载 | `curl -L "https://raw.githubusercontent.com/tao66175545-boop/sugon-cloud-skillui/main/design-skills/brand-kit/tokens.css" -o tokens.css` |
| 浏览器快速试用 | `<link rel="stylesheet" href="https://tao66175545-boop.github.io/sugon-cloud-skillui/export/sugon-skillui.css">`（Pages 以 text/css 提供；raw 是 text/plain，不能直接当样式表引用） |

---

## 步骤 2 — `@import` CSS

任选其一（路径按你的目录调整）：

```css
/* A. 统一出口 re-export（推荐） */
@import "../path-to/sugon-skillui/export/sugon-skillui.css";

/* B. 直接 tokens（与本仓 src/index.css 一致） */
@import "../path-to/sugon-skillui/design-skills/brand-kit/tokens.css";

/* C. 若用 file: / 本地 path 安装且解析 package exports */
@import "sugon-skillui/css";
@import "sugon-skillui/tokens";
```

`package.json` exports 摘要：

| 子路径 | 指向 |
|--------|------|
| `.` / `./css` | `export/sugon-skillui.css` |
| `./tokens` | `design-skills/brand-kit/tokens.css` |
| `./manifest` | `export/manifest.json` |

---

## 步骤 3 — 选 skill path / 用变量

- 技能说明：`design-skills/brand-kit/SKILL.md`
- 设计规范：`design-skills/brand-kit/DESIGN.md`
- 在组件里用 `var(--color-primary)` 等，**不要硬编码** `#C8161D`（除非做对照文档）

对照样例：

- [`examples/minimal-reference/`](../examples/minimal-reference/) — 静态 HTML 可打开 + TSX
- [`examples/import-from-export/`](../examples/import-from-export/) — package exports 风格注释

---

## 边界

| 要做 | 不要做 |
|------|--------|
| 引用 / 复制 `design-skills/` 与 `export/` | 把 Agent 对话当对外出口 |
| 用 CSS 变量 | 引入 Taste / Impeccable / Hallmark |
| 本地 path 或自建镜像 | 假装本仓提供公开 CDN |
