export interface Task {
  id: string
  title: string
  categoryId: string | null
  completed: boolean
  /** Unix timestamp in milliseconds. */
  createdAt: number
  completedAt: number | null
}
