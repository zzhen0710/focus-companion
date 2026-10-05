import type { AppData, LegacyAppData } from './storage'

/** Input must be validated by the adapter. Preserve records and settings without mutation. */
export function migrateV1ToV2(data: LegacyAppData): AppData {
  return { ...data, schemaVersion: 2, timer: { status: 'idle', mode: 'focus' } }
}
