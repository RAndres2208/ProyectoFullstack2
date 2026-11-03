/**
 * Cliente HTTP compartido por los servicios de SyncPass.
 *
 * Contrato común:
 * - URL base centralizada en VITE_API_URL.
 * - Authorization: Bearer <access_token de Cognito>.
 * - Respuestas envueltas en ApiResponse<T>:
 *   { success, data, message, timestamp }.
 * - DELETE devuelve 204 sin cuerpo: no se intenta leer JSON.
 *
 * El token nunca se registra en consola ni se incluye en mensajes de error.
 */

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string | null;
};

export type TipoErrorApi =
  | "configuracion"
  | "sesion"
  | "permisos"
  | "no-encontrado"
  | "solicitud"
  | "servidor"
  | "red"
  | "tiempo"
  | "respuesta"
  | "cancelado";

export class ErrorApi extends Error {
  readonly tipo: TipoErrorApi;
  readonly status?: number;

  constructor(tipo: TipoErrorApi, mensaje: string, status?: number) {
    super(mensaje);
    this.name = "ErrorApi";
    this.tipo = tipo;
    this.status = status;
  }
}

const TIEMPO_LIMITE_MS = 15000;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function leerApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (typeof apiUrl !== "string" || !apiUrl.trim()) {
    throw new ErrorApi(
      "configuracion",
      "La URL de SyncPass API no está configurada. Revisa VITE_API_URL."
    );
  }

  return apiUrl.replace(/\/$/, "");
}

export function construirUrl(ruta: string): string {
  const base = leerApiUrl();
  const normalizada = ruta.startsWith("/") ? ruta : `/${ruta}`;

  return `${base}${normalizada}`;
}

function errorPorEstado(status: number, contexto: string): ErrorApi {
  if (status === 400) {
    return new ErrorApi(
      "solicitud",
      `La API rechazó los datos enviados para ${contexto}. Revisa los campos e intenta nuevamente.`,
      status
    );
  }

  if (status === 401) {
    return new ErrorApi(
      "sesion",
      "Tu sesión de Cognito expiró o no es válida. Vuelve a iniciar sesión.",
      status
    );
  }

  if (status === 403) {
    return new ErrorApi(
      "permisos",
      `No tienes permisos para ${contexto} con esta cuenta.`,
      status
    );
  }

  if (status === 404) {
    return new ErrorApi(
      "no-encontrado",
      `El recurso solicitado para ${contexto} no existe o la ruta no está disponible.`,
      status
    );
  }

  if (status >= 500) {
    return new ErrorApi(
      "servidor",
      "El servidor de SyncPass tuvo un problema. Intenta nuevamente en unos instantes.",
      status
    );
  }

  return new ErrorApi(
    "servidor",
    `SyncPass API rechazó la solicitud para ${contexto}.`,
    status
  );
}

type OpcionesSolicitud<T> = {
  ruta: string;
  accessToken: string;
  contexto: string;
  metodo?: "GET" | "POST" | "PUT" | "DELETE";
  cuerpo?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  validarData?: (data: unknown) => T;
  /** Algunos endpoints administrativos pueden devolver data null. */
  permitirDataNula?: boolean;
};

async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    return await respuesta.json();
  } catch {
    throw new ErrorApi(
      "respuesta",
      "El servidor respondió con un formato que SyncPass no puede leer."
    );
  }
}

/**
 * Ejecuta una solicitud y devuelve `data` validada.
 * Los errores HTTP y de red se normalizan en ErrorApi.
 */
export async function solicitarApi<T>({
  ruta,
  accessToken,
  contexto,
  metodo = "GET",
  cuerpo,
  signal,
  timeoutMs,
  validarData,
  permitirDataNula = false,
}: OpcionesSolicitud<T>): Promise<T> {
  if (!accessToken.trim()) {
    throw new ErrorApi(
      "sesion",
      "No hay una sesión de Cognito disponible para realizar esta operación."
    );
  }

  const url = construirUrl(ruta);
  const controlador = new AbortController();
  let motivoCancelacion: "tiempo" | "externo" | null = null;

  const temporizador = window.setTimeout(() => {
    motivoCancelacion = "tiempo";
    controlador.abort();
  }, timeoutMs ?? TIEMPO_LIMITE_MS);

  const alCancelar = () => {
    motivoCancelacion = "externo";
    controlador.abort();
  };

  if (signal) {
    if (signal.aborted) {
      alCancelar();
    } else {
      signal.addEventListener("abort", alCancelar, { once: true });
    }
  }

  try {
    const cabeceras: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    };

    if (cuerpo !== undefined) {
      cabeceras["Content-Type"] = "application/json";
    }

    const respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      cache: "no-store",
      signal: controlador.signal,
    });

    if (!respuesta.ok) {
      const errorBase = errorPorEstado(
        respuesta.status,
        contexto
      );

      let mensajeBackend: string | null = null;

      try {
        const errorJson: unknown = await respuesta.json();

        if (esObjeto(errorJson)) {
          const mensaje =
            typeof errorJson.mensaje === "string"
              ? errorJson.mensaje
              : typeof errorJson.message === "string"
                ? errorJson.message
                : null;

          const codigo =
            typeof errorJson.error === "string"
              ? errorJson.error
              : null;

          const detalles = esObjeto(errorJson.detalles)
            ? Object.entries(errorJson.detalles)
                .filter(
                  (entrada): entrada is [string, string] =>
                    typeof entrada[1] === "string"
                )
                .map(([campo, valor]) => `${campo}: ${valor}`)
                .join("; ")
            : "";

          if (mensaje) {
            mensajeBackend = [
              codigo,
              mensaje,
              detalles
            ].filter(Boolean).join(" - ");
          }
        }
      } catch {
        // Mantener mensaje genérico si la respuesta
        // del servidor no contiene JSON válido.
      }

      throw new ErrorApi(
        errorBase.tipo,
        mensajeBackend ?? errorBase.message,
        respuesta.status
      );
    }

    // DELETE responde 204 sin cuerpo: no se interpreta como JSON.
    if (respuesta.status === 204) {
      return undefined as T;
    }

    const json = await leerJson(respuesta);

    if (!esObjeto(json) || json.success !== true) {
      const mensaje =
        esObjeto(json) && typeof json.message === "string"
          ? json.message
          : null;

      throw new ErrorApi(
        "respuesta",
        mensaje ??
          "La respuesta de SyncPass API no cumple el contrato esperado."
      );
    }

    if (json.data === null || json.data === undefined) {
      if (permitirDataNula) {
        return undefined as T;
      }

      throw new ErrorApi(
        "respuesta",
        "SyncPass API respondió correctamente pero no entregó datos."
      );
    }

    return validarData ? validarData(json.data) : (json.data as T);
  } catch (error) {
    if (error instanceof ErrorApi) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      if (motivoCancelacion === "tiempo") {
        throw new ErrorApi(
          "tiempo",
          `La operación de ${contexto} tardó demasiado. Verifica la conexión y vuelve a intentarlo.`
        );
      }

      throw new ErrorApi(
        "cancelado",
        `La operación de ${contexto} fue cancelada.`
      );
    }

    throw new ErrorApi(
      "red",
      "No fue posible conectar con SyncPass. Verifica tu conexión o si el backend está disponible."
    );
  } finally {
    window.clearTimeout(temporizador);

    if (signal) {
      signal.removeEventListener("abort", alCancelar);
    }
  }
}
