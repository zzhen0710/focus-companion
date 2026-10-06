import type { MessageKey } from '../experience/messages'
import { useRef } from 'react'
import { useReducedMotion, useVisibilityMotion } from './motion'
export default function CompanionMessageStrip({ message, collapsed, onToggle }: {
  message: { key: MessageKey; text: string } | null; collapsed: boolean; onToggle(): void
}) {
  const text = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  useVisibilityMotion(text, !!message && !collapsed, reduced)
  if (!message) return null
  return <aside className="companion-message" aria-label="Companion message" data-message-strip>
    <p ref={text} id="companion-current-message" aria-hidden={collapsed} data-visible={!collapsed}>{message.text}</p>
    <button type="button" aria-label={collapsed ? 'Show companion message' : 'Hide companion message'}
      aria-expanded={!collapsed} aria-controls="companion-current-message" onClick={onToggle}><span className="handle-arrow" aria-hidden="true">‹</span></button>
  </aside>
}
