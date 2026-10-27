import { useCallback, useEffect, useState } from "react";
import {
  MODO_DEMO_DISPONIBLE,
  MODO_DEMO_STORAGE_KEY,
  guardarModoDemo,
  leerModoDemo,
} from "../config/demo";

/**
 * Preferencia explícita de modo demostración. Se sincroniza entre pestañas
 * mediante el evento storage y se guarda únicamente en el navegador.
 */
export function useModoDemo() {
  const [modoDemo, setModoDemo] = useState<boolean>(() => leerModoDemo());

  useEffect(() => {
    function sincronizar(evento: StorageEvent) {
      if (evento.key === MODO_DEMO_STORAGE_KEY) {
        setModoDemo(leerModoDemo());
      }
    }

    window.addEventListener("storage", sincronizar);

    return () => {
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const cambiarModoDemo = useCallback((activo: boolean) => {
    if (!MODO_DEMO_DISPONIBLE) {
      return;
    }

    guardarModoDemo(activo);
    setModoDemo(activo);
  }, []);

  return {
    modoDemo: MODO_DEMO_DISPONIBLE && modoDemo,
    cambiarModoDemo,
    demoDisponible: MODO_DEMO_DISPONIBLE,
  };
}
