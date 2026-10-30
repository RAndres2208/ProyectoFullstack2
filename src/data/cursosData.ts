export type Curso = {
  id: string;
  nombre: string;
  descripcion: string;
  docente: string;
  codigo: string;
  estado: "Activo" | "Inactivo" | "Finalizado";
  estudiantes: number;
};

export const cursosDemo: Curso[] = [
  {
    id: "CUR-001",
    nombre: "Taller de Programación Web",
    descripcion: "Desarrollo frontend con React y TypeScript",
    docente: "María González",
    codigo: "PW-2024-01",
    estado: "Activo",
    estudiantes: 28
  },
  {
    id: "CUR-002",
    nombre: "Bases de Datos",
    descripcion: "Modelado relacional y SQL",
    docente: "Carlos Pérez",
    codigo: "BD-2024-01",
    estado: "Activo",
    estudiantes: 32
  },
  {
    id: "CUR-003",
    nombre: "Metodologías Ágiles",
    descripcion: "Scrum, Kanban y gestión de proyectos",
    docente: "Ana Torres",
    codigo: "AG-2024-01",
    estado: "Finalizado",
    estudiantes: 25
  }
];

export const estudiantesDemo = [
  {
    id: "EST-001",
    nombre: "Juan Pérez",
    email: "juan.perez@duoc.cl",
    carrera: "Ingeniería en Informática",
    cursos: ["CUR-001", "CUR-002"]
  },
  {
    id: "EST-002",
    nombre: "María Silva",
    email: "maria.silva@duoc.cl",
    carrera: "Ingeniería en Informática",
    cursos: ["CUR-001"]
  },
  {
    id: "EST-003",
    nombre: "Pedro López",
    email: "pedro.lopez@duoc.cl",
    carrera: "Analista Programador",
    cursos: ["CUR-002", "CUR-003"]
  }
];
