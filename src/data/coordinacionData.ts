/**
 * Indicadores ficticios para la vista de Coordinador. Se usan mientras la
 * API no exponga endpoints académicos específicos para ese perfil.
 */

export type DocenteCoordinacionDemo = {
  id: string;
  nombre: string;
  email: string;
  cursos: string[];
  estudiantes: number;
  asistencia: number;
};

export type AsistenciaCursoDemo = {
  cursoId: string;
  curso: string;
  docente: string;
  sesiones: number;
  presentes: number;
  ausentes: number;
  tasa: number;
};

export const docentesCoordinacionDemo: DocenteCoordinacionDemo[] = [
  {
    id: "DOC-001",
    nombre: "María González",
    email: "maria.gonzalez@duoc.cl",
    cursos: ["Taller de Programación Web"],
    estudiantes: 28,
    asistencia: 89,
  },
  {
    id: "DOC-002",
    nombre: "Carlos Pérez",
    email: "carlos.perez@duoc.cl",
    cursos: ["Bases de Datos"],
    estudiantes: 32,
    asistencia: 81,
  },
  {
    id: "DOC-003",
    nombre: "Ana Torres",
    email: "ana.torres@duoc.cl",
    cursos: ["Metodologías Ágiles"],
    estudiantes: 25,
    asistencia: 76,
  },
];

export const asistenciaCursosDemo: AsistenciaCursoDemo[] = [
  {
    cursoId: "CUR-001",
    curso: "Taller de Programación Web",
    docente: "María González",
    sesiones: 16,
    presentes: 14,
    ausentes: 2,
    tasa: 89,
  },
  {
    cursoId: "CUR-002",
    curso: "Bases de Datos",
    docente: "Carlos Pérez",
    sesiones: 16,
    presentes: 13,
    ausentes: 3,
    tasa: 81,
  },
  {
    cursoId: "CUR-003",
    curso: "Metodologías Ágiles",
    docente: "Ana Torres",
    sesiones: 12,
    presentes: 9,
    ausentes: 3,
    tasa: 76,
  },
];
