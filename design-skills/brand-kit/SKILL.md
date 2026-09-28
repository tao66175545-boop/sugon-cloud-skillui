# 曙光云 SkillUI 库 — 品牌工具包（风格供给层）

> **角色：** 风格供给层入口。AI 代理在生成 UI **之前 / 之中** 读取本技能包。
> 产品：**曙光云 SkillUI 库**（主色 `#C8161D` + 灰白）。本包不是质量层 / 打磨包。

## 这是什么

可复用的**风格供给**品牌包：颜色、字体、圆角、间距与按钮三态，供代理从一开始就按品牌生成 UI。

## 何时使用

- 在本仓库或引用本路径的项目中构建 / 重绘 React + Vite UI
- 需要与曙光云品牌一致的区块与组件
- 代理启动时需要单一事实来源

## 何时不要使用

- **生成后的品味审计 / 打磨** — 交给外部质量层（Impeccable / Taste / Hallmark）；**不要**装进本仓库
- 需要第二个竞争风格包 — 本仓库只保留一个供给包
- 期望云端 MCP、Figma 导入或远程市场 — 非目标

## AI 应如何使用

1. 先读 `DESIGN.md`
2. 优先用 `tokens.css` 的 CSS 变量，组件内勿硬编码色值
3. 与 Tailwind 组合时对齐品牌方向（主色红 `#C8161D`、灰白中性、`rounded-xl` 卡片）
4. 按钮必须具备默认 / hover / active
5. 层级优先于装饰
6. 不要发明第二套主色板；扩展请改 `tokens.css`
7. 需要打磨时指向外部质量层，勿把本包扩成质量层

## 文件地图

| 文件 | 角色 |
|------|------|
| `SKILL.md` | 本入口 |
| `DESIGN.md` | 规范 |
| `tokens.css` | CSS 自定义属性 |

## 应用接线

```css
/* src/index.css */
@import "../design-skills/brand-kit/tokens.css";
@import "tailwindcss";
```

其他项目：按相对路径 `@import` 同一 `tokens.css`，参见 `examples/minimal-reference/`。

## 明确非目标

- 不在本仓库堆叠多个风格包
- 不引入 Impeccable / Hallmark / Taste / UI UX Pro Max
- 不是托管 MCP / Figma 流水线 / 商业站点克隆
