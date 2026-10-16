import { useEffect, useState } from 'react'
import { TopBar } from './components/TopBar'
import { AgentChat } from './components/AgentChat'
import { Playground } from './playground/Playground'
import { PptSkill } from './ppt-skill/PptSkill'
import { loadSkills, type Skill } from './lib/skills'

export type AppTab = 'playground' | 'agent' | 'ppt-skill'

export default function App() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [tab, setTab] = useState<AppTab>('playground')

  useEffect(() => {
    setSkills(loadSkills())
  }, [])

  return (
    <>
      <TopBar skillCount={skills.length} tab={tab} onTabChange={setTab} />
      <main>
        {tab === 'playground' ? (
          <Playground />
        ) : tab === 'ppt-skill' ? (
          <PptSkill />
        ) : (
          <AgentChat skills={skills} onSkillsChanged={setSkills} />
        )}
      </main>
    </>
  )
}
