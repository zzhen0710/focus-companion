import { createLocalStorageAdapter } from '../storage/localStorageAdapter'
import { createTimerController } from '../features/focus/timerController'
import { createTaskService } from '../features/tasks/taskService'

const storage = createLocalStorageAdapter()
// Timer bootstrap saves defaults/migrations and applies cold recovery once.
export const timerController = createTimerController(storage)
export const taskService = createTaskService(storage)

export function retryStorage() {
  timerController.retry()
  taskService.reload()
}
