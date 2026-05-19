import { useCallback, useEffect, useRef } from "react";
import {
  scheduleUndoDelayedCommit,
  type ScheduleUndoDelayedCommitParams,
} from "@/lib/undoDelayedCommit";

/**
 * Envuelve {@link scheduleUndoDelayedCommit} con cancelación al desmontar
 * y al programar una nueva acción (solo una pendiente a la vez).
 */
export const useUndoDelayedCommit = () => {
  const cancel_ref = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cancel_ref.current?.();
      cancel_ref.current = null;
    };
  }, []);

  const schedule = useCallback((params: ScheduleUndoDelayedCommitParams) => {
    cancel_ref.current?.();
    cancel_ref.current = scheduleUndoDelayedCommit(params);
    return cancel_ref.current;
  }, []);

  const cancel = useCallback(() => {
    cancel_ref.current?.();
    cancel_ref.current = null;
  }, []);

  return { schedule, cancel };
};
