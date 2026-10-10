---
name: sugon-logo-usage
description: >-
  Place or review the 曙光云 / Sugon logo on pages, PPT, posters, name cards or
  docs: choose variant by background, enforce minimum size and clear space, list
  misuse don'ts, and run scripts that place the logo in SVG/HTML or check that
  the logo red was not recolored to UI primary. Use whenever a Sugon logo is
  added, moved or audited.
license: MIT
metadata:
  author: 涛 李
  version: "0.4.2"
  homepage: https://github.com/tao66175545-boop/sugon-cloud-skillui
---

# 曙光云 Logo 用法 sugon-logo-usage

> 依赖识别色与原稿：先读或一并安装 `sugon-brand-core`。

## 本目录

| 路径 | 角色 |
|------|------|
| `SKILL.md` | 决策树入口 |
| `references/do-dont.md` | 做 / 不做 |
| `assets/logo/` | 与 brand-core 同步的 logo 文件 |
| `scripts/place-logo.mjs` | 按画布与角位计算合规坐标，输出 SVG / HTML 片段 |
| `scripts/check-logo.mjs` | 检查 SVG/HTML/CSS 是否把 logo 红改成了别的色（尤其 #C8161D） |

## 决策树

1. **背景亮度**  
   - 白底或浅底（L\* > 90）→ 原色稿 `sugon-cloud-logo.svg`  
   - 深底 / 照片底 → 反白稿（**TBD**；未提供前不要用原色稿）  
   - 纯红底 → 白单色稿（**TBD**）
2. **尺寸** ≥ 屏宽 120px 或印刷宽 25mm（**待确认** 推算值，见 brand.json）
3. **留白** 四周不少于约 0.3 × logo 高度（**待确认**）
4. **禁止** 见 `references/do-dont.md`（拉伸、改色成 UI 红、加特效等）

## 脚本

```bash
# 在 1920×1080 画布右上角放置，输出 SVG
node scripts/place-logo.mjs --width 1920 --height 1080 --corner top-right --format svg

# 检查文件是否把 #AF1F24 改成了 #C8161D 或其他非白名单色
node scripts/check-logo.mjs path/to/file.svg
```

## 来源

源仓库 `skills/sugon-logo-usage/`；商标说明见 `TRADEMARKS.md`。
