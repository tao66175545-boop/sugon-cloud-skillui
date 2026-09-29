import { useEffect, useState } from 'react'
import { TopBar } from './components/TopBar'
import { AgentChat } from './components/AgentChat'
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
      </main>
    </>
  )
}
