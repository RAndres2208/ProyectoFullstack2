import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Representa el estado de carga mientras se actualiza una vista de
 * demostración. Los datos siguen siendo locales: no se consulta la API.
 */
export function useRecargaDemo(demora = 350) {
  const [cargando, setCargando] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }
    };
  }, []);

  const recargar = useCallback(
    (alTerminar?: () => void) => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }

      setCargando(true);

      temporizador.current = window.setTimeout(() => {
        setCargando(false);
        alTerminar?.();
      }, demora);
    },
    [demora]
  );

  return { cargando, recargar };
}
