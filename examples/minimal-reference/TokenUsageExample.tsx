/**
 * 最小参考：仅使用供给层 CSS 变量（由应用入口 @import tokens.css）。
 * 其他项目复制本文件即可对照主色与按钮三态；无需 npm 安装本库。
 */
export function TokenUsageExample() {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--color-text)",
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        maxWidth: "28rem",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-primary)",
        }}
      >
        曙光云 SkillUI · 最小参考
      </p>
      <h1
        style={{
          margin: "var(--space-2) 0",
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
        }}
      >
        主色 #C8161D
      </h1>
      <p
        style={{
          margin: "0 0 var(--space-4)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-relaxed)",
        }}
      >
        本组件不依赖质量层包。令牌来自出口{" "}
        <code
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
        >
          export/sugon-skillui.css → design-skills/brand-kit/tokens.css
        </code>
        。
      </p>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <button
          type="button"
          style={{
            height: "var(--btn-height)",
            paddingInline: "var(--btn-px)",
            borderRadius: "var(--btn-radius)",
            fontSize: "var(--btn-font-size)",
            fontWeight: 600,
            color: "var(--color-primary-foreground)",
            backgroundColor: "var(--color-primary)",
            border: "none",
            cursor: "pointer",
          }}
        >
          主按钮
        </button>
        <button
          type="button"
          style={{
            height: "var(--btn-height)",
            paddingInline: "var(--btn-px)",
            borderRadius: "var(--btn-radius)",
            fontSize: "var(--btn-font-size)",
            fontWeight: 600,
            color: "var(--color-text)",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            cursor: "pointer",
          }}
        >
          次按钮
        </button>
      </div>
    </div>
  );
}
