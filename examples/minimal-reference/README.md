# 最小参考示例 — 曙光云 SkillUI 库

本目录演示**其他项目如何复用**本仓库的风格供给层，**无需 npm 发布**。

## 路径

| 资源 | 相对本仓库根目录 |
|------|------------------|
| Skill 入口 | `design-skills/brand-kit/SKILL.md` |
| 设计规范 | `design-skills/brand-kit/DESIGN.md` |
| CSS 令牌 | `design-skills/brand-kit/tokens.css` |
| 本示例组件 | `examples/minimal-reference/TokenUsageExample.tsx` |

## 导入方式

```css
@import "../../design-skills/brand-kit/tokens.css";
```

本仓库 `src/index.css`：

```css
@import "../design-skills/brand-kit/tokens.css";
@import "tailwindcss";
```

## 边界

- 仅复用供给层路径（`design-skills/...`）
- 不要引入质量层（Taste / Impeccable / Hallmark）
- 本地运行：`npm install` → `npm run dev`
