# 版式目录（16:9 · LAYOUT_WIDE）· v0.4.5 · P0 母版展览

> 依据 **高级PPT设计专家** 拍板：样例外发 ≤45 页「真正不同叙事功能」的母版；列数差异改为参数化变体。  
> 边距 L/R **0.6"**，顶 **0.45"**，底 **0.4"**；列 gutter **0.2"**；卡底 `#F5F5F5`；正文 `#333333` / 辅助 `#666666` / 标题 `#1A1A1A`。  
> 识别红 `#AF1F24` 仅用于：Logo、章节数字、≤1 个主 KPI/页、列表圆点、推荐/当前项。

Token 实现：`scripts/theme.mjs`。卡片 API：`layoutCards({ n, title, items })`。

## 母版展览（样例 deck · 40）

| id | 叙事用途 |
|----|----------|
| `cover` | 左对齐封面：主标题 + 短红线 + 会期 |
| `cover-band` | 底栏信息条封面（密级/汇报人） |
| `agenda` | 竖向编号目录 |
| `agenda-cards` | 卡片栅格目录 |
| `section-number` | 章节：大号数字语法 |
| `section-part` | 章节：PART 语法（同稿勿与上一种混用） |
| `exec-summary` | 中密度默认：左述右要点 |
| `key-message` | 单结论句 |
| `content` | 中密度正文要点 |
| `cards-2` | 信息卡 n=2（参数化展示） |
| `cards-3` | 信息卡 n=3 |
| `cards-4` | 信息卡 n=4 |
| `stack-2` | 上下双栈（问题/对策） |
| `four-grid` | 四宫格能力切片 |
| `compare-2` | 双栏对照（改造前/后） |
| `options-3` | 三方案（含推荐项） |
| `matrix-2x2` | 统一 Token 的 2×2 |
| `kpi-3` | 三 KPI（仅首个大红数字） |
| `kpi-4` | 四 KPI |
| `table-basic` | 基础表 |
| `scorecard` | 评分卡表 |
| `chart-slot` | 图表槽位规格（非假图充数） |
| `timeline` | 时间轴 |
| `process-5` | 五步流程 |
| `roadmap` | 季度路线 |
| `checklist` | 检查清单 |
| `action-items` | 行动项（任务/责任人/日期） |
| `risk-table` | 风险表（语义色克制） |
| `gantt-lite` | 简易甘特条 |
| `status-rag` | 状态总览 |
| `pillars-3` | 多支柱（`pillars(n)` 展示） |
| `numbered-rows` | 编号行列表 |
| `team` | 角色分工 |
| `faq` | 问答 |
| `decision` | 决策项 |
| `quote` | 引用 |
| `closing` | 小结 |
| `appendix` | 附录分隔 |
| `contact` | 联系方式 |
| `back-cover` | 封底 |

## 参数化变体（不各占一页母版）

| API | 说明 | 样例页 |
|-----|------|--------|
| `layoutCards({ n: 2..5, items })` | 列数变体；H2 默认深色；`recommended`/`current` 才红 | `cards-2/3/4` |
| `layoutKpi` / `kpi-row(n)` | KPI 个数参数化；每页 ≤1 个大红焦点 | `kpi-3` `kpi-4` |
| `pillars(n)` | 多竖条能力柱 | `pillars-3` |
| `compare-2` 变体 | 优缺点 / 现状目标 / 改造前后 → 同一双栏 | `compare-2` |
| `numbered-rows` + 密度 | 竖条清单密度参数 | `numbered-rows` |
| 章节 API | `section-number` \| `section-part` 二选一 | 两页分展 |

## 选用建议

- 主线：`cover` → `agenda` → `exec-summary` → `section-*` → `content`/`kpi-*` → `roadmap` → `risk-table` → `action-items` → `closing`
- 同稿只选一种章节语法
- **禁止** Wingdings；编号用文本或圆形形状
- 地图/漏斗/金字塔等空灰块不进主样例；需要时单独定 chart 规范
