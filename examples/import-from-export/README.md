# import-from-export — package exports 引用注释

本目录**不是**第二个产品 UI，只展示如何按 `package.json` `exports` 注释式引用本库出口。

前置：已 clone 本仓，或 `npm i ../path-to/sugon-skillui`（`file:` / 相对 path）。本仓 `private: true`，默认不发布到公网 registry。

## 对照表

| 写法 | 解析到 |
|------|--------|
| `sugon-skillui` / `sugon-skillui/css` | `export/sugon-skillui.css` |
| `sugon-skillui/tokens` | `design-skills/brand-kit/tokens.css` |
| `sugon-skillui/manifest` | `export/manifest.json` |

本地相对路径仍可用（不依赖 exports）：

```css
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
```

详见 [`export/CONSUME.md`](../../export/CONSUME.md)。

## 文件

- [`consumer.css`](./consumer.css) — 可粘贴到 Vite/CSS 入口的注释 + 示例规则
