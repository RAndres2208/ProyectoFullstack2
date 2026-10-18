
export type EstadoProyecto =
  | "En ejecución"
  | "Programado"
  | "Finalizado";

export type Proyecto = {
  id: string;
  nombre: string;
  categoria: string;
  unidadVecinal: string;
  sector: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoProyecto;
  cantidadEventos: number;
  informacionEventos: string;
  icono: "computador" | "planta" | "salud";
};

export const proyectosData: Proyecto[] = [
  {
    id: "conecta-barrio",
    nombre: "Conecta Barrio",
    categoria: "Inclusión digital",
    unidadVecinal: "Unidad vecinal 12",
    sector: "Los Aromos",
    fechaInicio: "01 oct",
    fechaTermino: "30 nov 2026",
    estado: "En ejecución",
    cantidadEventos: 5,
    informacionEventos: "5 eventos · 1 en curso",
    icono: "computador",
  },
  {
    id: "semillas-comunidad",
    nombre: "Semillas de comunidad",
    categoria: "Medioambiente",
    unidadVecinal: "Unidad vecinal 08",
    sector: "Las Flores",
    fechaInicio: "15 oct",
    fechaTermino: "15 dic 2026",
    estado: "Programado",
    cantidadEventos: 2,
    informacionEventos: "2 eventos · próximo 20 oct",
    icono: "planta",
  },
  {
    id: "barrio-movimiento",
    nombre: "Barrio en movimiento",
    categoria: "Salud y bienestar",
    unidadVecinal: "Unidad vecinal 12",
    sector: "Los Aromos",
    fechaInicio: "01 ago",
    fechaTermino: "30 sept 2026",
    estado: "Finalizado",
    cantidadEventos: 3,
    informacionEventos: "3 eventos · reporte disponible",
    icono: "salud",
  },
];
