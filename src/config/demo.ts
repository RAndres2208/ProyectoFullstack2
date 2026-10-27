/**
 * Configuración del modo demostración de SyncPass.
 *
 * El modo demostración nunca se activa solo: el valor inicial es
 * "desactivado" y la persona debe activarlo desde la interfaz. Se puede
 * retirar por completo de la build definiendo VITE_ENABLE_DEMO_MODE=false.
 */

export const MODO_DEMO_STORAGE_KEY = "syncpass.modo-demo";

const valorConfigurado = import.meta.env.VITE_ENABLE_DEMO_MODE;

export const MODO_DEMO_DISPONIBLE = valorConfigurado !== "false";

export function leerModoDemo(): boolean {
  if (!MODO_DEMO_DISPONIBLE) {
    return false;
  }

  try {
    return window.localStorage.getItem(MODO_DEMO_STORAGE_KEY) === "true";
  } catch {
    // El navegador puede bloquear localStorage en contextos privados.
    return false;
  }
}

export function guardarModoDemo(activo: boolean): void {
  if (!MODO_DEMO_DISPONIBLE) {
    return;
  }

  try {
    window.localStorage.setItem(
      MODO_DEMO_STORAGE_KEY,
      activo ? "true" : "false"
    );
  } catch {
    // La preferencia no se persiste, pero la sesión actual sigue funcionando.
  }
}
