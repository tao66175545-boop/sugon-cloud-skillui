# 对外统一出口 — 曙光云 SkillUI 库（风格供给层）

本目录是**其他项目消费本库风格供给层**的统一入口。  
机器可读清单见 [`manifest.json`](./manifest.json)。

> **不是**云 CDN，也**不是** Agent / 对话 UI。  
> 对话（`#agent`）仅为本仓库前端的管理入口；对外只导出 `design-skills/`（令牌 + Skill 文档）与本目录的 CSS 再导出。

---

## 快速接入（二选一）

### 方式 A：`@import` 令牌（推荐）

在目标项目 CSS 入口中按**本地相对路径**引入：

```css
/* 直接引用 tokens（与本仓 src/index.css 一致） */
@import "../path-to/sugon-skillui/design-skills/brand-kit/tokens.css";

/* 或经统一出口 re-export */
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
```

然后在组件中使用 CSS 变量，例如 `var(--color-primary)`（`#C8161D`）。

### 方式 B：复制 `design-skills/`

将本仓库的 `design-skills/brand-kit/` 整包复制到目标项目，再本地 `@import` 复制后的 `tokens.css`。  
适合不便共享 git 子目录、或需离线固定版本的场景。

---

## 必读文档

| 文件 | 用途 |
|------|------|
| [`design-skills/brand-kit/SKILL.md`](../design-skills/brand-kit/SKILL.md) | AI / 代理：何时用、如何用供给层 |
| [`design-skills/brand-kit/DESIGN.md`](../design-skills/brand-kit/DESIGN.md) | 设计规范（色、字、圆角、间距、按钮三态） |
| [`design-skills/brand-kit/tokens.css`](../design-skills/brand-kit/tokens.css) | CSS 变量事实来源 |
| [`examples/minimal-reference/`](../examples/minimal-reference/) | 最小参考样例 |

---

## URL 说明（非 CDN）

本库**不提供**托管 CDN。可用：

1. **本地相对路径**（克隆 / 子模块 / 复制后）— 推荐  
2. **GitHub raw**（`raw.githubusercontent.com/...`）— 私有仓需带 token  
3. **GitHub blob**（`github.com/.../blob/...`）— 给人看的页面链接  

`manifest.json` 中每个 `entries[]` 均给出 `relative` / `raw` / `blob` 三套地址。

私有仓拉取 raw 示例：

```bash
curl -H "Authorization: Bearer <GITHUB_TOKEN>" \
  -L "https://raw.githubusercontent.com/tao66175545-boop/sugon-skillui/main/design-skills/brand-kit/tokens.css" \
  -o tokens.css
```

勿把 token 写入仓库或提交到 git。

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

对照仓内真实样例：[`examples/minimal-reference/TokenUsageExample.tsx`](../examples/minimal-reference/TokenUsageExample.tsx)。

---

## 边界（请勿越界）

| 做 | 不做 |
|----|------|
| 引用 / 复制 `design-skills/brand-kit/*` | 把 Agent / 对话当导出面 |
| `@import` tokens 或 `export/sugon-skillui.css` | 引入质量层（Taste / Impeccable / Hallmark） |
| 读 `SKILL.md` / `DESIGN.md` | 期望云端市场 / Figma / npm 强制发布 |

版本与品牌主色以根目录 `package.json` 与 `manifest.json` 为准（当前主色 `#C8161D`）。
