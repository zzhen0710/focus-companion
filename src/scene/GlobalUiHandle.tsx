export default function GlobalUiHandle({ expanded, error, onToggle }: { expanded: boolean; error: string | null; onToggle(): void }) {
  return <>
    <button type="button" className={`scene-handle${error ? ' needs-attention' : ''}`} data-handle
      aria-label={expanded ? 'Hide tools' : 'Show tools'} aria-expanded={expanded} aria-controls="scene-tools"
      aria-describedby={error ? 'scene-attention' : undefined} onClick={onToggle}>
      <span aria-hidden="true"><i className="handle-arrow">‹</i></span>
    </button>
    {error && <span id="scene-attention" className="scene-sr-only">A data error needs attention. Show tools for recovery.</span>}
  </>
}
