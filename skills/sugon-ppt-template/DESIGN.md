# DESIGN.md · 视觉与页型摘要

> v0.4.6-ppt-skill-module · 与 `GATES.md` / `RULES.md` / `tokens.css` / `scripts/theme.mjs` 一并执行。  
> 硬锁全文：`references/HARD-LOCKS.md`。出门禁：`GATES.md`。

## Tone（v4）

| Token | 值 |
|-------|-----|
| Page | `#FFFFFF` |
| Card | `#F0F0F0` |
| 内井 | `#E8E8E8` |
| Brand | `#AF1F24`（≤8% 面积，优先每页 1 处，至多 2） |
| BrandDeep | `#C8161D`（计入红预算） |
| MistSand | **OFF** |
| 面不是线 | 实心面块；禁发丝框堆砌 |
| 标题铬 | ■ 红标 + 灰辅行 + PageTitle≥36 + 短红横 |
| inset | 左右 56px（约 0.583"） |
| Logo | 2.5:1，右缘齐内容右缘，禁压扁；安全区 ≥8–10mm；禁汉堡 chrome |
| Footer | 仅左 `内部资料｜第n页/共N页` |

字色角色：Title `#1A1A1A` · Body `#333333` · Label/Footer `#727272` · Num/KPI Brand 系。

短红线（OD-REDLINE）：标题下短 Brand 线上下等距，默认各 **6mm**，公差 ≤0.5mm；全 deck 同 token。详见 `references/hairline-equal-margin.md`。

## 字阶

CoverMain≥48 · PageTitle≥36 · Body 15–17 · Label/Footer 11–13 · Num/KPI > Body。禁混档。

## 排版硬锁

1. 栏内/卡内文字**垂直居中**（几何居中优先；禁顶齐漂）
2. 卡/栏间距落 **8pt 栅格**（8/16/24/32…）；忌忽挤忽空
3. title / cards / footer **左缘同线**
4. **剪影先于灰卡**：先母题实心剪影，再开井；禁先铺等分灰卡
5. 多列等宽 + 等 gutter；Icon+字同组回流；双栏：标题 → 同行图标 → ≥6mm → 清单

## 造型硬锁（2026-10-15）

- 优先：干净圆角 / 规整几何 / 清晰大块实心剪影
- 禁：异形碎裂、斜切乱多边形、锯齿天际、斜叶乱盘、复杂桁架斜撑、钥孔碎形、撕票锯齿、摆锤斜杠
- 缩略须「一眼干净」，忌「看着很乱」

## 其它禁

大黑块/深灰黑底 · 侧栏色带 · 红线黑描边 · 大黑圆点/粗黑箭头 · 脏粉奶油洗 · bento/等分灰卡墙 · P100≠P90 trays · 假 % / 假 KPI

## dehom7 十型（P91–100 · 行业赋能 · 勿改名）

| 页 | 壳 | 几何一句 |
|----|----|----------|
| P91 | 软晕主核环 Soft Halo Core Rings | 大实心主核+少道软晕环（≠洋葱） |
| P92 | 圆角平层台 Soft Flat Tier Platforms | 平顶圆角台列错宽 |
| P93 | 双卵交叠池 Twin Soft Oval Pool | 两枚干净软卵交叠 |
| P94 | 主辅圆角席 Hero Soft Tile Bank | 一主放大+等径辅卡（≠等大墙） |
| P95 | 软云胶囊簇 Soft Cloud Capsule Cluster | 软云外轮廓+不等胶囊 |
| P96 | 软泡对语程 Soft Bubble Dialogue Path | 软圆角对话泡路径 |
| P97 | 圆角连拱廊 Soft Round Arch Colonnade | 等径圆角拱门横列 |
| P98 | 厚轨圆珠带 Thick Rail Round Bead Band | 单厚轨+层级圆珠（禁假%） |
| P99 | 半盘刻度席 Soft Half-Disk Gauge Seats | 干净半盘+弧上圆角席（无辐条） |
| P100 | 三软胶囊列 Soft Triple Capsule Row | 三枚等径圆角胶囊 |

十页缩略**不可互换**。扩新段时保持同纪律换壳，勿回潮 dehom2–6 异形轴。文案见 `references/COPY-PACK-P91-100-industry.md`；Brief 见 `references/CREATIVE-BRIEF-P91-100-industry-dehom7.md`。

## 延续契约（脚本与规则）

| 文件 | 用途 |
|------|------|
| `RULES.md` | rule-001…017、站立门禁、图标默认 |
| `GATES.md` | 交付前 V/L/C 否决清单（优先出门检） |
| `tokens.css` / `scripts/theme.mjs` | 可执行 token；生成用 |
| `scripts/build-deck.mjs` / `check-deck.mjs` | 母版展览与结构检查 |
| `references/layouts.md` | ≤40 叙事母版目录 |

流水线：`storyboard → g1 → g2 → finish → GATES`；失败只重试当前或显式回退。用户未确认通过 → **不宣称门禁过**。
