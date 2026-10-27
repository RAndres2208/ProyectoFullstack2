/**
 * Cliente HTTP del listado de proyectos de SyncPass.
 *
 * Contrato confirmado:
 * GET {VITE_API_URL}/api/proyectos
 * Authorization: Bearer <access_token de Cognito>
 *
 * El token nunca se registra en consola ni se incluye en mensajes de error.
 */

export type ProyectoApi = {
  id: number;
  nombre: string;
  estado: string;
  participantes: number;
};

export type TipoErrorProyectos =
  | "configuracion"
  | "sesion"
  | "permisos"
  | "no-encontrado"
  | "servidor"
  | "red"
  | "tiempo"
  | "respuesta"
  | "cancelado";

export class ErrorProyectos extends Error {
  readonly tipo: TipoErrorProyectos;
  readonly status?: number;

  constructor(
    tipo: TipoErrorProyectos,
    mensaje: string,
    status?: number
  ) {
    super(mensaje);
    this.name = "ErrorProyectos";
    this.tipo = tipo;
    this.status = status;
  }
}

const TIEMPO_LIMITE_MS = 15000;

// Evita disparar la misma consulta dos veces mientras está en curso.
// La clave se mantiene solo en memoria, usa una huella y nunca se imprime.
const solicitudesEnCurso = new Map<
  string,
  Promise<ProyectoApi[]>
>();

export function huellaToken(token: string): string {
  let hash = 0;

  for (let indice = 0; indice < token.length; indice += 1) {
    hash = (hash * 31 + token.charCodeAt(indice)) | 0;
  }

  return `${token.length}-${hash}`;
}

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function validarProyecto(valor: unknown): ProyectoApi {
  if (!esObjeto(valor)) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió un proyecto con un formato inesperado."
    );
  }

  const { id, nombre, estado, participantes } = valor;

  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió un proyecto sin un identificador numérico válido."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió un proyecto sin nombre."
    );
  }

  if (typeof estado !== "string" || !estado.trim()) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió un proyecto sin estado."
    );
  }

  if (
    typeof participantes !== "number" ||
    !Number.isFinite(participantes) ||
    participantes < 0
  ) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió una cantidad de participantes inválida."
    );
  }

  return {
    id,
    nombre: nombre.trim(),
    estado: estado.trim(),
    participantes,
  };
}

function normalizarLista(proyectos: ProyectoApi[]): ProyectoApi[] {
  // El backend podría repetir un identificador; el listado debe ser único.
  const porId = new Map<number, ProyectoApi>();

  for (const proyecto of proyectos) {
    if (!porId.has(proyecto.id)) {
      porId.set(proyecto.id, proyecto);
    }
  }

  return Array.from(porId.values());
}

function errorPorEstado(status: number): ErrorProyectos {
  if (status === 401) {
    return new ErrorProyectos(
      "sesion",
      "Tu sesión de Cognito expiró o no es válida. Vuelve a iniciar sesión para consultar los proyectos.",
      status
    );
  }

  if (status === 403) {
    return new ErrorProyectos(
      "permisos",
      "No tienes permisos para consultar los proyectos con esta cuenta.",
      status
    );
  }

  if (status === 404) {
    return new ErrorProyectos(
      "no-encontrado",
      "El servicio de proyectos no está disponible en la ruta configurada.",
      status
    );
  }

  if (status >= 500) {
    return new ErrorProyectos(
      "servidor",
      "El servidor de SyncPass tuvo un problema. Intenta nuevamente en unos instantes.",
      status
    );
  }

  return new ErrorProyectos(
    "servidor",
    "SyncPass API rechazó la consulta de proyectos.",
    status
  );
}

async function ejecutarSolicitud(
  url: string,
  accessToken: string,
  opciones: {
    signal?: AbortSignal;
    timeoutMs?: number;
  }
): Promise<ProyectoApi[]> {
  const controlador = new AbortController();
  let motivoCancelacion: "tiempo" | "externo" | null = null;

  const temporizador = window.setTimeout(() => {
    motivoCancelacion = "tiempo";
    controlador.abort();
  }, opciones.timeoutMs ?? TIEMPO_LIMITE_MS);

  const alCancelar = () => {
    motivoCancelacion = "externo";
    controlador.abort();
  };

  if (opciones.signal) {
    if (opciones.signal.aborted) {
      alCancelar();
    } else {
      opciones.signal.addEventListener("abort", alCancelar, {
        once: true,
      });
    }
  }

  try {
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controlador.signal,
    });

    if (!respuesta.ok) {
      throw errorPorEstado(respuesta.status);
    }

    let json: unknown;

    try {
      json = await respuesta.json();
    } catch {
      throw new ErrorProyectos(
        "respuesta",
        "El servidor respondió con un formato que SyncPass no puede leer."
      );
    }

    if (
      !esObjeto(json) ||
      json.success !== true ||
      !Array.isArray(json.data)
    ) {
      throw new ErrorProyectos(
        "respuesta",
        "La respuesta de SyncPass API no cumple el contrato esperado."
      );
    }

    return normalizarLista(json.data.map(validarProyecto));
  } catch (error) {
    if (error instanceof ErrorProyectos) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      if (motivoCancelacion === "tiempo") {
        throw new ErrorProyectos(
          "tiempo",
          "La consulta de proyectos tardó demasiado. Verifica la conexión y vuelve a intentarlo."
        );
      }

      throw new ErrorProyectos(
        "cancelado",
        "La consulta de proyectos fue cancelada."
      );
    }

    throw new ErrorProyectos(
      "red",
      "No fue posible conectar con SyncPass. Verifica tu conexión o si el backend está disponible."
    );
  } finally {
    window.clearTimeout(temporizador);

    if (opciones.signal) {
      opciones.signal.removeEventListener("abort", alCancelar);
    }
  }
}

export async function obtenerProyectosApi(
  accessToken: string,
  opciones: {
    signal?: AbortSignal;
    timeoutMs?: number;
  } = {}
): Promise<ProyectoApi[]> {
  if (!accessToken.trim()) {
    throw new ErrorProyectos(
      "sesion",
      "No hay una sesión de Cognito disponible para consultar los proyectos."
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (typeof apiUrl !== "string" || !apiUrl.trim()) {
    throw new ErrorProyectos(
      "configuracion",
      "La URL de SyncPass API no está configurada. Revisa VITE_API_URL."
    );
  }

  const url = `${apiUrl.replace(/\/$/, "")}/api/proyectos`;
  const clave = `${url}::${huellaToken(accessToken)}`;

  if (!opciones.signal) {
    const solicitudExistente = solicitudesEnCurso.get(clave);

    if (solicitudExistente) {
      return solicitudExistente;
    }
  }

  let solicitud: Promise<ProyectoApi[]>;

  solicitud = ejecutarSolicitud(url, accessToken, opciones).finally(
    () => {
      if (solicitudesEnCurso.get(clave) === solicitud) {
        solicitudesEnCurso.delete(clave);
      }
    }
  );

  if (!opciones.signal) {
    solicitudesEnCurso.set(clave, solicitud);
  }

  return solicitud;
}
