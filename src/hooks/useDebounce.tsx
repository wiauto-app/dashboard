import { useEffect, useState } from "react";

export const useDebounce = <T,>(value: T, delay = 300): T => {
  const [debounced_value, set_debounced_value] = useState<T>(value);

  useEffect(() => {
    const timeout_id = setTimeout(() => {
      set_debounced_value(value);
    }, delay);
    return () => clearTimeout(timeout_id);
  }, [value, delay]);

  return debounced_value;
};
