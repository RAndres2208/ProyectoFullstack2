/**
 * Contratos de integración académica de SyncPass.
 *
 * IMPORTANTE:
 * - El backend todavía no confirma endpoints para cursos, docentes,
 *   inscripciones ni asistencia.
 * - Este módulo NO contiene rutas HTTP, ni clientes `fetch`, ni respuestas
 *   inventadas. Solo declara los tipos y las operaciones que deberá implementar
 *   el servicio real cuando exista un contrato aprobado.
 * - Las pantallas actuales trabajan con datos de demostración en memoria a
 *   través de `AcademicoProvider`.
 *
 * Cuando el backend publique el contrato, se debe crear un servicio que
 * implemente `ContratoAcademico` usando `apiClient.ts` y reemplazar el estado
 * en memoria sin cambiar las pantallas.
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
 * Estado explícito de la integración. Las pantallas lo usan para no presentar
 * los cambios en memoria como si estuvieran persistidos en PostgreSQL.
 */
export const INTEGRACION_ACADEMICA = {
  cursos: "pendiente",
  docentes: "pendiente",
  inscripciones: "pendiente",
  asistencia: "pendiente",
  persistencia: "memoria-demo",
} as const;
