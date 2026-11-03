/** Integración real de asistencia. Sin datos ficticios y sin exponer el token. */
import { solicitarApi, ErrorApi } from "./apiClient";
import type { EstadoAsistencia, RegistroAsistencia, AsistenciaSesionSolicitud } from "../types/academico";

export type AsistenciaApi = {
  id: number;
  cursoId: number;
  estudianteId: string;
  fecha: string;
  estado: "PRESENTE" | "ATRASADO" | "AUSENTE";
  registradoEn: string;
  origen: string;
};

const estadosApi = ["PRESENTE", "ATRASADO", "AUSENTE"] as const;
const aApi: Record<EstadoAsistencia, AsistenciaApi["estado"]> = {
  Presente: "PRESENTE", Atrasado: "ATRASADO", Ausente: "AUSENTE",
};
const aVista: Record<AsistenciaApi["estado"], EstadoAsistencia> = {
  PRESENTE: "Presente", ATRASADO: "Atrasado", AUSENTE: "Ausente",
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}
function idCurso(id: string): number {
  const numero = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(numero) || numero <= 0) {
    throw new ErrorApi("solicitud", "El identificador del curso no es válido.");
  }
  return numero;
}
function fechaValida(fecha: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(`${fecha}T00:00:00Z`))) {
    throw new ErrorApi("solicitud", "La fecha de asistencia no es válida.");
  }
}
function validarRegistro(dato: unknown): AsistenciaApi {
  if (!esObjeto(dato) ||
      typeof dato.id !== "number" || !Number.isSafeInteger(dato.id) || dato.id <= 0 ||
      typeof dato.cursoId !== "number" || !Number.isSafeInteger(dato.cursoId) || dato.cursoId <= 0 ||
      typeof dato.estudianteId !== "string" || !dato.estudianteId.trim() ||
      typeof dato.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dato.fecha) ||
      typeof dato.estado !== "string" || !estadosApi.includes(dato.estado as AsistenciaApi["estado"]) ||
      typeof dato.registradoEn !== "string" || !dato.registradoEn ||
      typeof dato.origen !== "string") {
    throw new ErrorApi("respuesta", "La API devolvió un registro de asistencia inválido.");
  }
  return dato as AsistenciaApi;
}
function validarLista(datos: unknown): AsistenciaApi[] {
  if (!Array.isArray(datos)) {
    throw new ErrorApi("respuesta", "La API no devolvió una lista de asistencias.");
  }
  return datos.map(validarRegistro);
}

export function asistenciaApiARegistro(dato: AsistenciaApi): RegistroAsistencia {
  return {
    id: String(dato.id), cursoId: String(dato.cursoId),
    estudianteId: dato.estudianteId, fecha: dato.fecha,
    estado: aVista[dato.estado], registradoEn: dato.registradoEn,
    origen: "api",
  };
}

export async function consultarAsistenciaCursoApi(
  cursoId: string, fecha: string, token: string
): Promise<RegistroAsistencia[]> {
  const id = idCurso(cursoId);
  fechaValida(fecha);
  const datos = await solicitarApi<AsistenciaApi[]>({
    ruta: `/api/asistencias?cursoId=${id}&fecha=${encodeURIComponent(fecha)}`,
    accessToken: token, contexto: "consultar la asistencia del curso",
    validarData: validarLista,
  });
  return datos.map(asistenciaApiARegistro);
}

export async function guardarSesionAsistenciaApi(
  solicitud: AsistenciaSesionSolicitud, token: string
): Promise<RegistroAsistencia[]> {
  const cursoId = idCurso(solicitud.cursoId);
  fechaValida(solicitud.fecha);
  if (solicitud.registros.length === 0) {
    throw new ErrorApi("solicitud", "La sesión no tiene estudiantes para registrar.");
  }
  const ids = new Set<string>();
  const registros = solicitud.registros.map((r) => {
    const estudianteId = r.estudianteId.trim();
    if (!estudianteId || ids.has(estudianteId) || !(r.estado in aApi)) {
      throw new ErrorApi("solicitud", "La sesión tiene registros inválidos o estudiantes repetidos.");
    }
    ids.add(estudianteId);
    return { estudianteId, estado: aApi[r.estado] };
  });
  const datos = await solicitarApi<AsistenciaApi[]>({
    ruta: "/api/asistencias/sesiones", metodo: "POST", accessToken: token,
    contexto: "guardar la sesión de asistencia",
    cuerpo: { cursoId, fecha: solicitud.fecha, registros },
    validarData: validarLista,
  });
  return datos.map(asistenciaApiARegistro);
}

export async function historialAsistenciaEstudianteApi(
  estudianteSub: string, token: string
): Promise<RegistroAsistencia[]> {
  if (!estudianteSub.trim()) {
    throw new ErrorApi("sesion", "La sesión de Cognito no contiene un identificador de estudiante.");
  }
  const datos = await solicitarApi<AsistenciaApi[]>({
    ruta: `/api/asistencias/estudiante/${encodeURIComponent(estudianteSub)}`,
    accessToken: token, contexto: "consultar tu historial de asistencia",
    validarData: validarLista,
  });
  return datos.map(asistenciaApiARegistro);
}
