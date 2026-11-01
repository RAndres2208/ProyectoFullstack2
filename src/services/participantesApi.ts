/**
 * Cliente HTTP de participantes de SyncPass.
 *
 * Todos los endpoints requieren el rol Administrador en el backend:
 * - GET    /api/participantes
 * - GET    /api/participantes?proyectoId={id}
 * - GET    /api/participantes/{id}
 * - POST   /api/participantes
 * - PUT    /api/participantes/{id}
 * - DELETE /api/participantes/{id}  (204 sin cuerpo)
 *
 * DTO: { id, nombre, email, proyectoId }
 */

import {
  ErrorApi,
  solicitarApi,
  type TipoErrorApi,
} from "./apiClient";

export type ParticipanteApi = {
  id: number;
  nombre: string;
  email: string;
  proyectoId: number;
};

export type ParticipanteSolicitud = {
  nombre: string;
  email: string;
  proyectoId: number;
};

export type TipoErrorParticipantes = TipoErrorApi;

export class ErrorParticipantes extends ErrorApi {
  constructor(
    tipo: TipoErrorParticipantes,
    mensaje: string,
    status?: number
  ) {
    super(tipo, mensaje, status);
    this.name = "ErrorParticipantes";
  }
}

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function validarParticipante(valor: unknown): ParticipanteApi {
  if (!esObjeto(valor)) {
    throw new ErrorParticipantes(
      "respuesta",
      "SyncPass API devolvió un participante con un formato inesperado."
    );
  }

  const { id, nombre, email, proyectoId } = valor;

  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new ErrorParticipantes(
      "respuesta",
      "SyncPass API devolvió un participante sin un identificador numérico válido."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ErrorParticipantes(
      "respuesta",
      "SyncPass API devolvió un participante sin nombre."
    );
  }

  if (typeof email !== "string" || !PATRON_EMAIL.test(email.trim())) {
    throw new ErrorParticipantes(
      "respuesta",
      "SyncPass API devolvió un participante con un correo inválido."
    );
  }

  if (
    typeof proyectoId !== "number" ||
    !Number.isInteger(proyectoId) ||
    proyectoId <= 0
  ) {
    throw new ErrorParticipantes(
      "respuesta",
      "SyncPass API devolvió un participante sin un proyecto válido."
    );
  }

  return {
    id,
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    proyectoId,
  };
}

function validarLista(valor: unknown): ParticipanteApi[] {
  if (!Array.isArray(valor)) {
    throw new ErrorParticipantes(
      "respuesta",
      "La respuesta de participantes no contiene un listado válido."
    );
  }

  const porId = new Map<number, ParticipanteApi>();

  for (const participante of valor.map(validarParticipante)) {
    if (!porId.has(participante.id)) {
      porId.set(participante.id, participante);
    }
  }

  return Array.from(porId.values());
}

export function validarSolicitudParticipante(
  datos: ParticipanteSolicitud
): ParticipanteSolicitud {
  const nombre = datos.nombre.trim();
  const email = datos.email.trim().toLowerCase();

  if (nombre.length < 3) {
    throw new ErrorParticipantes(
      "solicitud",
      "El nombre del participante debe tener al menos 3 caracteres."
    );
  }

  if (!PATRON_EMAIL.test(email)) {
    throw new ErrorParticipantes(
      "solicitud",
      "El correo electrónico del participante no es válido."
    );
  }

  if (
    !Number.isInteger(datos.proyectoId) ||
    datos.proyectoId <= 0
  ) {
    throw new ErrorParticipantes(
      "solicitud",
      "Selecciona un proyecto válido para el participante."
    );
  }

  return { nombre, email, proyectoId: datos.proyectoId };
}

function validarId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorParticipantes(
      "solicitud",
      "El identificador del participante debe ser un número entero positivo."
    );
  }
}

function comoErrorParticipantes(error: unknown): ErrorParticipantes {
  if (error instanceof ErrorParticipantes) {
    return error;
  }

  if (error instanceof ErrorApi) {
    return new ErrorParticipantes(error.tipo, error.message, error.status);
  }

  return new ErrorParticipantes(
    "red",
    "No fue posible consultar los participantes."
  );
}

type OpcionesConsulta = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

type OpcionesListado = OpcionesConsulta & {
  proyectoId?: number;
};

export async function listarParticipantesApi(
  accessToken: string,
  opciones: OpcionesListado = {}
): Promise<ParticipanteApi[]> {
  if (
    opciones.proyectoId !== undefined &&
    (!Number.isInteger(opciones.proyectoId) || opciones.proyectoId <= 0)
  ) {
    throw new ErrorParticipantes(
      "solicitud",
      "El identificador del proyecto debe ser un número entero positivo."
    );
  }

  const consulta =
    opciones.proyectoId !== undefined
      ? `?proyectoId=${opciones.proyectoId}`
      : "";

  try {
    return await solicitarApi<ParticipanteApi[]>({
      ruta: `/api/participantes${consulta}`,
      accessToken,
      contexto: "consultar los participantes",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarLista,
    });
  } catch (error) {
    throw comoErrorParticipantes(error);
  }
}

export async function obtenerParticipanteApi(
  id: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ParticipanteApi> {
  validarId(id);

  try {
    return await solicitarApi<ParticipanteApi>({
      ruta: `/api/participantes/${id}`,
      accessToken,
      contexto: `consultar el participante ${id}`,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarParticipante,
    });
  } catch (error) {
    throw comoErrorParticipantes(error);
  }
}

export async function crearParticipanteApi(
  datos: ParticipanteSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ParticipanteApi> {
  const cuerpo = validarSolicitudParticipante(datos);

  try {
    return await solicitarApi<ParticipanteApi>({
      ruta: "/api/participantes",
      accessToken,
      contexto: "crear el participante",
      metodo: "POST",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarParticipante,
    });
  } catch (error) {
    throw comoErrorParticipantes(error);
  }
}

export async function actualizarParticipanteApi(
  id: number,
  datos: ParticipanteSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ParticipanteApi> {
  validarId(id);
  const cuerpo = validarSolicitudParticipante(datos);

  try {
    return await solicitarApi<ParticipanteApi>({
      ruta: `/api/participantes/${id}`,
      accessToken,
      contexto: `actualizar el participante ${id}`,
      metodo: "PUT",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarParticipante,
    });
  } catch (error) {
    throw comoErrorParticipantes(error);
  }
}

export async function eliminarParticipanteApi(
  id: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<void> {
  validarId(id);

  try {
    // DELETE devuelve 204 sin cuerpo; el cliente no interpreta JSON.
    await solicitarApi<void>({
      ruta: `/api/participantes/${id}`,
      accessToken,
      contexto: `eliminar el participante ${id}`,
      metodo: "DELETE",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      permitirDataNula: true,
    });
  } catch (error) {
    throw comoErrorParticipantes(error);
  }
}
