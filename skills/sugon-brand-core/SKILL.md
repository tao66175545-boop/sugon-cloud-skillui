---
name: sugon-brand-core
description: >-
  曙光云 / Sugon brand identity foundation: official logo SVG, brand red #AF1F24
  (distinct from UI primary #C8161D), logo gray #727272, Chinese font stack and
  license notes, and a pasteable brand-params pack for Kimi / AiPPT. Use before
  any work involving the Sugon logo, brand colors, print, PPT, posters or name
  cards. Not a UI component skill — for web buttons/links use sugon-brand-kit.
license: MIT
metadata:
  author: 涛 李
  version: "0.4.0"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
---

# 曙光云品牌识别底座 sugon-brand-core

> **角色**：识别层（logo / 品牌色 / 字体），不是 UI 组件层。  
> 做 logo、VI、PPT、印刷、新媒体、名片之前先读本技能。网页按钮与链接请用 `sugon-brand-kit`。

## 本目录文件

| 文件 | 角色 |
|------|------|
| `SKILL.md` | 本入口 |
| `BRAND.md` | 识别规则：两层红、灰、字体、logo 资产 |
| `references/colors.md` | 颜色表（由 `tokens/sugon.brand.json` 生成） |
| `references/fonts.md` | 字体与授权 |
| `brand-params.md` | 可粘贴给 Kimi / AiPPT 的品牌参数包 |
| `assets/logo/` | logo 原稿与白底 PNG |

## 何时使用

- 用户提到曙光 / 曙光云 / Sugon 的 **logo、品牌色、印刷、PPT、海报、名片、VI**
- 需要区分「识别红 #AF1F24」与「UI 红 #C8161D」
- 需要把品牌参数粘贴到 Kimi PPT / AiPPT

## 何时不要使用

- 纯网页 UI（按钮、表单、卡片）→ 用 `sugon-brand-kit`
- 生成后的品味审计 → 外部质量层

## 工作步骤

1. 读 `BRAND.md` 与 `references/colors.md`，确认本物料用 **brand.red** 还是 **UI primary**。
2. 同一画面只选一种红作主色；logo 永远用 `assets/logo/sugon-cloud-logo.svg` 原稿，**不要**改成 #C8161D。
3. 放置 logo 时改用 `sugon-logo-usage`（变体、留白、最小尺寸、审查）。
4. 需要给 SaaS 工具时，复制 `brand-params.md` 全文粘贴。

## 来源

- 源仓库：https://github.com/tao66175545-boop/sugon-cloud-skillui （`skills/sugon-brand-core/`）
- 代码与文档 MIT；名称与 logo 见仓库 `TRADEMARKS.md`（用户确认可随本 kit 公开使用）。
