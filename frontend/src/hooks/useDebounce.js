import { useState, useEffect } from "react";

// Hook debounce value sau delay ms
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // cleanup khi value thay đổi
    };
  }, [value, delay]);

  return debouncedValue;
}
