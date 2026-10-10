# PPT P0 优化依据（v0.4.5）

> 日期：2026-10-10 · 执行方：Grok Bot · 拍板：高级PPT设计专家（Bot）

## 专家总评

**需改（不重做）**。品牌色、Logo 位、红竖条标题与灰卡底盘可用；100 页假多样性、浅灰对比不足、Token 未冻结 → 先冻 Token、参数化母版、样例 ≤45。

## P0 落地对照

| 专家要求 | 实现 |
|----------|------|
| 抽 theme（色/字号/边距/gutter/卡 padding/红竖条/Logo 位） | `skills/sugon-ppt-template/scripts/theme.mjs` |
| Body #333 · Muted #666 · 卡 #F5F5F5 · 禁 #999 on 卡 · H1 #1A1A1A | theme + check-deck 白名单 |
| `layoutCards({n,title,items})`，删仅列数不同的重复类型 | `build-deck.mjs` export `layoutCards`；样例只展 2/3/4 |
| H2 默认深色；红仅 recommended/current/kpi/logo/section | 卡片 H2 逻辑 + KPI 仅首个大红 |
| 样例 ≤45 母版；变体写入 layouts.md | **40** 页展览 + 参数化表 |

## 字号 / 边距（专家规格）

见 `theme.mjs`：`TYPE` / `MARGIN` / `GUTTER=0.2` / `TICK` 4×22pt / Logo inset 0.35"。

## 版权

实现均为本仓原创 pptxgenjs。未复制 Anthropic 或其他专有 skill 源码。
