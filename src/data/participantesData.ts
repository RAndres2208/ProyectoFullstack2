/**
 * Datos de demostración del módulo de participantes.
 * No provienen del backend: se identifican con `demostracion: true`.
 */

export type EstadoParticipante = "Activo" | "Pendiente" | "Inactivo";

export type Participante = {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  estado: EstadoParticipante;
  proyectoId: string;
  proyectoNombre: string;
  fechaRegistro: string;
  asistencias: number;
  eventosInscritos: number;
  demostracion: true;
};

export const participantesDemo: Participante[] = [
  {
    id: "SP-001",
    nombre: "Ana Torres",
    correo: "ana.torres@duocuc.cl",
    telefono: "+56 9 6123 4501",
    estado: "Activo",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-02-10",
    asistencias: 8,
    eventosInscritos: 9,
    demostracion: true,
  },
  {
    id: "SP-002",
    nombre: "Benjamín Rojas",
    correo: "benjamin.rojas@duocuc.cl",
    estado: "Activo",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-02-11",
    asistencias: 7,
    eventosInscritos: 9,
    demostracion: true,
  },
  {
    id: "SP-003",
    nombre: "Camila Soto",
    correo: "camila.soto@duocuc.cl",
    telefono: "+56 9 7842 1130",
    estado: "Pendiente",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    fechaRegistro: "2026-09-28",
    asistencias: 0,
    eventosInscritos: 2,
    demostracion: true,
  },
  {
    id: "SP-004",
    nombre: "Diego Fuentes",
    correo: "diego.fuentes@duocuc.cl",
    estado: "Activo",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-03-04",
    asistencias: 6,
    eventosInscritos: 7,
    demostracion: true,
  },
  {
    id: "SP-005",
    nombre: "Elena Muñoz",
    correo: "elena.munoz@duocuc.cl",
    estado: "Inactivo",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-02-15",
    asistencias: 2,
    eventosInscritos: 9,
    demostracion: true,
  },
  {
    id: "SP-006",
    nombre: "Felipe Contreras",
    correo: "felipe.contreras@duocuc.cl",
    telefono: "+56 9 4431 9082",
    estado: "Activo",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    fechaRegistro: "2026-04-02",
    asistencias: 5,
    eventosInscritos: 6,
    demostracion: true,
  },
  {
    id: "SP-007",
    nombre: "Gabriela Pérez",
    correo: "gabriela.perez@duocuc.cl",
    estado: "Activo",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-03-12",
    asistencias: 7,
    eventosInscritos: 7,
    demostracion: true,
  },
  {
    id: "SP-008",
    nombre: "Hugo Salazar",
    correo: "hugo.salazar@duocuc.cl",
    estado: "Pendiente",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-10-01",
    asistencias: 0,
    eventosInscritos: 1,
    demostracion: true,
  },
  {
    id: "SP-009",
    nombre: "Isabel Navarro",
    correo: "isabel.navarro@duocuc.cl",
    telefono: "+56 9 5520 7741",
    estado: "Activo",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    fechaRegistro: "2026-04-10",
    asistencias: 6,
    eventosInscritos: 6,
    demostracion: true,
  },
  {
    id: "SP-010",
    nombre: "Javier Morales",
    correo: "javier.morales@duocuc.cl",
    estado: "Inactivo",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-03-18",
    asistencias: 1,
    eventosInscritos: 7,
    demostracion: true,
  },
  {
    id: "SP-011",
    nombre: "Karen Villarroel",
    correo: "karen.villarroel@duocuc.cl",
    estado: "Activo",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-05-06",
    asistencias: 8,
    eventosInscritos: 9,
    demostracion: true,
  },
  {
    id: "SP-012",
    nombre: "Luis Herrera",
    correo: "luis.herrera@duocuc.cl",
    estado: "Pendiente",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    fechaRegistro: "2026-09-30",
    asistencias: 0,
    eventosInscritos: 2,
    demostracion: true,
  },
  {
    id: "SP-013",
    nombre: "María José Araya",
    correo: "maria.araya@duocuc.cl",
    telefono: "+56 9 3218 5560",
    estado: "Activo",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-03-25",
    asistencias: 6,
    eventosInscritos: 7,
    demostracion: true,
  },
  {
    id: "SP-014",
    nombre: "Nicolás Vega",
    correo: "nicolas.vega@duocuc.cl",
    estado: "Pendiente",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-10-02",
    asistencias: 0,
    eventosInscritos: 1,
    demostracion: true,
  },
  {
    id: "SP-015",
    nombre: "Olivia Ramírez",
    correo: "olivia.ramirez@duocuc.cl",
    estado: "Activo",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    fechaRegistro: "2026-05-14",
    asistencias: 5,
    eventosInscritos: 6,
    demostracion: true,
  },
  {
    id: "SP-016",
    nombre: "Pablo Guzmán",
    correo: "pablo.guzman@duocuc.cl",
    telefono: "+56 9 9081 2234",
    estado: "Inactivo",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    fechaRegistro: "2026-02-20",
    asistencias: 3,
    eventosInscritos: 9,
    demostracion: true,
  },
  {
    id: "SP-017",
    nombre: "Quintín Espinoza",
    correo: "quintin.espinoza@duocuc.cl",
    estado: "Pendiente",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-09-29",
    asistencias: 0,
    eventosInscritos: 2,
    demostracion: true,
  },
  {
    id: "SP-018",
    nombre: "Rosa Cárdenas",
    correo: "rosa.cardenas@duocuc.cl",
    estado: "Activo",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    fechaRegistro: "2026-04-18",
    asistencias: 7,
    eventosInscritos: 7,
    demostracion: true,
  },
];

const CLAVE = "syncpass-participantes-demo-v1";

function esParticipante(valor: unknown): valor is Participante {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const participante = valor as Partial<Participante>;

  return (
    typeof participante.id === "string" &&
    typeof participante.nombre === "string" &&
    typeof participante.correo === "string" &&
    typeof participante.proyectoId === "string" &&
    typeof participante.proyectoNombre === "string" &&
    typeof participante.fechaRegistro === "string" &&
    typeof participante.asistencias === "number" &&
    typeof participante.eventosInscritos === "number" &&
    (participante.estado === "Activo" ||
      participante.estado === "Pendiente" ||
      participante.estado === "Inactivo") &&
    participante.demostracion === true
  );
}

export function cargarParticipantesDemo(): Participante[] {
  try {
    const guardados = localStorage.getItem(CLAVE);

    if (guardados === null) {
      return participantesDemo.map((participante) => ({
        ...participante,
      }));
    }

    const datos: unknown = JSON.parse(guardados);

    if (!Array.isArray(datos)) {
      return participantesDemo.map((participante) => ({
        ...participante,
      }));
    }

    const validos = datos.filter(esParticipante);

    return validos.length > 0
      ? validos
      : participantesDemo.map((participante) => ({ ...participante }));
  } catch {
    return participantesDemo.map((participante) => ({
      ...participante,
    }));
  }
}

export function guardarParticipantesDemo(
  participantes: Participante[]
): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(participantes));
    return true;
  } catch {
    return false;
  }
}

export function restablecerParticipantesDemo(): Participante[] {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Si el almacenamiento no está disponible, igualmente se
    // restablece el estado en memoria de la pantalla.
  }

  return participantesDemo.map((participante) => ({ ...participante }));
}
