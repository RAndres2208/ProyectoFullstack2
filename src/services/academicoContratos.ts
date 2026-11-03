/**
 * Contratos de integración académica de SyncPass.
 *
 * Estado actual:
 * - Cursos y docentes de coordinación ya se conectan a la API real mediante
 *   `src/services/academicoApi.ts` y `src/hooks/useAcademicoApi.ts`.
 * - Inscripciones y asistencia continúan en memoria a través de
 *   `AcademicoProvider`; este módulo declara la forma que tendría su
 *   integración futura.
 * - No inventar rutas ni respuestas: el cliente real vive en
 *   `academicoApi.ts` y usa `apiClient.ts`.
 */

import type {
  AsistenciaSesionSolicitud,
  Curso,
  CursoSolicitud,
  DocenteAcademico,
  EstudianteAcademico,
  RegistroAsistencia,
} from "../types/academico";

export type ContratoCursos = {
  listarCursos(): Promise<Curso[]>;
  crearCurso(datos: CursoSolicitud): Promise<Curso>;
  actualizarCurso(id: string, datos: CursoSolicitud): Promise<Curso>;
  asignarDocente(id: string, docenteId: string | null): Promise<Curso>;
  listarDocentes(): Promise<DocenteAcademico[]>;
  listarEstudiantes(): Promise<EstudianteAcademico[]>;
  listarEstudiantesDeCurso(cursoId: string): Promise<EstudianteAcademico[]>;
  inscribirEstudiante(cursoId: string, estudianteId: string): Promise<void>;
  retirarEstudiante(cursoId: string, estudianteId: string): Promise<void>;
};

export type ContratoAsistencia = {
  listarRegistros(
    cursoId: string,
    fecha?: string
  ): Promise<RegistroAsistencia[]>;
  guardarSesion(
    datos: AsistenciaSesionSolicitud
  ): Promise<RegistroAsistencia[]>;
};

export type ContratoAcademico = {
  cursos: ContratoCursos;
  asistencia: ContratoAsistencia;
};

/**
 * Estado explícito de la integración. Las pantallas de coordinación usan la
 * API real para cursos y docentes; inscripciones y asistencia permanecen en
 * memoria. El valor de `asistencia` conserva "pendiente" para que
 * `AcademicoProvider` siga marcando esa integración como no disponible.
 */
export const INTEGRACION_ACADEMICA = {
  cursos: "api-coordinador",
  docentes: "api-coordinador",
  inscripciones: "demo-local",
  asistencia: "pendiente",
  persistencia: "mixta-api-memoria",
} as const;
