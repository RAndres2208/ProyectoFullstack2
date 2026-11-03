/**
 * Cliente HTTP de cursos, docentes, estudiantes y matrículas de SyncPass.
 *
 * Contrato confirmado con el backend:
 * - GET    {VITE_API_URL}/api/cursos                     (4 roles)
 * - GET    {VITE_API_URL}/api/cursos/{id}                (4 roles)
 * - POST   {VITE_API_URL}/api/cursos                     (Coordinador/Administrador)
 * - PUT    {VITE_API_URL}/api/cursos/{id}                (Coordinador/Administrador)
 * - PUT    {VITE_API_URL}/api/cursos/{id}/docente        (Coordinador/Administrador)
 * - GET    {VITE_API_URL}/api/docentes                   (Profesor/Coordinador/Administrador)
 * - GET    {VITE_API_URL}/api/estudiantes                (Profesor/Coordinador/Administrador)
 * - GET    {VITE_API_URL}/api/cursos/{cursoId}/estudiantes
 * - POST   {VITE_API_URL}/api/cursos/{cursoId}/estudiantes   (204 sin cuerpo)
 * - DELETE {VITE_API_URL}/api/cursos/{cursoId}/estudiantes/{estudianteId}
 * - GET    {VITE_API_URL}/api/cursos/estudiante/{estudianteId}
 *
 * CursoResponse:
 *   { id, codigo, nombre, descripcion, docente, docenteId, estado, estudiantes }
 * DocenteResponse:
 *   { id, nombre, email }
 * EstudianteResponse:
 *   { id, nombre, email, carrera }  // email y carrera pueden ser null
 * InscripcionRequest:
 *   { estudianteId }
 *
 * El backend NO publica DELETE /api/cursos/{id}. Por eso este cliente no
 * ofrece eliminación de cursos.
 *
 * El token nunca se registra en consola ni se incluye en mensajes de error.
 */

import {
  ErrorApi,
  solicitarApi,
  type TipoErrorApi,
} from "./apiClient";
import { huellaToken } from "./proyectosApi";
import {
  ESTADOS_CURSO,
  type Curso,
  type CursoSolicitud,
  type DocenteAcademico,
  type EstudianteAcademico,
  type EstadoCurso,
} from "../types/academico";

export type CursoApi = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  docente: string;
  docenteId: string | null;
  estado: EstadoCurso;
  estudiantes: number;
};

export type DocenteApi = {
  id: string;
  nombre: string;
  email: string;
};

export type EstudianteApi = {
  id: string;
  nombre: string;
  email: string | null;
  carrera: string | null;
};

export type CursoApiSolicitud = {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoCurso;
  docenteId: string | null;
};

export type TipoErrorAcademico = TipoErrorApi;

/**
 * Error propio del módulo académico. Conserva el tipo y el status HTTP para
 * que las pantallas puedan mostrar mensajes claros sin exponer el token.
 */
export class ErrorAcademico extends ErrorApi {
  constructor(tipo: TipoErrorAcademico, mensaje: string, status?: number) {
    super(tipo, mensaje, status);
    this.name = "ErrorAcademico";
  }
}

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Evita repetir el mismo listado mientras la consulta está en curso.
// La clave usa una huella del token, nunca el token completo.
const cursosEnCurso = new Map<string, Promise<CursoApi[]>>();
const docentesEnCurso = new Map<string, Promise<DocenteApi[]>>();
const estudiantesEnCurso = new Map<string, Promise<EstudianteApi[]>>();

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function esEstadoCurso(valor: unknown): valor is EstadoCurso {
  return (
    typeof valor === "string" &&
    ESTADOS_CURSO.includes(valor as EstadoCurso)
  );
}

function validarCurso(valor: unknown): CursoApi {
  if (!esObjeto(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso con un formato inesperado."
    );
  }

  const {
    id,
    codigo,
    nombre,
    descripcion,
    docente,
    docenteId,
    estado,
    estudiantes,
  } = valor;

  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso sin un identificador numérico válido."
    );
  }

  if (typeof codigo !== "string" || !codigo.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso sin código."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso sin nombre."
    );
  }

  if (
    descripcion !== undefined &&
    descripcion !== null &&
    typeof descripcion !== "string"
  ) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió una descripción de curso con un formato inesperado."
    );
  }

  if (typeof docente !== "string" || !docente.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso sin el nombre visible del docente."
    );
  }

  if (
    docenteId !== undefined &&
    docenteId !== null &&
    typeof docenteId !== "string"
  ) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso con un identificador de docente inválido."
    );
  }

  if (!esEstadoCurso(estado)) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso con un estado no reconocido."
    );
  }

  if (
    typeof estudiantes !== "number" ||
    !Number.isInteger(estudiantes) ||
    estudiantes < 0
  ) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un curso con una cantidad de estudiantes inválida."
    );
  }

  return {
    id,
    codigo: codigo.trim(),
    nombre: nombre.trim(),
    descripcion:
      typeof descripcion === "string" ? descripcion.trim() || null : null,
    docente: docente.trim(),
    docenteId:
      typeof docenteId === "string" && docenteId.trim()
        ? docenteId.trim()
        : null,
    estado,
    estudiantes,
  };
}

function validarDocente(valor: unknown): DocenteApi {
  if (!esObjeto(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un docente con un formato inesperado."
    );
  }

  const { id, nombre, email } = valor;

  if (typeof id !== "string" || !id.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un docente sin un identificador válido."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un docente sin nombre."
    );
  }

  if (typeof email !== "string" || !PATRON_EMAIL.test(email.trim())) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un docente con un correo inválido."
    );
  }

  return {
    id: id.trim(),
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
  };
}

function validarEstudiante(valor: unknown): EstudianteApi {
  if (!esObjeto(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un estudiante con un formato inesperado."
    );
  }

  const { id, nombre, email, carrera } = valor;

  if (typeof id !== "string" || !id.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un estudiante sin un identificador válido."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un estudiante sin nombre."
    );
  }

  if (
    email !== null &&
    (typeof email !== "string" || !PATRON_EMAIL.test(email.trim()))
  ) {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un estudiante con un correo inválido."
    );
  }

  if (carrera !== null && typeof carrera !== "string") {
    throw new ErrorAcademico(
      "respuesta",
      "SyncPass API devolvió un estudiante con una carrera inválida."
    );
  }

  return {
    id: id.trim(),
    nombre: nombre.trim(),
    email:
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null,
    carrera:
      typeof carrera === "string" && carrera.trim()
        ? carrera.trim()
        : null,
  };
}

function validarListaCursos(valor: unknown): CursoApi[] {
  if (!Array.isArray(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "La respuesta de cursos no contiene un listado válido."
    );
  }

  const porId = new Map<number, CursoApi>();

  for (const curso of valor.map(validarCurso)) {
    if (!porId.has(curso.id)) {
      porId.set(curso.id, curso);
    }
  }

  return Array.from(porId.values());
}

function validarListaDocentes(valor: unknown): DocenteApi[] {
  if (!Array.isArray(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "La respuesta de docentes no contiene un listado válido."
    );
  }

  const porId = new Map<string, DocenteApi>();

  for (const docente of valor.map(validarDocente)) {
    if (!porId.has(docente.id)) {
      porId.set(docente.id, docente);
    }
  }

  return Array.from(porId.values());
}

function validarListaEstudiantes(valor: unknown): EstudianteApi[] {
  if (!Array.isArray(valor)) {
    throw new ErrorAcademico(
      "respuesta",
      "La respuesta de estudiantes no contiene un listado válido."
    );
  }

  const porId = new Map<string, EstudianteApi>();

  for (const estudiante of valor.map(validarEstudiante)) {
    if (!porId.has(estudiante.id)) {
      porId.set(estudiante.id, estudiante);
    }
  }

  return Array.from(porId.values());
}

export function validarSolicitudCurso(
  datos: CursoSolicitud
): CursoApiSolicitud {
  const codigo = datos.codigo.trim();
  const nombre = datos.nombre.trim();
  const descripcion =
    typeof datos.descripcion === "string"
      ? datos.descripcion.trim() || null
      : null;
  const docenteId =
    typeof datos.docenteId === "string" && datos.docenteId.trim()
      ? datos.docenteId.trim()
      : null;

  if (!codigo) {
    throw new ErrorAcademico(
      "solicitud",
      "El código del curso es obligatorio."
    );
  }

  if (!nombre) {
    throw new ErrorAcademico(
      "solicitud",
      "El nombre del curso es obligatorio."
    );
  }

  if (!ESTADOS_CURSO.includes(datos.estado)) {
    throw new ErrorAcademico(
      "solicitud",
      "El estado del curso debe ser Activo, Inactivo o Finalizado."
    );
  }

  return { codigo, nombre, descripcion, estado: datos.estado, docenteId };
}

function validarId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorAcademico(
      "solicitud",
      "El identificador del curso debe ser un número entero positivo."
    );
  }
}

type OpcionesConsulta = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

type MensajesError = {
  solicitud?: string;
  conflicto?: string;
  noEncontrado?: string;
};

function comoErrorAcademico(
  error: unknown,
  mensajes: MensajesError = {}
): ErrorAcademico {
  if (error instanceof ErrorAcademico) {
    return error;
  }

  if (error instanceof ErrorApi) {
    if (error.status === 400) {
      return new ErrorAcademico(
        "solicitud",
        mensajes.solicitud ?? error.message,
        400
      );
    }

    if (error.status === 409) {
      return new ErrorAcademico(
        "solicitud",
        mensajes.conflicto ??
          "La operación entra en conflicto con datos existentes en SyncPass.",
        409
      );
    }

    if (error.status === 404) {
      return new ErrorAcademico(
        "no-encontrado",
        mensajes.noEncontrado ?? error.message,
        404
      );
    }

    return new ErrorAcademico(error.tipo, error.message, error.status);
  }

  return new ErrorAcademico(
    "red",
    "No fue posible conectar con el módulo académico de SyncPass."
  );
}

export async function listarCursosApi(
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi[]> {
  const clave = `cursos::${
    accessToken ? huellaToken(accessToken) : "sin-token"
  }`;

  if (!opciones.signal) {
    const solicitudExistente = cursosEnCurso.get(clave);

    if (solicitudExistente) {
      return solicitudExistente;
    }
  }

  let solicitud: Promise<CursoApi[]>;

  solicitud = solicitarApi<CursoApi[]>({
    ruta: "/api/cursos",
    accessToken,
    contexto: "consultar los cursos",
    signal: opciones.signal,
    timeoutMs: opciones.timeoutMs,
    validarData: validarListaCursos,
  })
    .catch((error: unknown) => {
      throw comoErrorAcademico(error, {
        solicitud:
          "La API rechazó la consulta de cursos. Revisa los datos e intenta nuevamente.",
        noEncontrado:
          "La ruta de cursos no está disponible en SyncPass API.",
      });
    })
    .finally(() => {
      if (cursosEnCurso.get(clave) === solicitud) {
        cursosEnCurso.delete(clave);
      }
    });

  if (!opciones.signal) {
    cursosEnCurso.set(clave, solicitud);
  }

  return solicitud;
}

export async function obtenerCursoApi(
  id: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi> {
  validarId(id);

  try {
    return await solicitarApi<CursoApi>({
      ruta: `/api/cursos/${id}`,
      accessToken,
      contexto: `consultar el curso ${id}`,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarCurso,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      noEncontrado: `El curso ${id} ya no existe en SyncPass.`,
    });
  }
}

export async function crearCursoApi(
  datos: CursoSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi> {
  const cuerpo = validarSolicitudCurso(datos);

  try {
    return await solicitarApi<CursoApi>({
      ruta: "/api/cursos",
      accessToken,
      contexto: "crear el curso",
      metodo: "POST",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarCurso,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      conflicto: "Ya existe un curso con ese código en SyncPass.",
      solicitud:
        "SyncPass rechazó los datos del curso. Verifica el código, el nombre, el estado y que el docente tenga rol Profesor.",
    });
  }
}

export async function actualizarCursoApi(
  id: number,
  datos: CursoSolicitud,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi> {
  validarId(id);
  const cuerpo = validarSolicitudCurso(datos);

  try {
    return await solicitarApi<CursoApi>({
      ruta: `/api/cursos/${id}`,
      accessToken,
      contexto: `actualizar el curso ${id}`,
      metodo: "PUT",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarCurso,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      conflicto: "Ya existe otro curso con ese código en SyncPass.",
      solicitud:
        "SyncPass rechazó los datos del curso. Verifica el código, el nombre, el estado y que el docente tenga rol Profesor.",
      noEncontrado: `El curso ${id} ya no existe en SyncPass.`,
    });
  }
}

export async function asignarDocenteApi(
  id: number,
  docenteId: string | null,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi> {
  validarId(id);

  const docenteNormalizado =
    typeof docenteId === "string" && docenteId.trim()
      ? docenteId.trim()
      : null;

  try {
    return await solicitarApi<CursoApi>({
      ruta: `/api/cursos/${id}/docente`,
      accessToken,
      contexto: `asignar el docente al curso ${id}`,
      metodo: "PUT",
      cuerpo: { docenteId: docenteNormalizado },
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarCurso,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      solicitud:
        "SyncPass rechazó la asignación. Verifica que el usuario seleccionado tenga rol Profesor.",
      noEncontrado:
        "El curso o el docente seleccionado ya no existe en SyncPass.",
    });
  }
}

export async function listarDocentesApi(
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<DocenteApi[]> {
  const clave = `docentes::${
    accessToken ? huellaToken(accessToken) : "sin-token"
  }`;

  if (!opciones.signal) {
    const solicitudExistente = docentesEnCurso.get(clave);

    if (solicitudExistente) {
      return solicitudExistente;
    }
  }

  let solicitud: Promise<DocenteApi[]>;

  solicitud = solicitarApi<DocenteApi[]>({
    ruta: "/api/docentes",
    accessToken,
    contexto: "consultar los docentes",
    signal: opciones.signal,
    timeoutMs: opciones.timeoutMs,
    validarData: validarListaDocentes,
  })
    .catch((error: unknown) => {
      throw comoErrorAcademico(error, {
        solicitud:
          "La API rechazó la consulta de docentes. Intenta nuevamente.",
        noEncontrado:
          "La ruta de docentes no está disponible en SyncPass API.",
      });
    })
    .finally(() => {
      if (docentesEnCurso.get(clave) === solicitud) {
        docentesEnCurso.delete(clave);
      }
    });

  if (!opciones.signal) {
    docentesEnCurso.set(clave, solicitud);
  }

  return solicitud;
}

export async function listarEstudiantesApi(
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<EstudianteApi[]> {
  const clave = `estudiantes::${accessToken ? huellaToken(accessToken) : "sin-token"}`;

  if (!opciones.signal) {
    const solicitudExistente = estudiantesEnCurso.get(clave);

    if (solicitudExistente) {
      return solicitudExistente;
    }
  }

  let solicitud: Promise<EstudianteApi[]>;

  solicitud = solicitarApi<EstudianteApi[]>({
    ruta: "/api/estudiantes",
    accessToken,
    contexto: "consultar los estudiantes",
    signal: opciones.signal,
    timeoutMs: opciones.timeoutMs,
    validarData: validarListaEstudiantes,
  })
    .catch((error: unknown) => {
      throw comoErrorAcademico(error, {
        solicitud:
          "La API rechazó la consulta de estudiantes. Intenta nuevamente.",
        noEncontrado:
          "La ruta de estudiantes no está disponible en SyncPass API.",
      });
    })
    .finally(() => {
      if (estudiantesEnCurso.get(clave) === solicitud) {
        estudiantesEnCurso.delete(clave);
      }
    });

  if (!opciones.signal) {
    estudiantesEnCurso.set(clave, solicitud);
  }

  return solicitud;
}

export async function listarEstudiantesDeCursoApi(
  cursoId: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<EstudianteApi[]> {
  validarId(cursoId);

  try {
    return await solicitarApi<EstudianteApi[]>({
      ruta: `/api/cursos/${cursoId}/estudiantes`,
      accessToken,
      contexto: `consultar los estudiantes del curso ${cursoId}`,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarListaEstudiantes,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      noEncontrado: `El curso ${cursoId} ya no existe en SyncPass.`,
    });
  }
}

export async function inscribirEstudianteApi(
  cursoId: number,
  estudianteId: string,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<void> {
  validarId(cursoId);

  const estudianteNormalizado = estudianteId.trim();

  if (!estudianteNormalizado) {
    throw new ErrorAcademico(
      "solicitud",
      "El identificador del estudiante es obligatorio."
    );
  }

  try {
    await solicitarApi<void>({
      ruta: `/api/cursos/${cursoId}/estudiantes`,
      accessToken,
      contexto: `inscribir el estudiante en el curso ${cursoId}`,
      metodo: "POST",
      cuerpo: { estudianteId: estudianteNormalizado },
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      conflicto:
        "El estudiante ya está inscrito en este curso o no cumple los requisitos.",
      solicitud:
        "SyncPass rechazó la inscripción. Verifica el estudiante y el curso.",
      noEncontrado: `El curso ${cursoId} o el estudiante ya no existe en SyncPass.`,
    });
  }
}

export async function retirarEstudianteApi(
  cursoId: number,
  estudianteId: string,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<void> {
  validarId(cursoId);

  const estudianteNormalizado = estudianteId.trim();

  if (!estudianteNormalizado) {
    throw new ErrorAcademico(
      "solicitud",
      "El identificador del estudiante es obligatorio."
    );
  }

  try {
    await solicitarApi<void>({
      ruta: `/api/cursos/${cursoId}/estudiantes/${encodeURIComponent(estudianteNormalizado)}`,
      accessToken,
      contexto: `retirar el estudiante del curso ${cursoId}`,
      metodo: "DELETE",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      noEncontrado:
        "El curso o el estudiante ya no existe en SyncPass.",
      solicitud:
        "SyncPass rechazó el retiro del estudiante.",
    });
  }
}

export async function listarCursosDeEstudianteApi(
  estudianteId: string,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<CursoApi[]> {
  const idNormalizado = estudianteId.trim();

  if (!idNormalizado) {
    throw new ErrorAcademico(
      "solicitud",
      "El identificador del estudiante es obligatorio."
    );
  }

  try {
    return await solicitarApi<CursoApi[]>({
      ruta: `/api/cursos/estudiante/${encodeURIComponent(idNormalizado)}`,
      accessToken,
      contexto: `consultar los cursos del estudiante ${idNormalizado}`,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarListaCursos,
    });
  } catch (error) {
    throw comoErrorAcademico(error, {
      noEncontrado:
        "El estudiante o sus cursos no están disponibles en SyncPass.",
    });
  }
}

/**
 * Convierte el DTO del backend al tipo compartido por la interfaz.
 * El ID numérico se mantiene como texto para no alterar `Curso.id`.
 */
export function cursoApiACurso(curso: CursoApi): Curso {
  return {
    id: String(curso.id),
    codigo: curso.codigo,
    nombre: curso.nombre,
    descripcion: curso.descripcion ?? "",
    docente: curso.docente,
    docenteId: curso.docenteId,
    estado: curso.estado,
    estudiantes: curso.estudiantes,
  };
}

export function docenteApiADocente(docente: DocenteApi): DocenteAcademico {
  return {
    id: docente.id,
    nombre: docente.nombre,
    email: docente.email,
  };
}

export function estudianteApiAEstudiante(estudiante: EstudianteApi): EstudianteAcademico {
  return {
    id: estudiante.id,
    nombre: estudiante.nombre,
    email: estudiante.email ?? "",
    carrera: estudiante.carrera ?? "",
  };
}


