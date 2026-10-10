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
  version: "0.4.2"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
---

# 曙光云政企 PPT 模板 sugon-ppt-template

> **通用 16:9 草稿母版**（无官方 `.potx` 时使用）。颜色与 logo 来自 `sugon-brand-core`。  
> 交付物为可在 PowerPoint / WPS 继续编辑的 `.pptx`。**本环境未做 UOS / 麒麟 WPS 实机验收。**  
> **v0.4.2**：加大留白与层级，短竖标+短红线强调，浅底卡片分区；原则见仓库外调研笔记（不复制第三方 skill 代码）。

## 本目录

| 路径 | 角色 |
|------|------|
| `SKILL.md` | 本入口 |
| `references/layouts.md` | 版式：封面 / 目录 / 章节 / 正文 / 双栏 / 图表占位 / 结束 |
| `references/gov-report-style.md` | 政企文风与字体规则 |
| `references/brand-core.md` | 识别色与 logo 摘要（与 brand-core 同步） |
| `scripts/build-deck.mjs` | 大纲 JSON → 样例 / 定制 deck |
| `scripts/check-deck.mjs` | 色值白名单、logo、16:9、无 Wingdings、无占位符残留 |
| `assets/logo.png` | 横式 logo（白底渲染，供 pptxgenjs） |
| `examples/sample-deck.pptx` | 生成的样例（封面+目录+章节+正文+双栏+数据+结束） |

## 何时使用

- 用户说：做 PPT、汇报材料、方案汇报、招投标讲标、投标演示、产品介绍 PPT
- 要把已有大纲改成曙光云风格 16:9 幻灯片

## 工作步骤

1. 确认用 **识别红 `#AF1F24`**（不是 UI `#C8161D`）；logo 用本目录 `assets/logo.png` / 仓库 `brand-assets/logo/`。
2. 读 `references/layouts.md`，只用已定义版式，一页一个结论句作标题。
3. 运行生成：

```bash
node scripts/build-deck.mjs [--out examples/sample-deck.pptx] [--outline path.json]
```

4. 运行检查：

```bash
node scripts/check-deck.mjs examples/sample-deck.pptx
```

5. **默认不嵌入字体**。正文/标题字体名写 `Source Han Sans SC`（Linux 回退名 `Noto Sans CJK SC`）；导出图片/PDF **禁止微软雅黑**。

## 版式一览

cover · agenda · section · content · two-col · stats · chart · closing（详见 `references/layouts.md`）

## 来源与商标

源仓库 `skills/sugon-ppt-template/`；logo 使用规则见 `TRADEMARKS.md` 与 `sugon-logo-usage`。
