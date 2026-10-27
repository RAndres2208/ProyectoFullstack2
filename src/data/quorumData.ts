/**
 * Datos de demostración para el control de quórum. Los registros
 * relacionan eventos con participantes mediante su identificador.
 */

export type EstadoQuorumParticipante =
  | "Asistió"
  | "Ausente"
  | "Justificado";

export type RegistroQuorum = {
  participanteId: string;
  estado: EstadoQuorumParticipante;
  hora?: string;
};

export type EventoQuorum = {
  id: string;
  nombre: string;
  proyectoNombre: string;
  fecha: string;
  horario: string;
  lugar: string;
  estado: "En curso" | "Finalizado";
  umbralDemo: number;
  registros: RegistroQuorum[];
  demostracion: true;
};

export const eventosQuorumDemo: EventoQuorum[] = [
  {
    id: "EVT-016",
    nombre: "Alfabetización digital",
    proyectoNombre: "Conecta Barrio",
    fecha: "2026-10-16",
    horario: "10:00–12:00",
    lugar: "Sede vecinal Los Aromos",
    estado: "Finalizado",
    umbralDemo: 70,
    registros: [
      { participanteId: "SP-001", estado: "Asistió", hora: "10:02" },
      { participanteId: "SP-002", estado: "Asistió", hora: "10:04" },
      { participanteId: "SP-003", estado: "Asistió", hora: "10:07" },
      { participanteId: "SP-004", estado: "Asistió", hora: "10:03" },
      { participanteId: "SP-005", estado: "Ausente" },
      { participanteId: "SP-006", estado: "Asistió", hora: "10:09" },
      { participanteId: "SP-007", estado: "Asistió", hora: "10:01" },
      { participanteId: "SP-008", estado: "Asistió", hora: "10:12" },
      { participanteId: "SP-009", estado: "Asistió", hora: "10:05" },
      { participanteId: "SP-010", estado: "Ausente" },
      { participanteId: "SP-011", estado: "Asistió", hora: "09:58" },
      { participanteId: "SP-012", estado: "Asistió", hora: "10:16" },
      { participanteId: "SP-013", estado: "Asistió", hora: "10:06" },
      { participanteId: "SP-014", estado: "Asistió", hora: "10:18" },
      { participanteId: "SP-015", estado: "Asistió", hora: "10:08" },
      { participanteId: "SP-016", estado: "Ausente" },
      { participanteId: "SP-017", estado: "Justificado" },
      { participanteId: "SP-018", estado: "Asistió", hora: "10:00" },
    ],
    demostracion: true,
  },
  {
    id: "EVT-021",
    nombre: "Huerto comunitario",
    proyectoNombre: "Semillas de comunidad",
    fecha: "2026-10-20",
    horario: "09:30–11:30",
    lugar: "Huerto vecinal Las Flores",
    estado: "Finalizado",
    umbralDemo: 60,
    registros: [
      { participanteId: "SP-001", estado: "Asistió", hora: "09:31" },
      { participanteId: "SP-002", estado: "Asistió", hora: "09:36" },
      { participanteId: "SP-003", estado: "Asistió", hora: "09:34" },
      { participanteId: "SP-004", estado: "Ausente" },
      { participanteId: "SP-005", estado: "Ausente" },
      { participanteId: "SP-006", estado: "Asistió", hora: "09:28" },
      { participanteId: "SP-007", estado: "Ausente" },
      { participanteId: "SP-008", estado: "Justificado" },
      { participanteId: "SP-009", estado: "Asistió", hora: "09:33" },
      { participanteId: "SP-010", estado: "Ausente" },
      { participanteId: "SP-011", estado: "Ausente" },
      { participanteId: "SP-012", estado: "Asistió", hora: "09:39" },
      { participanteId: "SP-013", estado: "Ausente" },
      { participanteId: "SP-014", estado: "Justificado" },
      { participanteId: "SP-015", estado: "Asistió", hora: "09:30" },
      { participanteId: "SP-016", estado: "Ausente" },
      { participanteId: "SP-017", estado: "Ausente" },
      { participanteId: "SP-018", estado: "Asistió", hora: "09:37" },
    ],
    demostracion: true,
  },
  {
    id: "EVT-026",
    nombre: "Asamblea de cierre",
    proyectoNombre: "Barrio en movimiento",
    fecha: "2026-10-26",
    horario: "17:00–19:00",
    lugar: "Sede vecinal Los Aromos",
    estado: "En curso",
    umbralDemo: 80,
    registros: [
      { participanteId: "SP-001", estado: "Asistió", hora: "16:52" },
      { participanteId: "SP-002", estado: "Asistió", hora: "16:55" },
      { participanteId: "SP-003", estado: "Asistió", hora: "17:01" },
      { participanteId: "SP-004", estado: "Asistió", hora: "16:49" },
      { participanteId: "SP-005", estado: "Ausente" },
      { participanteId: "SP-006", estado: "Asistió", hora: "16:57" },
      { participanteId: "SP-007", estado: "Asistió", hora: "17:03" },
      { participanteId: "SP-008", estado: "Asistió", hora: "16:58" },
      { participanteId: "SP-009", estado: "Asistió", hora: "17:05" },
      { participanteId: "SP-010", estado: "Ausente" },
      { participanteId: "SP-011", estado: "Asistió", hora: "16:54" },
      { participanteId: "SP-012", estado: "Asistió", hora: "17:02" },
      { participanteId: "SP-013", estado: "Asistió", hora: "16:56" },
      { participanteId: "SP-014", estado: "Asistió", hora: "17:06" },
      { participanteId: "SP-015", estado: "Asistió", hora: "16:59" },
      { participanteId: "SP-016", estado: "Asistió", hora: "17:04" },
      { participanteId: "SP-017", estado: "Asistió", hora: "17:00" },
      { participanteId: "SP-018", estado: "Asistió", hora: "16:51" },
    ],
    demostracion: true,
  },
];
