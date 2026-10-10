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
> **v0.4.5（P0）**：按高级PPT设计专家拍板收敛——冻结 `theme.mjs`、参数化 `layoutCards`、对比度与红用量克制、样例外发 **≤45** 母版（当前 **40**），假多样性列数变体改为文档化参数。

## 本目录

| 路径 | 角色 |
|------|------|
| `SKILL.md` | 本入口 |
| `references/layouts.md` | 母版 id + 叙事用途 + 参数化变体 |
| `references/gov-report-style.md` | 政企文风与字体规则 |
| `references/brand-core.md` | 识别色与 logo 摘要 |
| `scripts/theme.mjs` | **冻结 Token**（色 / 字号 / 边距 / gutter / 红竖条 / Logo 位） |
| `scripts/build-deck.mjs` | 母版展览 / 定制 deck（含 `layoutCards`） |
| `scripts/check-deck.mjs` | ≤45 页、色值白名单、logo、16:9、无 Wingdings / 雅黑 |
| `assets/logo.png` | 横式 logo（白底渲染，供 pptxgenjs） |
| `examples/sample-deck.pptx` | **40** 母版展览（每种叙事功能一页） |

## 何时使用

- 用户说：做 PPT、汇报材料、方案汇报、招投标讲标、投标演示、产品介绍 PPT
- 要把已有大纲改成曙光云风格 16:9 幻灯片

## 工作步骤

1. 确认用 **识别红 `#AF1F24`**（不是 UI `#C8161D`）；logo 用本目录 `assets/logo.png` / 仓库 `brand-assets/logo/`。
2. 读 `references/layouts.md` 与 `scripts/theme.mjs`；H2 默认深色，红仅用于推荐/当前/KPI/Logo/章节数字。
3. 多列灰卡用 `layoutCards({ n, title, items })`，不要复制 sticky 列数版式。
4. 运行生成：

```bash
node scripts/build-deck.mjs [--out examples/sample-deck.pptx] [--outline path.json]
```

5. 运行检查：

```bash
node scripts/check-deck.mjs examples/sample-deck.pptx
```

6. **默认不嵌入字体**。正文/标题字体名写 `Source Han Sans SC`（Linux 回退名 `Noto Sans CJK SC`）；导出图片/PDF **禁止微软雅黑**。

## 版式一览

**40** 个母版 id + 参数化变体：见 `references/layouts.md`

## 来源与商标

源仓库 `skills/sugon-ppt-template/`；logo 使用规则见 `TRADEMARKS.md` 与 `sugon-logo-usage`。设计拍板见高级PPT设计专家 P0 复核（需改、不重做）。
