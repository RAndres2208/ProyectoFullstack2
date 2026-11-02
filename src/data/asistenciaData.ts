import type { RegistroAsistencia } from "../types/academico";

/**
 * Registros de asistencia de demostración.
 *
 * Se cargan una sola vez en memoria y no se envían al backend. La pantalla
 * docente los etiqueta explícitamente como demostración.
 */
export const registrosAsistenciaDemo: RegistroAsistencia[] = [
  {
    id: "ASI-DEMO-001",
    cursoId: "CUR-001",
    estudianteId: "EST-001",
    fecha: "2026-10-20",
    estado: "Presente",
    registradoEn: "2026-10-20T09:05:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-002",
    cursoId: "CUR-001",
    estudianteId: "EST-002",
    fecha: "2026-10-20",
    estado: "Atrasado",
    registradoEn: "2026-10-20T09:05:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-003",
    cursoId: "CUR-002",
    estudianteId: "EST-001",
    fecha: "2026-10-20",
    estado: "Presente",
    registradoEn: "2026-10-20T11:10:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-004",
    cursoId: "CUR-002",
    estudianteId: "EST-003",
    fecha: "2026-10-20",
    estado: "Ausente",
    registradoEn: "2026-10-20T11:10:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-005",
    cursoId: "CUR-001",
    estudianteId: "EST-001",
    fecha: "2026-10-21",
    estado: "Presente",
    registradoEn: "2026-10-21T09:02:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-006",
    cursoId: "CUR-001",
    estudianteId: "EST-002",
    fecha: "2026-10-21",
    estado: "Presente",
    registradoEn: "2026-10-21T09:02:00",
    origen: "demo",
  },
  {
    id: "ASI-DEMO-007",
    cursoId: "CUR-003",
    estudianteId: "EST-003",
    fecha: "2026-10-22",
    estado: "Presente",
    registradoEn: "2026-10-22T15:30:00",
    origen: "demo",
  },
];
