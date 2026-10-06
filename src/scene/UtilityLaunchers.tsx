import { utilityTools } from '../experience/utilityState'
import type { UtilityTool } from '../experience/utilityState'
import { toolLabels } from './scenePresentation'
const paths = { focus: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l8-8', tasks: 'M4 5h16v15H4ZM8 11l3 3 6-7', review: 'M5 6a8 8 0 1 1-1 10M5 2v5H1M12 7v5l3 2', history: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 7v5l-3 3', insights: 'M4 20V12h4v8M10 20V4h4v16M16 20V8h4v12' }
export default function UtilityLaunchers({ opened, pendingReview, onActivate }: { opened: (UtilityTool | null)[]; pendingReview: number | null; onActivate(tool: UtilityTool): void }) {
  return <nav className="scene-launchers" aria-label="Utilities">
    {utilityTools.map((tool) => <button type="button" key={tool} data-launcher={tool} aria-pressed={opened.includes(tool)}
      aria-label={toolLabels[tool]} title={toolLabels[tool]} onClick={() => onActivate(tool)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[tool]} /></svg><span className="launcher-label" aria-hidden="true">{toolLabels[tool]}</span>
      {tool === 'review' && pendingReview !== null && pendingReview > 0 && <span className="launcher-pending" aria-label={`${pendingReview} pending tasks`}>•</span>}
    </button>)}
  </nav>
}
