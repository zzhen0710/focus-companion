/** A completed focus record. Active timer state belongs to v0.2. */
export interface FocusSession {
  id: string
  taskId: string | null
  categoryId: string | null
  /** Unix timestamps in milliseconds. */
  startedAt: number
  endedAt: number
  durationSeconds: number
}
