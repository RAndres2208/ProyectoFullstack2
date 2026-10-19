
export type Evento = {
  id: string;
  nombre: string;
  estado: "En curso" | "Programado" | "Finalizado";
  proyecto: string;
  unidadVecinal: string;
  descripcion: string;
  fecha: string;
  horario: string;
  duracion: string;
  lugar: string;
  direccion: string;
  cuposMaximos: number;
  inscritos: number;
  asistentes: number;
};

export const eventosData: Evento[] = [
  {
    id: "evt-016",
    nombre: "Alfabetización digital",
    estado: "En curso",
    proyecto: "Conecta Barrio",
    unidadVecinal: "Unidad vecinal 12",
    descripcion:
      "Aprende a usar tu celular, realizar trámites y comunicarte de forma segura.",
    fecha: "Viernes 16 de octubre de 2026",
    horario: "10:00–12:00",
    duracion: "2 horas",
    lugar: "Sede vecinal Los Aromos",
    direccion: "Av. Los Aromos 1240, Maipú",
    cuposMaximos: 40,
    inscritos: 32,
    asistentes: 24,
  },
];

export function obtenerEvento(id: string) {
  return eventosData.find((evento) => evento.id === id);
}
