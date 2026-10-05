import { createLocalStorageAdapter } from '../storage/localStorageAdapter'
import { createTimerController } from '../features/focus/timerController'
import { createTaskService } from '../features/tasks/taskService'
import { createReviewService } from '../features/review/reviewService'
import { createHistoryService } from '../features/history/historyService'
import type { AppStorage } from '../storage/storage'

const adapter = createLocalStorageAdapter()
let refresh: () => void = () => {}
const storage: AppStorage = { load: adapter.load, save(data) {
  const result = adapter.save(data)
  if (result.status === 'saved') refresh()
  return result
} }
// Timer bootstrap saves defaults/migrations and applies cold recovery once.
export const timerController = createTimerController(storage)
export const taskService = createTaskService(storage)
export const reviewService = createReviewService(storage)
export const historyService = createHistoryService(storage)

let refreshing = false
refresh = () => {
  if (refreshing) return
  refreshing = true
  try { taskService.reload(); reviewService.reload(); historyService.reload() }
  finally { refreshing = false }
}

export function retryStorage() {
  timerController.retry()
  taskService.reload()
  reviewService.reload()
  historyService.reload()
}
