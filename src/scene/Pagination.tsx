import { selectedPage } from './pageSelection'
export default function Pagination({ index, count, onChange, label = 'items' }: { index: number; count: number; onChange(index: number): void; label?: string }) {
  const current = selectedPage(index, count)
  return <nav className="bubble-pagination" aria-label={`${label} pages`}>
    <button type="button" aria-label={`Previous ${label}`} disabled={current === 0 || !count} onClick={() => onChange(current - 1)}>Previous</button>
    <span>{count ? current + 1 : 0} / {count}</span>
    <button type="button" aria-label={`Next ${label}`} disabled={!count || current + 1 >= count} onClick={() => onChange(current + 1)}>Next</button>
  </nav>
}
