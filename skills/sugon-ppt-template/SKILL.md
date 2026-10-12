---
name: sugon-ppt-template
description: >-
  生成或改写曙光云 / Sugon 政企汇报风格 16:9 PPT（汇报材料、方案汇报、招投标讲标、
  产品介绍、做PPT、投标演示）。使用品牌识别红 #AF1F24 与官方横式 logo，默认不嵌入字体
  （WPS / 信创更稳），禁用 Wingdings。有官方母版时优先填母版；否则用本技能通用版式。
  网页 UI 请用 sugon-brand-kit；logo 细则见 sugon-logo-usage / sugon-brand-core。
license: MIT
metadata:
  author: 涛 李
  version: "0.4.5"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
---

# 曙光云政企 PPT 模板 sugon-ppt-template

> **通用 16:9 草稿母版**（无官方 `.potx` 时使用）。颜色与 logo 来自 `sugon-brand-core`。  
> 交付物为可在 PowerPoint / WPS 继续编辑的 `.pptx`。**本环境未做 UOS / 麒麟 WPS 实机验收。**  
> **v0.4.5**：P0 冻结 `theme.mjs` + 参数化 `layoutCards`（≤40 母版）；并入设计契约 `DESIGN.md` / `tokens.css` / `RULES.md`（视觉门禁、W42 规则 rule-011…017、Lucide+Material 图标默认、Family A/B 母题）。

## 本目录

| 路径 | 角色 |
|------|------|
| `SKILL.md` | 本入口（Agent Skills） |
| `DESIGN.md` | 品牌锁 + 版式契约 + 视觉门禁清单 |
| `tokens.css` | 设计 token（CSS 变量；与 `scripts/theme.mjs` 对齐） |
| `RULES.md` | 库规则摘要（rule-001…017 + 站立门禁） |
| `references/layouts.md` | 母版 id + 叙事用途 + 参数化变体 |
| `references/gov-report-style.md` | 政企文风与字体规则 |
| `references/brand-core.md` | 识别色与 logo 摘要 |
| `scripts/theme.mjs` | **冻结 Token**（色 / 字号 / 边距 / gutter / Logo 位） |
| `scripts/build-deck.mjs` | 母版展览 / 定制 deck（含 `layoutCards`） |
| `scripts/check-deck.mjs` | ≤45 页、色值白名单、logo、16:9、无 Wingdings / 雅黑 |
| `assets/logo.png` | 横式 logo（白底渲染，供 pptxgenjs） |
| `examples/sample-deck.pptx` | **40** 母版展览（每种叙事功能一页） |

## 何时使用

- 用户说：做 PPT、汇报材料、方案汇报、招投标讲标、投标演示、产品介绍 PPT
- 要把已有大纲改成曙光云风格 16:9 幻灯片
- 迭代 Family A「编辑疏朗」或 Family B「模块卡片」样张

## 品牌硬锁（先读 DESIGN.md）

| Token | HEX | 用途 |
|-------|-----|------|
| Canvas / Page | `#FFFFFF` | 全页底；禁暗 sandwich |
| Card | `#F0F0F0` | Family B 模块底 |
| Title | `#1A1A1A` | 标题 |
| Body | `#333333` | 正文 |
| Muted | `#727272` | 标签 / logo 灰 |
| Brand | `#AF1F24` | PPT 识别红（主强调） |
| BrandDeep | `#C8161D` | UI/深一点强调；红预算计入 |

红：单页落点 **≤2**（Logo 可另计）、面积 **≤8%**。禁粉洗 `#F8E8E8`、侧条/通栏色条、标题下划线。

## 图标默认

- **主用** [Lucide](https://lucide.dev)（ISC）— https://github.com/lucide-icons/lucide
- **备选** [Material Symbols](https://fonts.google.com/icons)（Apache-2.0）— https://github.com/google/material-design-icons
- 色可改 `#AF1F24` / `#C8161D` / `#727272`；落 PPT 用静态 SVG。
- 动效库（AnimateIcons / Line MD / lucide-animated）**暂缓**，不替换本默认对。

## 工作步骤（单路由 · 禁跳步）

对齐 rule-013 / rule-016：一次只走一条顶层路线（新建 / 美化 / 母版填充）。

1. **Brief**：锁定 Family（A 或 B）、中文文案、`density_contract`（max_cards / decoration_budget / overflow）。
2. **Token**：对照 `tokens.css` / `DESIGN.md` / `scripts/theme.mjs`；H2 默认深色，红仅 KPI/锚点/短规则线/Logo。
3. 多列灰卡用 `layoutCards({ n, title, items })`，不要复制 sticky 列数版式。
4. **Storyboard → build g1 → build g2 → finish**：每步 Gate 通过再进下一步；失败只重试当前或显式回退。
5. **Icon+字一体**：同组插入并回流字盒；双栏顺序 **标题 → 同行图标 → ≥6mm 空 → 清单**；三栏等宽。
6. **母版 Logo**：右上安全区 ≥8–10mm；Logo SVG **剥离三横线/汉堡 chrome** 再栅格；禁止页内装饰抢位。
7. 运行生成与检查：

```bash
node scripts/build-deck.mjs [--out examples/sample-deck.pptx] [--outline path.json]
node scripts/check-deck.mjs examples/sample-deck.pptx
```

8. **门禁抽查**（见 DESIGN §视觉门禁）：四角、母版 Logo 全页可见未裁切、禁三横线、Icon–标题对、等宽栅格、双栏基线。
9. **用户未说「门禁过 / 通过」→ 不宣称交付合格。**

字体：默认不嵌入。中文 `Source Han Sans SC` / `Noto Sans CJK SC`；导出禁微软雅黑；禁 Wingdings。

## 版式族（单一母题 · rule-017）

| Family | 母题 | 密度 |
|--------|------|------|
| A 编辑疏朗 | 字阶 + 留白分区，cardless 优先 | 低–中 |
| B 模块卡片 | 等宽 Card 网格，扫描「总题 → 模块」 | 中（受 max_cards） |

假多样否决：同骨架换字号/换红位/换圆角 → 不进 patterns。真多样须信息架构不同（与 A/B ≥2 条结构差）。

样例展览母版目录见 `references/layouts.md`（当前 **40** 个叙事母版，≤45）。

## 来源与商标

Logo 使用规则见 `sugon-logo-usage` / 仓库根 `TRADEMARKS.md`。规则摘要见 `RULES.md`。
