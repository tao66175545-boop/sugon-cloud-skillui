---
name: sugon-ppt-template
description: >-
  曙光云政企 PPT 模板与门禁。生成或改写 16:9 汇报/讲标/产品介绍 PPT；对齐 HARD-LOCKS、
  按 dehom7 干净圆角页型铺行业赋能段；品牌识别红 #AF1F24、官方横式 logo，默认不嵌入字体
  （WPS / 信创更稳），禁用 Wingdings。网页 UI 请用 sugon-brand-kit；logo 见 sugon-logo-usage。
license: MIT
metadata:
  author: 涛 李
  version: "0.4.6-ppt-skill-module"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
  sample_deck: "sugon-od-v3-100 · dehom7 · ind7-YokM0y"
---

# 曙光云政企 PPT 模板 sugon-ppt-template

> **通用 16:9 草稿母版**（无官方 `.potx` 时使用）。颜色与 logo 来自 `sugon-brand-core`。  
> 交付物为可在 PowerPoint / WPS 继续编辑的 `.pptx`。**本环境未做 UOS / 麒麟 WPS 实机验收。**  
> **v0.4.6-ppt-skill-module**：并入总监 OD 入口/门禁（`GATES.md`）、HARD-LOCKS、dehom7 十型与 100 页样张；保留 `scripts/` 与旧 `examples/sample-deck.pptx`。  
> **用户未说「门禁过 / 通过」→ 不宣称交付合格。**

## 本目录

| 路径 | 角色 |
|------|------|
| `SKILL.md` | 本入口（Agent Skills） |
| `DESIGN.md` | 视觉与页型摘要（Tone v4 · dehom7 十型） |
| `GATES.md` | **出门禁否决清单**（V/L/C） |
| `RULES.md` | 库规则摘要（rule-001…017 + 站立门禁 + OD-REDLINE） |
| `tokens.css` | 设计 token（与 `scripts/theme.mjs` 对齐） |
| `references/HARD-LOCKS.md` | 硬锁全文（字阶/对齐/疏密/色） |
| `references/CREATIVE-BRIEF-P91-100-industry-dehom7.md` | P91–100 行业赋能 Brief |
| `references/COPY-PACK-P91-100-industry.md` | P91–100 文案包 |
| `references/hairline-equal-margin.md` | 标题短红线上下等距（OD-REDLINE） |
| `references/layouts.md` | 母版 id + 叙事用途 |
| `scripts/theme.mjs` | **冻结 Token**（色 / 字号 / 边距 / gutter / Logo 位） |
| `scripts/build-deck.mjs` | 母版展览 / 定制 deck（含 `layoutCards`） |
| `scripts/check-deck.mjs` | 色值白名单、logo、16:9、无 Wingdings / 雅黑 |
| `assets/logo.png` | 横式 logo（白底渲染，供 pptxgenjs） |
| `examples/sample-deck.pptx` | **40** 母版展览（保留） |
| `examples/sugon-od-v3-100.pptx` | **100 页样张**（dehom7 · ind7-YokM0y） |

## 何时用

- 用户说：做 PPT、汇报材料、方案汇报、招投标讲标、投标演示、产品介绍 PPT
- 在 `sugon-od-v3-100` 成品上扩页、改 P91–100、或复刻同视觉语言
- 验收是否违反硬锁 / 造型乱感 / 灰卡同质
- TypeUI「PPT SKILL」模块生成或校验幻灯片

## 成品锚点（当前权威）

| 项 | 仓库内路径 |
|----|------------|
| 100 页样张 | `examples/sugon-od-v3-100.pptx`（SPA：`public/ppt-skill/sugon-od-v3-100.pptx`） |
| HARD-LOCKS | `references/HARD-LOCKS.md` |
| 本段 Brief | `references/CREATIVE-BRIEF-P91-100-industry-dehom7.md` |
| 文案包 | `references/COPY-PACK-P91-100-industry.md` |

版本标签：`sugon-od-v3-100 · dehom7 · ind7-YokM0y`（2026-10-15）

## 入口流程（最短）

1. **读锁**：`references/HARD-LOCKS.md` → `DESIGN.md` → 当前段 Brief（若有）
2. **定范围**：前 N 页冻结只许改页脚「共 M 页」；只动授权页
3. **定壳**：新段须十页剪影互斥；优先干净圆角大块实心；禁异形乱多边形
4. **定文**：COPY 定稿后不改题面；无来源不编造
5. **铺页**：剪影先于灰卡 → 标题铬 → 正文垂直居中 → 8pt 栅格 → Brand ≤8%
6. **脚本**（可选母版展览）：`node scripts/build-deck.mjs` / `node scripts/check-deck.mjs`
7. **门禁**：跑 `GATES.md`；缩略不可互换、不读成灰卡墙/乱多边形才过
8. **用户未说「门禁过 / 通过」→ 不宣称合格。**

## 设计口令

**骨架照 Brief 十型 · 皮肤照 v4 · 色不破硬锁 · 排版+造型双硬锁**

详见 `DESIGN.md`、`GATES.md`。站立细则与 rule-001…017 见 `RULES.md`。  
工艺补充（标题红线等距）：`references/hairline-equal-margin.md`（open-design Apache-2.0 craft 改编，非逆向）。

## 图标默认

- **主用** [Lucide](https://lucide.dev)（ISC）
- **备选** Material Symbols（Apache-2.0）
- 静态 SVG；色 Brand / BrandDeep / Muted；动效库暂缓

## 版式族（单一母题 · rule-017）

| Family | 母题 | 密度 |
|--------|------|------|
| A 编辑疏朗 | 字阶 + 留白分区，cardless 优先 | 低–中 |
| B 模块卡片 | 等宽 Card 网格 | 中（受 max_cards） |

P91–100 行业赋能段以 **dehom7 十型剪影**为准（见 `DESIGN.md`），勿回潮 dehom2–6 异形轴。

## 来源与商标

Logo 使用规则见 `sugon-logo-usage` / 仓库根 `TRADEMARKS.md`。
