# RULES.md · 曙光 PPT 规则摘要

> v0.4.5 · 站立门禁 + rule-001…017（含 W42 摄入）。与 `DESIGN.md` 一并执行。

---

## A. 站立门禁（用户反复批出 · 必须先过）

源自交付事故复盘与站立门禁：

1. **Logo 安全区**：右上固定矩形（≥8–10mm 边距）内禁止其它形状；每页母版 Logo 可见、未裁切。  
2. **禁 SVG 三横线 / 汉堡混淆**：Logo SVG 栅格前剥离信号条/三线 chrome；不得当装饰保留撞标。  
3. **等宽栏**：摘要/多列等宽 + 等 gutter + 光学居中。  
4. **标题 → 图标 → 空隙 → 清单**：双栏一体排；禁 Icon 浮层叠字。  
5. **图标默认**：Lucide + Material Symbols（静态）；动效库暂缓。  
6. **交付前四角抽查**：不以 `overlap-clean` 单独放行；用户未说「门禁过」不算合格。

**根因一句话**：主因是增量补丁无安全区 + QA 盲区（流程债），不是单靠换模型能消掉。

---

## B. 基础规则（rule-001…010）

| ID | 要点 · 曙光落地 |
|----|----------------|
| rule-001 token-first | 出片前锁 hex + 字阶 + 布局；撞车改 token/结构 |
| rule-002 one-bold-accent | Brand 唯一强调；红 ≤2 处、≤8% |
| rule-003 no-ai-defaults | 禁粉洗/奶油/暗 sandwich/SaaS 紫/伪编号 |
| rule-004 type-ladder | Cover≥48 · Title≥36 · KPI≥64；落差够狠 |
| rule-005 no-underline-no-bars | 禁标题下划线、通栏/侧条；短红线计入预算且至多一处 |
| rule-006 tabular-nums-contrast | 数字 tabular；Motion 极低 |
| rule-007 render-qa-overlap | 16:9；overlap/OOB + render 抽检 |
| rule-008 taste-knobs | Variance 低 · Motion 极低 · Density 中 |
| rule-009 cardless-one-idea | 每页一大意；A 优先无卡；B 卡须有并列决策职责 |
| rule-010 native-editable-export | 原生可编 shapes；内容与版式解耦；母版装饰不覆盖；Logo SVG 清 chrome |

---

## C. W42 新摄入（rule-011…017）— 本轮写入重点

### rule-011 · motion-decision-tree（emil-design-eng）

先问「一天看几次」：高频 → **零动画**；偶发才短动效；「好看」但高频 → 不做。  
**曙光**：政企 `.pptx` 默认无动画；HTML/Playground 仅偶发反馈；红只给一瞬 press/KPI。

### rule-012 · easing-duration-enterprise（emil-design-eng）

ease-out 入/出；禁 ease-in 做 UI；UI &lt;300ms；禁 `scale(0)` / `transition: all`；尊重 prefers-reduced-motion。  
**曙光**：仅约束预览/动效 icon；PPT 若不可避免 → 只用淡入。

### rule-013 · pipeline-gates-no-skip（ppt-agent）

状态机主链锁死；Gate 通过才下一步；失败只重试当前或显式回退；禁跳步、禁静默降级 Logo/token/中文。  
**曙光**：`storyboard → g1 → g2 → finish → 四角/Logo/叠层/等宽 → 交用户`。

### rule-014 · density-contract（ppt-agent）

outline 出 density_bias/curve；planning 冻结 density_contract；渲染不得抬密度；禁连续 3 页 dashboard；cover/section/end 禁 dashboard。  
**曙光**：decoration_budget 含红 ≤8%/≤2；A 低–中；B 受 max_cards；五页至多 1 页仪表；style 强制白底。

### rule-015 · dual-layer-visual-qa（ppt-agent）

结构层 validator + 像素层 visual_qa；人工图审须用户「通过」。  
**曙光**：自动 overlap + 强制抽查 Logo 安全区 / 禁三横线 / Icon+字 / 等宽 / 双栏基线。

### rule-016 · single-route-blocking-gate（ppt-master）

只激活一条顶层路线；禁冲突 runtime；BLOCKING 等人确认；失败在归属层修。  
**曙光**：新建/美化/母版填充不同时跑；Beautify 前暗 sandwich 先翻白；push/bump 用户闸。

### rule-017 · cross-page-motif-one（ppt-master）

整 deck **1** 个 cross-page motif，按页角色变强度。  
**曙光**：A=疏朗字阶 或 B=模块卡；假多样否决；新 pattern 须与 A/B ≥2 条结构差。

---

## D. 图标默认（icon-default-2026-10）

| 角色 | 项目 | License |
|------|------|---------|
| 主用 | Lucide · https://lucide.dev · https://github.com/lucide-icons/lucide | ISC |
| 备选 | Material Symbols · https://fonts.google.com/icons · https://github.com/google/material-design-icons | Apache-2.0 |

用户确认：「静态稳妥：Lucide + Material Symbols」（2026-10-12）。  
Deferred：lucide-animated / AnimateIcons / Line MD。

---

## E. brand-adapt 索引（W42 深读）

| 文件 | 映射规则 |
|------|----------|
| emil-design-eng（动效决策树） | 011, 012 |
| ppt-agent-skills（流水线/密度/双层 QA） | 013, 014, 015 |
| ppt-master（单路由/单母题） | 010 强化, 016, 017 |

溯源阅读包笔记见仓库 `docs/ppt-p0-expert-audit.md` 与发行说明；运行时以本文件 + `DESIGN.md` 为准。

---

## F. 实现对齐检查单

- [x] `theme.mjs` / `tokens.css`：Muted `#727272`、Card `#F0F0F0`
- [ ] Logo 资产：栅格前剥离三横线/汉堡 chrome（门禁强制）
- [ ] `check-deck`：持续加强安全区 / 等宽 / 母版可见性（能自动化的部分）
- [x] 版本号与 CHANGELOG：`0.4.5`
