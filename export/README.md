# 对外统一出口 — 曙光云 SkillUI 库（风格供给层）

本目录是**其他项目消费本库风格供给层**的统一入口。  
机器可读清单：[`manifest.json`](./manifest.json)。  
**3 步接入**：[`CONSUME.md`](./CONSUME.md)。

> **不是** CDN；也**不是** Agent / 对话 UI。  
> 对话（`#agent`）仅为库壳前端的管理入口；对外只导出 `design-skills/`（令牌 + Skill 文档）与本目录的 CSS 再导出。

---

## 两种最快接入（任选其一）

### 方式 A：`@import` 令牌（推荐）

在目标项目 CSS 入口中按**本地相对路径**引入：

```css
/* 直接引入 tokens（与本仓 src/index.css 一致） */
@import "../path-to/sugon-skillui/design-skills/brand-kit/tokens.css";

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

### 方式 B：复制 `design-skills/`

把本仓库的 `design-skills/brand-kit/` 整夹复制到目标项目，再按本地 `@import` 引入其 `tokens.css`。  
适合不便共享 git 子目录、或需要锁定版本的场景。

---

## package.json exports

本仓虽以 Vite 应用 + `design-skills/` 为主（`package.json` `private: true` = 不发布到 npm；GitHub 仓库本身公开），仍提供稳定 `exports` 便于 path / `file:` 引用：

| 子路径 | 真实文件 |
|--------|----------|
| `.` / `./css` | `export/sugon-skillui.css` |
| `./tokens` | `design-skills/brand-kit/tokens.css` |
| `./manifest` | `export/manifest.json` |
| `./design-skills/brand-kit/*` | 对应文档 / tokens |

`style` 字段同指向 `./export/sugon-skillui.css`。`files` 包含 `export`、`design-skills`、`examples`、`public/logo.svg`。

---

## 固定文档

| 文件 | 用途 |
|------|------|
| [`CONSUME.md`](./CONSUME.md) | 第三方 3 步接入 |
| [`design-skills/brand-kit/SKILL.md`](../design-skills/brand-kit/SKILL.md) | AI / 工具提示时「如何用供给层」 |
| [`design-skills/brand-kit/DESIGN.md`](../design-skills/brand-kit/DESIGN.md) | 设计规范（色、字、圆角、间距、按钮状态） |
| [`design-skills/brand-kit/tokens.css`](../design-skills/brand-kit/tokens.css) | CSS 变量真实来源 |
| [`examples/minimal-reference/`](../examples/minimal-reference/) | 最小参考（静态 HTML + TSX） |
| [`examples/import-from-export/`](../examples/import-from-export/) | package exports 引用注释样例 |

---

## URL 说明（非 CDN）

本仓已公开，以下 URL 均**无需登录 / token**。本库不提供带版本的 CDN，消费方式：

1. **本地相对路径**（克隆 / 子模块 / 复制后）— 推荐  
2. **GitHub raw**（`raw.githubusercontent.com/...`）— 公开可下载（text/plain，适合 curl / 工具读取；生产可固定到 commit SHA）  
3. **GitHub Pages**（`https://tao66175545-boop.github.io/sugon-cloud-skillui/...`）— 在线演示同站提供 `design-skills/`、`export/`（text/css），适合浏览器快速试用  
4. **GitHub blob**（`github.com/.../blob/...`）— 给人看网页用  

`manifest.json` 里每条 `entries[]` 都带有 `relative` / `raw` / `blob`（Pages 上有的文件另带 `pages`），以及 `importHint` / `copyHint` / `packageExport`；`github.rawBase` / `github.pagesBase` 为前缀。

下载 raw 示例（无需 token）：

```bash
curl -L "https://raw.githubusercontent.com/tao66175545-boop/sugon-cloud-skillui/main/design-skills/brand-kit/tokens.css" \
  -o tokens.css
```

浏览器快速试用（Pages）：

```html
<link rel="stylesheet" href="https://tao66175545-boop.github.io/sugon-cloud-skillui/export/sugon-skillui.css" />
```

---

## 最小示例

```css
/* consumer.css */
@import "../vendor/sugon-skillui/export/sugon-skillui.css";

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
| 引用 / 复制 `design-skills/brand-kit/*` | 改 Agent / 对话管理壳当出口 |
| `@import` tokens 或 `export/sugon-skillui.css` | 引入质量层（Taste / Impeccable / Hallmark） |
| 读 `SKILL.md` / `DESIGN.md` | 要求移动端出厂 / Figma / npm 强制发布 |

版本与品牌主色以根目录 `package.json` 与 `manifest.json` 为准（当前主色 `#C8161D`）。
