import { useEffect, useState } from "react";

// Adia a atualização do valor até parar de mudar por `delayMs` — usado no
// campo de busca pra não disparar uma requisição a cada tecla digitada.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
