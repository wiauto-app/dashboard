/**
 * Flujo de confirmación diferida con Sonner (toast + "Deshacer").
 *
 * - Uso imperativo: `scheduleUndoDelayedCommit` en `@/lib/undoDelayedCommit`
 * - En React: `useUndoDelayedCommit` en `@/hooks/useUndoDelayedCommit`
 */
export {
  scheduleUndoDelayedCommit,
  type ScheduleUndoDelayedCommitParams,
} from "@/lib/undoDelayedCommit";
export { useUndoDelayedCommit } from "@/hooks/useUndoDelayedCommit";
