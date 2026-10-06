import { attachReadRefresh } from './readRefresh'

/** Read-only freshness; callers supply read services, never Review workflow reload. */
export function attachApplicationReads(history: { reload(): void }, insights: { reload(): void },
  doc: Parameters<typeof attachReadRefresh>[1], win: Parameters<typeof attachReadRefresh>[2]) {
  const reload = () => { history.reload(); insights.reload() }
  reload()
  return attachReadRefresh(reload, doc, win)
}
