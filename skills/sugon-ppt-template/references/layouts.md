# 版式目录（16:9 · LAYOUT_WIDE 13.333×7.5 in）· v0.4.3

边距 ≥ **0.65 in**。页脚可选「内部资料 · 注意保密」+ 页码。  
品牌强调：标题左侧**短竖标** + 标题下**短红线**（不用全高侧栏 / 通栏粗底条）。  
样例 `examples/sample-deck.pptx` 含下列 **35** 种版式各 1 页（`layout` id 印在页内小标签）。

## A. 开场与导航

| id | 用途 |
|----|------|
| `cover` | 标准封面：logo、大标题、短红线、副标题、单位与日期 |
| `cover-split` | 左结论 + 右 3 条拍板预告 |
| `agenda` | 单列红编号目录 |
| `toc-two-col` | 双列目录卡片 |
| `section` | 浅底章节隔页（大号章节号） |
| `section-band` | 中部色带章节隔页 |

## B. 叙事与要点

| id | 用途 |
|----|------|
| `exec-summary` | 结论句 + 3 证据卡 |
| `content` | 单栏编号要点卡 |
| `content-two-level` | 主点 + 子点分层卡 |
| `two-col` | 双栏对位卡 |
| `three-col` | 三等分能力卡 |
| `four-grid` | 2×2 保障条件 |
| `icon-rows` | 编号圆标 + 标题 + 说明（4 行） |
| `callout` | 中心单一关键结论 |

## C. 对比与框架

| id | 用途 |
|----|------|
| `compare` | 现状 / 目标 |
| `pros-cons` | 利弊双栏 |
| `options-3` | 三方案横比（含建议标签） |
| `matrix-2x2` | 影响-紧急度四格 |
| `swot` | SWOT 四象限 |
| `table` | 简洁三列表格 |

## D. 数据与指标

| id | 用途 |
|----|------|
| `kpi-3` | 三指标大字号 |
| `kpi-4` | 四指标 |
| `kpi-row` | 横向快照条 |
| `chart-frame` | 图表占位 + 读图要点 |
| `bridge-frame` | 能力桥段（基线→目标） |

## E. 计划与治理

| id | 用途 |
|----|------|
| `timeline` | 横向季度时间轴 |
| `process-h` | 横向流程步 |
| `process-v` | 纵向检查链 |
| `roadmap` | 工作流 × 季度色条 |
| `risk` | 风险 / 影响 / 缓解表 |
| `next-steps` | 行动项 + 责任人 |

## F. 组织与收束

| id | 用途 |
|----|------|
| `team` | 角色卡片行 |
| `quote` | 引用 / 工作要求（克制） |
| `closing` | 谢谢 / 联系占位 |
| `appendix` | 附录隔页 |

## 选用建议

- 政企汇报主线：`cover` → `agenda` → `exec-summary` → `section` → `content` / `two-col` / `kpi-*` → `roadmap` → `risk` → `next-steps` → `closing`
- 需要方案取舍时插入 `options-3` / `compare` / `swot`
- 数据页优先 `kpi-*` 或 `chart-frame`，避免纯文字堆砌
- **禁止** Wingdings；编号用文本或圆形形状
