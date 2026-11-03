/**
 * Tipos académicos compartidos por las pantallas de cursos, docentes,
 * estudiantes y asistencia.
 *
 * Las pantallas de coordinación de cursos y docentes usan la API real
 * (`src/services/academicoApi.ts`) cuando hay una sesión de Cognito. Los
 * flujos de inscripción, asistencia y las vistas de demostración continúan
 * usando datos en memoria.
 */

export type EstadoCurso = "Activo" | "Inactivo" | "Finalizado";

export type EstadoAsistencia = "Presente" | "Ausente" | "Atrasado";

export type OrigenRegistro = "demo" | "api";

export type DocenteAcademico = {
  id: string;
  nombre: string;
  email: string;
};

export type EstudianteAcademico = {
  id: string;
  nombre: string;
  email: string;
  carrera: string;
};

export type Curso = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  /** Nombre visible del docente; puede quedar como "Sin docente asignado". */
  docente: string;
  /** Vínculo interno con la ficha docente. */
  docenteId: string | null;
  estado: EstadoCurso;
  /** Cantidad de estudiantes reportada por la API o calculada en demo. */
  estudiantes: number;
};

/** Estudiante de demostración con los cursos que tenía inscritos al iniciar. */
export type Estudiante = EstudianteAcademico & {
  cursos: string[];
};

export type InscripcionAcademica = {
  cursoId: string;
  estudianteId: string;
};

export type RegistroAsistencia = {
  id: string;
  cursoId: string;
  estudianteId: string;
  /** Fecha de la sesión en formato YYYY-MM-DD. */
  fecha: string;
  estado: EstadoAsistencia;
  /** Momento en que se guardó el registro dentro de la demostración. */
  registradoEn: string;
  origen: OrigenRegistro;
};

export type CursoSolicitud = {
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: EstadoCurso;
  docenteId: string | null;
};

export type AsistenciaSesionSolicitud = {
  cursoId: string;
  fecha: string;
  registros: Array<{
    estudianteId: string;
    estado: EstadoAsistencia;
  }>;
};

export const ESTADOS_CURSO: EstadoCurso[] = [
  "Activo",
  "Inactivo",
  "Finalizado",
];

export const ESTADOS_ASISTENCIA: EstadoAsistencia[] = [
  "Presente",
  "Atrasado",
  "Ausente",
];
