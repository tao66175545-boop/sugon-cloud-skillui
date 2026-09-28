# 最小参考示例 — 曙光云 SkillUI 库

本目录演示**其他项目如何消费**本仓库的风格供给层出口，**无需 npm 发布**、**非云 CDN**。

仓内路径均真实存在；统一说明见 [`export/README.md`](../../export/README.md) 与 [`export/manifest.json`](../../export/manifest.json)。

## 路径

| 资源 | 相对本仓库根目录 | 存在 |
|------|------------------|------|
| 统一出口说明 | `export/README.md` | ✅ |
| 机器清单 | `export/manifest.json` | ✅ |
| CSS 再导出 | `export/sugon-skillui.css` | ✅ |
| Skill 入口 | `design-skills/brand-kit/SKILL.md` | ✅ |
| 设计规范 | `design-skills/brand-kit/DESIGN.md` | ✅ |
| CSS 令牌 | `design-skills/brand-kit/tokens.css` | ✅ |
| 本示例组件 | `examples/minimal-reference/TokenUsageExample.tsx` | ✅ |

## 导入方式（消费出口）

等价二选一：

```css
/* A. 经统一出口 re-export */
@import "../../export/sugon-skillui.css";

/* B. 直接 tokens（与本仓 src/index.css 一致） */
@import "../../design-skills/brand-kit/tokens.css";
```

本仓库自身接线（`src/index.css`）：

```css
@import "../design-skills/brand-kit/tokens.css";
@import "tailwindcss";
```

也可**复制** `design-skills/brand-kit/` 到目标项目后按本地路径 `@import`。

## 本示例如何消费

`TokenUsageExample.tsx` 只使用 CSS 变量（如 `var(--color-primary)`），不硬编码色值；  
变量由应用入口 `@import` 上述出口注入。本仓预览时令牌已由 `src/index.css` 引入。

## 边界

- 仅复用供给层（`design-skills/...` / `export/...`）
- **不要**引入质量层（Taste / Impeccable / Hallmark）
- Agent / 对话 **不是**导出面
- 本地运行：`npm install` → `npm run dev`
