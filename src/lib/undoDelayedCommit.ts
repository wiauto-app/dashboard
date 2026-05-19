import { toast } from "sonner";

export type ScheduleUndoDelayedCommitParams = {
  /** Texto del toast (p. ej. mensaje de confirmación pendiente). */
  message: string;
  /** Etiqueta del botón de acción (p. ej. "Deshacer"). */
  undo_label?: string;
  /** Tiempo en ms antes de ejecutar `on_commit` si no se cancela. */
  delay_ms?: number;
  /**
   * Se ejecuta pasado `delay_ms` sin cancelación.
   * Encapsula la petición y el manejo de errores (p. ej. toast.error).
   */
  on_commit: () => void | Promise<void>;
  /** El usuario pulsó "Deshacer". */
  on_cancel?: () => void;
};

const default_undo_label = "Deshacer";
const default_delay_ms = 5000;

/**
 * Toast con acción "Deshacer". Si no se cancela, tras `delay_ms` se ejecuta `on_commit`.
 * Devuelve una función para cancelar (p. ej. nuevo envío o desmontaje).
 */
export const scheduleUndoDelayedCommit = ({
  message,
  undo_label = default_undo_label,
  delay_ms = default_delay_ms,
  on_commit,
  on_cancel,
}: ScheduleUndoDelayedCommitParams): (() => void) => {
  let cancelled = false;
  let committed = false;
  let timer_id = 0;

  const handleCancel = () => {
    if (committed || cancelled) return;
    cancelled = true;
    window.clearTimeout(timer_id);
    toast.dismiss(toast_id);
    on_cancel?.();
  };

  const toast_id = toast(message, {
    duration: delay_ms,
    closeButton: false,
    action: {
      label: undo_label,
      onClick: handleCancel,
    },
  });

  timer_id = window.setTimeout(() => {
    if (cancelled) return;
    committed = true;
    toast.dismiss(toast_id);
    void Promise.resolve(on_commit()).catch(() => {
      /* Errores manejados dentro de on_commit */
    });
  }, delay_ms);

  return handleCancel;
};
