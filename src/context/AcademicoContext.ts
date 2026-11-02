import { createContext, useContext } from "react";
import type {
  AsistenciaSesionSolicitud,
  Curso,
  CursoSolicitud,
  DocenteAcademico,
  EstudianteAcademico,
  EstadoAsistencia,
  RegistroAsistencia,
} from "../types/academico";

export type AcademicoEstado = {
  cargando: boolean;
  usandoApi: boolean;
  /** Los datos aún no existen en la API académica. */
  pendienteApi: boolean;
};

export type AcademicoContextValue = AcademicoEstado & {
  cursos: Curso[];
  docentes: DocenteAcademico[];
  estudiantes: EstudianteAcademico[];
  registrosAsistencia: RegistroAsistencia[];

  listarCursosPorPerfil: (perfil: {
    rol: "estudiante" | "profesor" | "coordinador" | "administrador" | null;
    estudianteId?: string;
    docenteId?: string;
  }) => Curso[];

  crearCurso: (datos: CursoSolicitud) => Curso;
  actualizarCurso: (id: string, datos: CursoSolicitud) => Curso | null;
  eliminarCurso: (id: string) => boolean;
  asignarDocente: (id: string, docenteId: string | null) => Curso | null;

  obtenerEstudiantesDeCurso: (cursoId: string) => EstudianteAcademico[];
  inscribirEstudiante: (cursoId: string, estudianteId: string) => boolean;
  retirarEstudiante: (cursoId: string, estudianteId: string) => boolean;

  listarRegistrosAsistencia: (
    cursoId: string,
    fecha?: string
  ) => RegistroAsistencia[];
  guardarSesionAsistencia: (
    datos: AsistenciaSesionSolicitud
  ) => RegistroAsistencia[];
  marcarAsistenciaRapida: (
    cursoId: string,
    fecha: string,
    estudianteId: string,
    estado: EstadoAsistencia
  ) => RegistroAsistencia;
};

export const AcademicoContext = createContext<AcademicoContextValue | null>(null);

export function useAcademico(): AcademicoContextValue {
  const contexto = useContext(AcademicoContext);

  if (contexto === null) {
    throw new Error("useAcademico debe utilizarse dentro de AcademicoProvider.");
  }

  return contexto;
}
