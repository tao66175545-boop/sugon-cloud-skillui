# DESIGN.md · 曙光云 PPT 设计契约

> 配套 `SKILL.md` / `tokens.css` / `RULES.md` / `scripts/theme.mjs`。v0.4.5。

---

## 1. 品牌色锁

| Token | HEX | 角色 |
|-------|-----|------|
| `--sugon-canvas` | `#FFFFFF` | 页底；全浅色；**禁暗 sandwich** |
| `--sugon-card` | `#F0F0F0` | Family B 模块 / 分区浅底 |
| `--sugon-title` | `#1A1A1A` | 标题 |
| `--sugon-body` | `#333333` | 正文 |
| `--sugon-muted` | `#727272` | 标签、说明、logo 灰 |
| `--sugon-brand` | `#AF1F24` | PPT 识别红（唯一强调色） |
| `--sugon-brand-deep` | `#C8161D` | 深一点强调 / UI 主色；计入红预算 |
| `--sugon-line` | `#E0E0E0` | 分割线（宁缺毋滥） |

### 红预算

- 单页红落点 **≤2**（母版 Logo 可另计）
- 红面积 **≤8%**
- 用途：KPI 数字、一词锚点、至多一条短规则线、Logo
- **禁止**：粉洗 `#F8E8E8` / `#FFF5F5`、通栏/侧边色条、整卡红底、暗底+红造冲击

冲击来自 **字阶 + 留白 + 一处红**，不靠暗底或红 wash。

---

## 2. 画布与边距

- 画布：**16:9**（13.333" × 7.5"）
- 页边距建议：L/R ≥0.5–0.6"；T/B ≥0.4"
- 块距统一 0.3–0.5"；**禁止**盲目 fit/autoFit 挤爆

---

## 3. 字阶角色（type-recipe-001）

| 角色 | pt | 色 |
|------|-----|-----|
| CoverMain | ≥48 bold | Title 或少量 Brand 字 |
| PageTitle | ≥36 bold | Title |
| Section | 20–24 bold | Title 或 BrandDeep（计入红） |
| Body | 14–17 | Body |
| Caption / 标签 | 10–12 | Muted |
| Num（真序列） | ≥36 | Brand 或 Title |
| KPI | ≥64 | Brand |

- 标题相对正文落差 **≥约 16pt**
- 全 deck 一套字体：正文 `Noto Sans CJK SC` / `Source Han Sans SC`；数字 tabular-nums
- **禁**：标题下划线；处处加粗；换色单词汇标代替字阶；并列要点伪编号 01/02/03

---

## 4. 版式族

### Family A · 编辑疏朗（pattern-001）

- 单栏叙事；大标题 + 留白分区；至多一处尖刺红
- cardless 优先；并列用短列表/双栏字，非卡墙
- 密度：低–中

### Family B · 模块卡片（pattern-002）

- 等宽 Card `#F0F0F0` 网格；「总题 → 模块阵列」
- 多列等宽 + 等 gutter；同页只 1 种卡片皮肤
- 圆角政企向 0–4px；禁 12–20px SaaS 圆角堆
- 密度：中，受 `max_cards` 约束

### 跨页母题（rule-017）

整 deck 只重复 **1** 个结构手势，按封面/目录/内容/结尾换强度，不换骨架冒充新版式。  
假多样（同骨架换字号/红位/圆角）否决。

---

## 5. 图标契约

| 项 | 规定 |
|----|------|
| 默认对 | Lucide（主）+ Material Symbols（备） |
| 落版 | 静态 SVG；可改色 Brand / BrandDeep / Muted |
| 一体排 | **Icon + 标题同组插入并回流字盒**；禁止先字后贴浮层 |
| 双栏顺序 | **标题 → 同行图标（同基线）→ ≥6mm 空 → 清单** |
| 三栏 | **等宽栅格**、等 gutter、光学居中 |
| 安全区 | Icon / chrome **不得侵占**右上 Logo 安全区 |

动效 icon 仅 Playground/偶发状态；`.pptx` 默认无动画（rule-011/012）。

---

## 6. Logo / 母版契约

| 项 | 规定 |
|----|------|
| 位置 | 右上；全页母版一致 |
| 安全区 | 距边 ≥**8–10mm**（约 0.3–0.4"）矩形内 **禁止其它形状** |
| SVG 预处理 | 栅格进母版前 **剥离三横线 / 汉堡 / 英系 chrome**；勿把信号条当装饰保留撞标 |
| 可见性 | 每页断言母版 Logo **可见且未裁切**；禁页内装饰盖住或「藏母版」 |
| 色 | 与识别红 / logo 灰一致；勿改成 UI 红冒充印刷标 |

有单位官方母版时走 Edit Native / 模板填充，**不覆盖**装饰层抢安全区（rule-010）。

---

## 7. 密度合同（rule-014）

页 brief 必写：

- `density_bias` / `density_curve`
- `max_cards` · `max_charts` · `decoration_budget` · `overflow_strategy`
- 渲染层 **不得**自行抬降密度
- **禁**连续 3 页 high/dashboard；cover / section / end **禁** dashboard
- 五页样张至多 **1** 页偏仪表；前后须有过渡叙事页
- `decoration_budget` 计入红面积 ≤8%、红落点 ≤2

旋钮建议（rule-008）：Variance **低** · Motion **极低** · Density **中**。

---

## 8. 流水线门禁（rule-013 / 016 / 015）

```
storyboard → build(g1) → build(g2) → finish
  → 结构 QA（density / 槽位）
  → 像素 QA（render PNG）
  → 强制人工抽查清单（下节）
  → 用户明示「门禁过 / 通过」才算合格交付
```

- 失败：只重试**当前**步或显式回退；**禁止**跳步、静默降级必选产物（母版 Logo、token、中文文案）
- 一次只激活一条顶层路线（新建 / 美化 / 母版填充）
- Beautify 前若源含暗 sandwich → **先整 deck 翻白**
- 扩样 / skill bump / `git push` = **用户闸**；编排不代拍板

---

## 9. 视觉门禁清单（交付前强制）

> 根因：增量补丁无安全区 + QA 盲区。`check-overlap` clean **≠** 可交付。

### 自动

- [ ] overlap / OOB / 文本溢出
- [ ] 色值白名单（Canvas/Card/Title/Body/Muted/Brand/BrandDeep）
- [ ] 16:9；无 Wingdings / 导出禁雅黑

### 强制人工 / 截图抽查（每页）

- [ ] **右上 Logo 安全区**：无叠线、无裁切、母版 Logo 可见
- [ ] **禁三横线 / 汉堡 chrome**（含 Logo SVG 内残留）
- [ ] **Icon+字一体**：无叠字；双栏为 标题→图标→空隙→清单
- [ ] **等宽栅格**：摘要/多栏列宽与 gutter 一致，光学居中
- [ ] **双栏基线**：下区 callout 与列表对齐
- [ ] **四角**：无贴边裁切、无装饰撞角
- [ ] 红预算未超；无粉洗 / 侧条 / 标题下划线 / 暗底

用户未确认通过 → **不宣称门禁过**。

---

## 10. 否决清单（Veto）

| ID | 否决 |
|----|------|
| V-dark | 暗色封面 / 深浅 sandwich |
| V-wash | 粉洗底、大面积红 wash |
| V-bars | 通栏/侧边装饰色条；标题下划线 |
| V-chrome | 英系三横线/汉堡与 Logo 并存 |
| V-overlay | Icon 浮层不回流导致叠字 |
| V-uneven | 多栏不等宽 / 光学不居中交差 |
| V-skip | 跳过流水线门禁或静默降级 Logo/中文 |
| V-fake | 假多样（同骨架换皮）冒充新 pattern |
| V-motion | 政企 `.pptx` 弹跳/缩放秀动画 |

---

## 11. 相关文件

- 规则摘要：`RULES.md`
- Token：`tokens.css`、`scripts/theme.mjs`
- 版式目录：`references/layouts.md`
- 品牌摘要：`references/brand-core.md`
