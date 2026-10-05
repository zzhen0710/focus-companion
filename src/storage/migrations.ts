import type { AppData, LegacyAppData, V2AppData } from './storage'

/** Input must be validated by the adapter. Preserve records and settings without mutation. */
export function migrateV1ToV2(data: LegacyAppData): V2AppData {
  return { ...data, schemaVersion: 2, timer: { status: 'idle', mode: 'focus' } }
}

export function migrateV2ToV3(data: V2AppData): AppData {
  return { ...data, schemaVersion: 3,
    tasks: data.tasks.map((task) => ({ ...task, content: null, schedule: { kind: 'unscheduled' } })),
    timer: data.timer.status === 'idle' ? data.timer : { ...data.timer, taskId: null, categoryId: null } }
}
