/**
 * Cliente HTTP de proyectos de SyncPass.
 *
 * Contrato confirmado:
 * - GET    {VITE_API_URL}/api/proyectos       (4 roles)
 * - GET    {VITE_API_URL}/api/proyectos/{id}  (4 roles)
 * - POST   {VITE_API_URL}/api/proyectos       (solo Administrador)
 * - PUT    {VITE_API_URL}/api/proyectos/{id}  (solo Administrador)
 * - DELETE {VITE_API_URL}/api/proyectos/{id}  (solo Administrador, 204 sin cuerpo)
 *
 * ProyectoResponse: { id, nombre, descripcion, estado }
 * El backend NO incluye la cantidad de participantes en este DTO.
 *
 * El token nunca se registra en consola ni se incluye en mensajes de error.
 */

import {
  ErrorApi,
  solicitarApi,
  type TipoErrorApi,
} from "./apiClient";

export type ProyectoApi = {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
};

export type EstadoProyectoSolicitud =
  | "ACTIVO"
  | "INACTIVO"
  | "FINALIZADO";

export type ProyectoSolicitud = {
  nombre: string;
  descripcion: string | null;
  estado: EstadoProyectoSolicitud;
};

export type TipoErrorProyectos = TipoErrorApi;

/**
 * Se conserva el nombre ErrorProyectos por compatibilidad con la interfaz
 * y las pruebas existentes. Todos los errores del cliente se convierten a
 * este tipo antes de salir del servicio.
 */
export class ErrorProyectos extends ErrorApi {
  constructor(tipo: TipoErrorProyectos, mensaje: string, status?: number) {
    super(tipo, mensaje, status);
    this.name = "ErrorProyectos";
  }
}

const ESTADOS_VALIDOS: EstadoProyectoSolicitud[] = [
  "ACTIVO",
  "INACTIVO",
  "FINALIZADO",
];

// Evita disparar la misma consulta de listado dos veces mientras está en curso.
// La clave se mantiene solo en memoria, usa una huella y nunca se imprime.
const solicitudesEnCurso = new Map<string, Promise<ProyectoApi[]>>();

export function huellaToken(token: string): string {
  let hash = 0;

  for (let indice = 0; indice < token.length; indice += 1) {
    hash = (hash * 31 + token.charCodeAt(indice)) | 0;
  }

  return `${token.length}-${hash}`;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function validarProyecto(valor: unknown): ProyectoApi {
  if (!esObjeto(valor)) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió un proyecto con un formato inesperado."
    );
  }

  const { id, nombre, descripcion, estado } = valor;

  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
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
    descripcion !== undefined &&
    descripcion !== null &&
    typeof descripcion !== "string"
  ) {
    throw new ErrorProyectos(
      "respuesta",
      "SyncPass API devolvió una descripción de proyecto con un formato inesperado."
    );
  }

  return {
    id,
    nombre: nombre.trim(),
    descripcion:
      typeof descripcion === "string" ? descripcion.trim() || null : null,
    estado: estado.trim(),
  };
}

function validarLista(valor: unknown): ProyectoApi[] {
  if (!Array.isArray(valor)) {
    throw new ErrorProyectos(
      "respuesta",
      "La respuesta de proyectos no contiene un listado válido."
    );
  }

  // El backend podría repetir un identificador; el listado debe ser único.
  const porId = new Map<number, ProyectoApi>();

  for (const proyecto of valor.map(validarProyecto)) {
    if (!porId.has(proyecto.id)) {
      porId.set(proyecto.id, proyecto);
    }
  }

  return Array.from(porId.values());
}

function validarSolicitud(datos: ProyectoSolicitud): ProyectoSolicitud {
  const nombre = datos.nombre.trim();
  const descripcion =
    typeof datos.descripcion === "string"
      ? datos.descripcion.trim() || null
      : null;

  if (!nombre) {
    throw new ErrorProyectos(
      "solicitud",
      "El nombre del proyecto es obligatorio."
    );
  }

  if (!ESTADOS_VALIDOS.includes(datos.estado)) {
    throw new ErrorProyectos(
      "solicitud",
      "El estado del proyecto debe ser ACTIVO, INACTIVO o FINALIZADO."
    );
  }

  return { nombre, descripcion, estado: datos.estado };
}

function comoErrorProyectos(error: unknown): ErrorProyectos {
  if (error instanceof ErrorProyectos) {
    return error;
  }

  if (error instanceof ErrorApi) {
    return new ErrorProyectos(error.tipo, error.message, error.status);
  }

  return new ErrorProyectos(
    "red",
    "No fue posible consultar los proyectos."
  );
}

function validarId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorProyectos(
      "solicitud",
      "El identificador del proyecto debe ser un número entero positivo."
    );
  }
}

type OpcionesConsulta = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function obtenerProyectosApi(
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ProyectoApi[]> {
  const clave = `lista::${accessToken ? huellaToken(accessToken) : "sin-token"}`;

  if (!opciones.signal) {
    const solicitudExistente = solicitudesEnCurso.get(clave);

    if (solicitudExistente) {
      return solicitudExistente;
    }
  }

  let solicitud: Promise<ProyectoApi[]>;

  solicitud = solicitarApi<ProyectoApi[]>({
    ruta: "/api/proyectos",
    accessToken,
    contexto: "consultar los proyectos",
    signal: opciones.signal,
    timeoutMs: opciones.timeoutMs,
    validarData: validarLista,
  })
    .catch((error: unknown) => {
      throw comoErrorProyectos(error);
    })
    .finally(() => {
      if (solicitudesEnCurso.get(clave) === solicitud) {
        solicitudesEnCurso.delete(clave);
      }
    });

  if (!opciones.signal) {
    solicitudesEnCurso.set(clave, solicitud);
  }

  return solicitud;
}

export async function obtenerProyectoApi(
  id: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ProyectoApi> {
  validarId(id);

  try {
    return await solicitarApi<ProyectoApi>({
      ruta: `/api/proyectos/${id}`,
      accessToken,
      contexto: `consultar el proyecto ${id}`,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarProyecto,
    });
  } catch (error) {
    throw comoErrorProyectos(error);
  }
}

export async function crearProyectoApi(
  datos: ProyectoSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ProyectoApi> {
  const cuerpo = validarSolicitud(datos);

  try {
    return await solicitarApi<ProyectoApi>({
      ruta: "/api/proyectos",
      accessToken,
      contexto: "crear el proyecto",
      metodo: "POST",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarProyecto,
    });
  } catch (error) {
    throw comoErrorProyectos(error);
  }
}

export async function actualizarProyectoApi(
  id: number,
  datos: ProyectoSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ProyectoApi> {
  validarId(id);
  const cuerpo = validarSolicitud(datos);

  try {
    return await solicitarApi<ProyectoApi>({
      ruta: `/api/proyectos/${id}`,
      accessToken,
      contexto: `actualizar el proyecto ${id}`,
      metodo: "PUT",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarProyecto,
    });
  } catch (error) {
    throw comoErrorProyectos(error);
  }
}

export async function eliminarProyectoApi(
  id: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<void> {
  validarId(id);

  try {
    // DELETE devuelve 204 sin cuerpo; el cliente no interpreta JSON.
    await solicitarApi<void>({
      ruta: `/api/proyectos/${id}`,
      accessToken,
      contexto: `eliminar el proyecto ${id}`,
      metodo: "DELETE",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      permitirDataNula: true,
    });
  } catch (error) {
    throw comoErrorProyectos(error);
  }
}
