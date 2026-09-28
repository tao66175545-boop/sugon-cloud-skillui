# -*- coding: utf-8 -*-
from pathlib import Path

app = """import { useEffect, useState } from 'react'
import { TopBar } from './components/TopBar'
import { AgentChat } from './components/AgentChat'
import { ExampleSection } from './components/ExampleSection'
import { loadSkills, type Skill } from './lib/skills'

export default function App() {
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    setSkills(loadSkills())
  }, [])

  return (
    <>
      <TopBar skillCount={skills.length} />
      <main>
        <AgentChat skills={skills} onSkillsChanged={setSkills} />
        <ExampleSection />
      </main>
    </>
  )
}
"""
Path(r"F:\GrokBot\test02\src\App.tsx").write_text(app, encoding="utf-8")
print("App.tsx updated")

path = Path(r"F:\GrokBot\test02\src\components\AgentChat.tsx")
t = path.read_text(encoding="utf-8")

helper = """
const CLARIFY_LINE =
  '意图不太明确。请选一项继续：学链接（贴 URL）/ 看图（上传或贴图）/ 归库（确认草稿）/ 查库（说「看库」或「选用某某」）。'

function isAmbiguousIntent(text: string, hasImg: boolean, hasUrl: boolean): boolean {
  if (hasImg || hasUrl) return false
  const t = text.trim()
  if (!t) return false
  if (t.length > 36) return false
  if (/看库|查库|浏览库|选用|选择|归库|学链接|看图|导出|对外输出|起草|摘要|skill|http|贴链|链接|图片|设计|颜色|字体|token|路径/i.test(t)) {
    return false
  }
  if (/^(帮我|你好|在吗|嗯|好的|继续|？|\\?|做一下|弄一下)+$/i.test(t)) return true
  if (t.length <= 10) return true
  return false
}

"""

if "CLARIFY_LINE" not in t:
    anchor = "export function AgentChat({"
    if anchor not in t:
        raise SystemExit("anchor missing")
    t = t.replace(anchor, helper + anchor, 1)
    print("inserted clarify helpers")
else:
    print("clarify helpers already present")

old = """    if (text && !img && !urlForLearn) {
      const handled = await tryLocalLibraryIntent(text)
      if (handled) {
        setInput('')
        return
      }
    }

    if (!keyed) {"""

new = """    if (text && !img && !urlForLearn) {
      const handled = await tryLocalLibraryIntent(text)
      if (handled) {
        setInput('')
        return
      }
    }

    if (isAmbiguousIntent(text, !!img, !!urlForLearn)) {
      pushBubble({ role: 'user', text: text || '（空）' })
      setInput('')
      pushBubble({ role: 'assistant', text: CLARIFY_LINE })
      return
    }

    if (!keyed) {"""

if "pushBubble({ role: 'assistant', text: CLARIFY_LINE })" in t:
    print("clarify branch already present")
elif old in t:
    t = t.replace(old, new, 1)
    print("injected clarify branch")
else:
    print("WARN: handleSend block not found")
    # show nearby
    idx = t.find("tryLocalLibraryIntent")
    print(repr(t[idx:idx+350]))

t = t.replace("上方一览会更新；刷新后仍在。", "可在对话说「看库」查看；刷新后仍在。")
t = t.replace(
    'placeholder="例如：根据链接起草 Skill 并归库；或：理解图片主色…"',
    'placeholder="例如：看库 / 选用 brand-kit / 贴 URL 学链接 / 描述 Skill 归库…"',
)

path.write_text(t, encoding="utf-8")
print("done", len(t), "CLARIFY", "CLARIFY_LINE" in t, "call", "isAmbiguousIntent(text" in t)
