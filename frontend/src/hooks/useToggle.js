import { useCallback, useState } from "react";

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((previous) => !previous);
  }, []);

  const open = useCallback(() => {
    setValue(true);
  }, []);

  const close = useCallback(() => {
    setValue(false);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    setValue,
    toggle,
    open,
    close,
    reset,
    isOpen: value,
    isClosed: !value,
  };
}