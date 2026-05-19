import {
  scheduleUndoDelayedCommit,
  type ScheduleUndoDelayedCommitParams,
} from "@/lib/undoDelayedCommit";

let pending_cancel: (() => void) | null = null;

/**
 * Un solo undo pendiente para `DefaultForm`: cancela el anterior al programar uno nuevo.
 * Vive fuera del árbol React para que el temporizador siga tras cerrar el diálogo.
 */
export const scheduleDefaultFormUndo = (
  params: ScheduleUndoDelayedCommitParams,
): void => {
  pending_cancel?.();
  const { on_commit, on_cancel, ...rest } = params;
  const slot: { cancel: (() => void) | null } = { cancel: null };
  slot.cancel = scheduleUndoDelayedCommit({
    ...rest,
    on_commit: async () => {
      try {
        await Promise.resolve(on_commit());
      } finally {
        if (pending_cancel === slot.cancel) {
          pending_cancel = null;
        }
      }
    },
    on_cancel: () => {
      if (pending_cancel === slot.cancel) {
        pending_cancel = null;
      }
      on_cancel?.();
    },
  });
  pending_cancel = slot.cancel;
};
