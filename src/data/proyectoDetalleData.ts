import { normalizarTexto } from "../utils/format";

/**
 * Información complementaria de demostración para el detalle de un
 * proyecto. Los campos reales (id, nombre, estado y participantes)
 * provienen de la API cuando están disponibles.
 */

export type EventoVinculadoDemo = {
  id: string;
  nombre: string;
  fecha: string;
  estado: "En curso" | "Programado" | "Finalizado";
  inscritos: number;
  asistentes: number;
  enlace?: string;
};

export type DetalleProyectoDemo = {
  proyectoId: string;
  nombre: string;
  descripcion: string;
  objetivos: string[];
  responsable: string;
  unidadVecinal: string;
  sector: string;
  fechaInicio: string;
  fechaTermino: string;
  eventos: EventoVinculadoDemo[];
  estadisticas: {
    inscritos: number;
    asistencias: number;
    encuestas: number;
    quorumPromedio: number;
  };
  demostracion: true;
};

export const detallesProyectoDemo: DetalleProyectoDemo[] = [
  {
    proyectoId: "conecta-barrio",
    nombre: "Conecta Barrio",
    descripcion:
      "Iniciativa de inclusión digital que acompaña a vecinas y vecinos en el uso seguro del celular, los trámites en línea y la comunicación con sus familias.",
    objetivos: [
      "Fortalecer habilidades digitales básicas en personas mayores.",
      "Facilitar el acceso autónomo a trámites y servicios en línea.",
      "Reducir la brecha digital en la unidad vecinal 12.",
    ],
    responsable: "Equipo de vinculación con el medio · Duoc UC",
    unidadVecinal: "Unidad vecinal 12",
    sector: "Los Aromos",
    fechaInicio: "2026-10-01",
    fechaTermino: "2026-11-30",
    eventos: [
      {
        id: "evt-016",
        nombre: "Alfabetización digital",
        fecha: "2026-10-16",
        estado: "Finalizado",
        inscritos: 32,
        asistentes: 24,
        enlace: "/eventos/evt-016",
      },
      {
        id: "demo-conecta-02",
        nombre: "Trámites en línea",
        fecha: "2026-11-06",
        estado: "Programado",
        inscritos: 30,
        asistentes: 0,
      },
      {
        id: "demo-conecta-03",
        nombre: "Seguridad digital",
        fecha: "2026-11-20",
        estado: "Programado",
        inscritos: 28,
        asistentes: 0,
      },
    ],
    estadisticas: {
      inscritos: 90,
      asistencias: 24,
      encuestas: 19,
      quorumPromedio: 78,
    },
    demostracion: true,
  },
  {
    proyectoId: "semillas-comunidad",
    nombre: "Semillas de comunidad",
    descripcion:
      "Proyecto de recuperación de espacios comunitarios mediante huertos urbanos, compostaje y encuentros de intercambio de semillas.",
    objetivos: [
      "Habilitar un huerto comunitario cuidado por vecinas y vecinos.",
      "Promover prácticas de compostaje domiciliario.",
      "Generar instancias de encuentro intergeneracional.",
    ],
    responsable: "Equipo de vinculación con el medio · Duoc UC",
    unidadVecinal: "Unidad vecinal 08",
    sector: "Las Flores",
    fechaInicio: "2026-10-15",
    fechaTermino: "2026-12-15",
    eventos: [
      {
        id: "demo-semillas-01",
        nombre: "Huerto comunitario",
        fecha: "2026-10-20",
        estado: "Finalizado",
        inscritos: 22,
        asistentes: 18,
      },
      {
        id: "demo-semillas-02",
        nombre: "Feria de semillas",
        fecha: "2026-11-14",
        estado: "Programado",
        inscritos: 24,
        asistentes: 0,
      },
    ],
    estadisticas: {
      inscritos: 46,
      asistencias: 18,
      encuestas: 13,
      quorumPromedio: 62,
    },
    demostracion: true,
  },
  {
    proyectoId: "barrio-movimiento",
    nombre: "Barrio en movimiento",
    descripcion:
      "Programa de actividad física y encuentro comunitario que busca recuperar espacios públicos y promover el bienestar de las personas del sector.",
    objetivos: [
      "Aumentar la participación en actividades físicas recreativas.",
      "Recuperar plazas y sedes vecinales como espacios de encuentro.",
      "Cerrar el ciclo con una asamblea de evaluación comunitaria.",
    ],
    responsable: "Equipo de vinculación con el medio · Duoc UC",
    unidadVecinal: "Unidad vecinal 12",
    sector: "Los Aromos",
    fechaInicio: "2026-08-01",
    fechaTermino: "2026-10-30",
    eventos: [
      {
        id: "demo-barrio-01",
        nombre: "Cierre de temporada",
        fecha: "2026-10-24",
        estado: "Finalizado",
        inscritos: 26,
        asistentes: 20,
      },
      {
        id: "demo-barrio-02",
        nombre: "Asamblea de cierre",
        fecha: "2026-10-26",
        estado: "En curso",
        inscritos: 18,
        asistentes: 16,
      },
    ],
    estadisticas: {
      inscritos: 44,
      asistencias: 36,
      encuestas: 15,
      quorumPromedio: 82,
    },
    demostracion: true,
  },
];

export function buscarDetalleProyectoDemo(
  id: string,
  nombre?: string
): DetalleProyectoDemo | undefined {
  const coincidenciaPorId = detallesProyectoDemo.find(
    (detalle) => detalle.proyectoId === id
  );

  if (coincidenciaPorId) {
    return coincidenciaPorId;
  }

  if (!nombre) {
    return undefined;
  }

  const nombreNormalizado = normalizarTexto(nombre);

  return detallesProyectoDemo.find(
    (detalle) =>
      normalizarTexto(detalle.nombre) === nombreNormalizado
  );
}
