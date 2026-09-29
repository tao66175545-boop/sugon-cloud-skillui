# 最小参考示例 — 曙光云 SkillUI 库

本目录演示**其他项目如何消费**本仓库的风格供给层出口（**不是 npm 发布**、**不是 CDN**）。

出口路径与机器清单见 [`export/CONSUME.md`](../../export/CONSUME.md)、[`export/README.md`](../../export/README.md)、[`export/manifest.json`](../../export/manifest.json)。

## 文件

| 资源 | 相对本仓库目录 | 必选 |
|------|----------------|------|
| 统一出口说明 | `export/README.md` / `export/CONSUME.md` | ✅ |
| 机器清单 | `export/manifest.json` | ✅ |
| CSS 再导出 | `export/sugon-skillui.css` | ✅ |
| Skill 入口 | `design-skills/brand-kit/SKILL.md` | ✅ |
| 设计规范 | `design-skills/brand-kit/DESIGN.md` | ✅ |
| CSS 令牌 | `design-skills/brand-kit/tokens.css` | ✅ |
| **静态可打开页** | `examples/minimal-reference/index.html` + `demo.css` | ✅ 照抄 |
| 组件对照 | `examples/minimal-reference/TokenUsageExample.tsx` | 可选 |

## 怎么跑通（照抄）

### 1) 静态打开（推荐验收）

在**仓库根**起一个静态服务（`file://` 下部分浏览器会拦 CSS `@import`）：

```bash
npx --yes serve .
# 浏览器打开 /examples/minimal-reference/
```

应看到主色按钮（`#C8161D`）与次按钮卡片。

### 2) 引入方式（消费方入口）

二选一：

```css
/* A. 走统一出口 re-export */
@import "../../export/sugon-skillui.css";

/* B. 直接 tokens（与本仓 src/index.css 一致） */
@import "../../design-skills/brand-kit/tokens.css";
```

本仓库库壳自身（`src/index.css`）用：

```css
@import "../design-skills/brand-kit/tokens.css";
@import "tailwindcss";
```

也可**复制** `design-skills/brand-kit/` 到目标项目后按本地路径 `@import`。

### 3) package exports 风格

若用 `file:` / 本地 path 安装，见 [`examples/import-from-export/`](../import-from-export/)。

## 组件对照

`TokenUsageExample.tsx` 只使用 CSS 变量（如 `var(--color-primary)`），无硬编码色值。  
复制到应用前请先 `@import` 令牌。库壳预览时令牌已由 `src/index.css` 引入。

## 边界

- 只消费供给层（`design-skills/...` / `export/...`）
- **不要**引入质量层（Taste / Impeccable / Hallmark）
- Agent / 对话 **不是**对外出口
- 本样例无需单独 `npm install`；库壳开发仍用根目录 `npm run dev`
