# 曙光云 SkillUI 库

**风格供给层（style supply）** — 在 AI 生成 UI **之前 / 之中** 提供可复用的设计 Skill（`SKILL.md` + `DESIGN.md` + `tokens.css`）。技能符合 [Agent Skills](https://agentskills.io/specification) 规范，一条命令即可装进 Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI 等 AI 编程工具，或作为 shadcn registry 条目写进任意前端项目。本仓库前端是单页库壳演示：**对话（Agent）为唯一管理入口**，数据只存在浏览器本地。

> 产品自称：**曙光云 SkillUI 库**。主色 `#C8161D`，辅以灰 / 白。代码与文档采用 MIT；“曙光 / 曙光云 / Sugon” 名称、logo 与品牌标识**不在 MIT 授权范围内**，见 [`TRADEMARKS.md`](./TRADEMARKS.md)。

<!-- skills.sh 徽章：等 skills.sh 收录本仓库（有人用 npx skills add 安装后自动收录）再启用，避免显示空徽章：
[![skills.sh](https://skills.sh/b/tao66175545-boop/sugon-cloud-skillui)](https://skills.sh/tao66175545-boop/sugon-cloud-skillui)
-->

---

## 30 秒安装

技能名 **`sugon-brand-kit`**（目录 [`skills/sugon-brand-kit/`](./skills/sugon-brand-kit/)）。以下命令都**不需要 npm 账号、不需要 clone**；`v0.2.2` 是固定版本，换成 `main` 即为尝鲜版。

**1. 装进 AI 编程工具（Agent Skills）**

```bash
npx skills add tao66175545-boop/sugon-cloud-skillui
# 锁定版本：
npx skills add https://github.com/tao66175545-boop/sugon-cloud-skillui/tree/v0.2.2/skills/sugon-brand-kit
```

由 [`skills` CLI](https://github.com/vercel-labs/skills) 写入 `.agents/skills/sugon-brand-kit/`，并按你选择的工具链接到 `.claude/skills/` 等目录（`-a claude-code` 指定工具，`-g` 装到全局）。

**2. 技能 + 令牌一起写进项目（shadcn registry）**

```bash
npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit#v0.2.2
```

| 条目 | 写入的文件 |
|------|-----------|
| `sugon-brand-kit` | `.agents/skills/sugon-brand-kit/*`、`.claude/skills/sugon-brand-kit/*`（SKILL.md / DESIGN.md / tokens.css / components.css）+ `src/styles/sugon-tokens.css` 与 `src/styles/sugon-components.css`（按钮 / 卡片 / 表单的 `sugon-*` 类，0.2.1 起；`sugon-tokens` 不含它） |
| `sugon-tokens` | 只要令牌：`src/styles/sugon-tokens.css` |
| `sugon-brand-rules`（可选） | 常驻规则：`.cursor/rules/sugon-brand.mdc`、`.github/instructions/sugon-brand.instructions.md`（只对 UI 文件生效）；**不会**改写你的 `AGENTS.md` / `CLAUDE.md`，需要时手动追加 [`registry/rules/AGENTS.snippet.md`](./registry/rules/AGENTS.snippet.md) |

不要求项目已初始化 shadcn（没有 `components.json` 也能装上文件）。**样式会不会自动接上，取决于有没有 `components.json`**：有，并且 `tailwind.css` 指向入口 CSS（Vite 为 `src/index.css`）时，`sugon-brand-kit` 会在该文件顶部写入下面两行，`sugon-tokens` 只写第一行，装完不用再改入口 CSS。没有 `components.json` 时（例如刚 `npm create vite`）CLI **不会**改入口 CSS，需要自己在 `src/index.css` 最顶部加：

```css
@import "./styles/sugon-tokens.css";
@import "./styles/sugon-components.css"; /* 只装 sugon-tokens 时不要这一行 */
```

路径相对于入口 CSS 所在目录；入口不在 `src/`（例如 `app/globals.css`）时改成正确的相对路径。Tailwind v4 时这两行放在 `@import "tailwindcss"` 之前。装之前可用 `npx shadcn@latest view tao66175545-boop/sugon-cloud-skillui/sugon-brand-kit` 查看将写入的文件（`--dry-run` 需要项目里已有 `components.json`）。

**3. 只要 CSS 变量（CDN）**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.2.2/skills/sugon-brand-kit/tokens.css">
```

```css
@import url("https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@v0.2.2/skills/sugon-brand-kit/tokens.css");
.cta { background: var(--color-primary); color: var(--color-primary-foreground); border-radius: var(--btn-radius); }
```

更多方式（本地路径、package exports、raw 下载、机器可读清单）见 [`export/`](./export/)；给 AI 读的站点索引：<https://tao66175545-boop.github.io/sugon-cloud-skillui/llms.txt>。

---

## 公开说明（Public）

**是什么**：一个「风格供给层」设计 Skill 库 + 单页对话壳。可分发的设计 Skill 以 `SKILL.md` + `DESIGN.md` + `tokens.css` 的形式存放在 `skills/`（见上方「30 秒安装」）；网页里用对话（Agent）完成学习链接 / 起草 / 看库 / 选用 / 确认归库 / 导出。**注意**：网页里「归库」的 Skill 只保存在你自己浏览器的 localStorage，不会写回本仓库，也不会出现在上面的安装渠道里。

- **在线演示**：<https://tao66175545-boop.github.io/sugon-cloud-skillui/>（对话入口 `#agent`；由 `.github/workflows/deploy-pages.yml` 在 push 到 `main` 时构建并发布到 GitHub Pages）
- **源码**：<https://github.com/tao66175545-boop/sugon-cloud-skillui>
- **本地运行**：

  ```bash
  npm ci
  npm run dev          # http://localhost:5173/#agent
  npm run build        # 产物在 dist/；子路径部署可设 BASE_PATH=/<repo>/
  npm run check:dist   # 发布前检查 dist 中没有密钥样式字符串 / 内部地址
  npm run check:tokens # DESIGN.md 与 tokens.css 一致性校验
  npm run check:registry # 校验 registry.json（shadcn）
  ```

- **自带 Key（Bring your own key）**：仓库与在线演示**不内置任何 API Key 或模型网关**。在「设置」里填写你自己的 OpenAI 兼容 Base URL、模型名与 Key：Key **只保存在你浏览器的 localStorage**，请求**从浏览器直接发往你配置的端点**（端点需允许 CORS），不经过本仓库或任何中转服务器。不填 Key 时「看库 / 选用」仍可用，发送消息会被拦截。
- **许可证**：代码与文档 MIT，见 [`LICENSE`](./LICENSE)；品牌名称与标识见 [`TRADEMARKS.md`](./TRADEMARKS.md)。
- **变更记录**：[`CHANGELOG.md`](./CHANGELOG.md)。

---

## 对外统一出口

除了上面的一键安装，其他项目也可以按路径消费，详见 [`export/`](./export/)（`package.json` `exports` 已指向真实可消费路径）：

| 入口 | 说明 |
|------|------|
| [`export/CONSUME.md`](./export/CONSUME.md) | **3 步接入**（安装 / 拿到文件 → `@import` → 用变量） |
| [`export/README.md`](./export/README.md) | 中文接入说明（npx skills / shadcn / jsDelivr / 本地 path / package exports / raw） |
| [`export/manifest.json`](./export/manifest.json) | 机器可读：`install`（三种安装命令）、id、path、`importHint`/`copyHint`、relative / raw / pages / blob / jsdelivr |
| [`export/sugon-skillui.css`](./export/sugon-skillui.css) | 仅 `@import` `skills/sugon-brand-kit/tokens.css` |

`exports` 摘要：`.` / `./css` → 统一 CSS；`./tokens` → `skills/sugon-brand-kit/tokens.css`；`./manifest` → `export/manifest.json`。（npm 包尚未发布，目前用于本地 path / `file:` 引用。）

最小示例：

```css
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
/* 或 */
@import "../path-to/sugon-skillui/skills/sugon-brand-kit/tokens.css";
/* file: 安装后也可：@import "sugon-skillui/css"; */
```

对照 [`examples/minimal-reference/`](./examples/minimal-reference/)（含可静态打开的 `index.html`）与 [`examples/import-from-export/`](./examples/import-from-export/)。**Agent / 对话不是对外出口**；勿引入质量层。

## 分层：供给层 vs 质量层

| 层级 | 职责 | 本仓库 |
|------|------|--------|
| **供给层** | 生成前/中提供品牌令牌与规则 | ✅ 本库拥有（`skills/`） |
| **质量层** | 生成后的品味审计 / 打磨 | ❌ 不引入（Taste / Impeccable / Hallmark 等） |

---

## 如何运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

---

## 单页信息架构（无额外路由）

1. **顶栏** — 品牌 logo「曙光云 SkillUI 库」；一级导航仅 **对话** → `#agent`。
2. **对话（Agent）** — **唯一管理入口**：单输入框 + 可选附图 + 发送。粘贴链接 / 描述 Skill / 附图片 / 说「看库」「选用某某」「归库」「导出」，Agent 理解意图并路由。用你自己的 OpenAI 兼容 API；**归库须确认闸**后才写入 localStorage（键：`sugon-skillui-skills`）。确认成功后对话内展示结果卡（看库 / 选用 / 复制 path）；Agent 区常驻「最近入库 · 当前 N 个」。无独立「录入」表单、无第二套库管理面板。
3. **页脚示例** — `ExampleSection` 为静态风格导出 / 路径导入演示，**不是**动态本机库卡片列表；活库请走 Agent「看库 / 选用」与顶栏数量。
4. **选用说明** — 已收进对话欢迎文案与「选用」能力；不再设独立一级分区。

---

## 对话 Agent：配置 API Key

密钥**仅存本机** `localStorage`（键：`sugon-skillui-llm-settings`），**不会**写入仓库或 `.env`。

1. 打开顶栏「对话」或滚到 `#agent`。
2. 点击「去配置 API」/「设置」。
3. 填写：
   - **Base URL**：必填，你的 OpenAI 兼容端点（例如 `https://api.example.com`；请求由浏览器直连，端点需允许 CORS）
   - **模型名**：必填，默认留空；填写你的端点实际开通的模型（看图请选用支持 vision 的模型）。未填写时发送会被拦截，不发请求
   - **API Key**：你的密钥
4. 保存。未配置 Key 时发送会被拦截，并提示去配置（不假连通）。

也可在项目根目录使用 `.env.local`（已 gitignore）预填，**仅用于本机开发**：

```bash
VITE_LLM_BASE_URL=https://your-llm-gateway.example.com
VITE_SUGON_LLM_API_KEY=你的密钥
VITE_LLM_MODEL=your-model-name
```

设置了 `VITE_LLM_BASE_URL`（或 `VITE_SUGON_LLM_PROXY_TARGET`）时，`npm run dev` / `npm run preview` 会把同源 `/api/llm` 代理到该地址，用于没有开放 CORS 的内部网关；未设置时不挂代理，浏览器直连你在设置里填写的端点。应用会读取上述变量作为默认值；UI 中保存的 localStorage 优先。

> ⚠️ `VITE_*` 变量会被**内联进构建产物**。带着 `.env.local` 执行 `npm run build` 会把 Key / 内部地址打进 `dist/`，切勿发布这样的产物；`npm run check:dist` 会拦截。勿将 `.env.local` 提交到 git。

### 对话能力

| 能力 | 说明 |
|------|------|
| 链接学习 | 消息中粘贴 `http(s)://` URL → 自动识别并抓取正文摘要/起草；CORS 失败时红字错误，可重试或粘贴正文 |
| 图片理解 | 📎 附加本地图片，或在消息中粘贴图片 URL（扩展名启发）；需 vision 模型 |
| 看库 / 选用 | 说「看库」列出本机 Skill；说「选用 <名称>」复制供给层 path（无 Key 也可用） |
| 归库 | 助手给出草稿卡（名称/用途/path）→ **确认归库** 才写入 `sugon-skillui-skills`；成功后对话内结果卡（看库 / 选用 / 复制 path）；取消不落库；无静默归库 |
| 对外输出 | 仅在有待确认草稿时，于确认卡上提供复制；或对话中说「导出」 |

所有增改均经对话完成，刷新后仍在。

---

## Logo / Favicon

- `public/logo.svg` — 站点 favicon（`index.html` `rel=icon`）与静态资源
- `src/assets/logo.svg` — TopBar 品牌标

---

## 仓库结构（分发相关）

```
skills/sugon-brand-kit/          # 唯一事实来源（Agent Skills 规范：目录名 = name）
├── SKILL.md                     # AI 入口：frontmatter（name / description）+ 何时 / 如何使用
├── DESIGN.md                    # 规范：颜色、字体、圆角、间距、按钮三态（数值抄自 tokens.css）
├── tokens.css                   # CSS 变量（主色 #C8161D）
└── components.css               # 纯 CSS 片段：sugon-btn / sugon-card / sugon-input 等
registry.json                    # shadcn GitHub registry：sugon-tokens / sugon-brand-kit / sugon-brand-rules
registry/rules/                  # 可选常驻规则（.mdc / .instructions.md / AGENTS.snippet.md）
design-skills/brand-kit/         # 0.1.x 旧路径的转发 stub，0.3.0 删除
export/                          # 统一 CSS 出口 + manifest.json + 接入文档
public/llms.txt                  # 给 AI 读的站点索引（Pages：/sugon-cloud-skillui/llms.txt）
```

本仓库自身接线（`src/index.css`）：

```css
@import "../skills/sugon-brand-kit/tokens.css";
@import "tailwindcss";
```

最小参考示例：[`examples/minimal-reference/`](./examples/minimal-reference/)。架构说明见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

---

## 非目标

- 托管服务：托管 MCP、云端市场、账号登录（分发只靠 GitHub 仓库本身 + 开放标准 CLI）
- Figma 导入
- 引入质量层依赖（Taste / Impeccable / Hallmark 等）
- 将 API Key 提交到仓库

（npm 包 `sugon-skillui` 在计划中，尚未发布。）

---

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- 品牌令牌为纯 CSS 变量；Skill 列表与 LLM 配置持久化于 `localStorage`

---

## 验收要点

| ID | 准则 |
|----|------|
| **A** | 对话入口；无 Key 时明确配置提示，发送拦截 |
| **B** | URL → 摘要/草稿；失败红字可重试 |
| **C** | 归库确认闸后再写 localStorage；取消不落库 |
| **D** | 本地上传或图 URL 至少一种可预览 |
| **E** | 曙光 SVG logo + favicon |
| **F** | 无质量层；对话唯一管理入口；examples / logo 保留 |
