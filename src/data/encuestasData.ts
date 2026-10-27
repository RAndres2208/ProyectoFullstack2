/**
 * Datos de demostración del módulo de encuestas. Las respuestas
 * almacenadas localmente pertenecen al navegador y nunca se envían
 * al backend.
 */

export type TipoPregunta = "unica" | "multiple" | "texto";

export type OpcionEncuesta = {
  id: string;
  texto: string;
  votos: number;
};

export type PreguntaEncuesta = {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  requerida: boolean;
  opciones: OpcionEncuesta[];
  respuestasTexto: string[];
};

export type EstadoEncuesta = "Activa" | "Pendiente" | "Cerrada";

export type EncuestaDemo = {
  id: string;
  titulo: string;
  descripcion: string;
  proyectoId: string;
  proyectoNombre: string;
  estado: EstadoEncuesta;
  fechaCreacion: string;
  fechaCierre: string;
  habilitados: number;
  respondidas: number;
  preguntas: PreguntaEncuesta[];
  demostracion: true;
};

export type RespuestaLocalEncuesta = {
  encuestaId: string;
  respuestas: Record<string, string | string[]>;
  fecha: string;
};

export const encuestasDemo: EncuestaDemo[] = [
  {
    id: "ENC-001",
    titulo: "Evaluación del taller de alfabetización digital",
    descripcion:
      "Cuéntanos cómo fue tu experiencia en el taller del 16 de octubre.",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    estado: "Activa",
    fechaCreacion: "2026-10-16",
    fechaCierre: "2026-10-30",
    habilitados: 32,
    respondidas: 24,
    preguntas: [
      {
        id: "p1",
        texto: "¿Cómo calificas el taller?",
        tipo: "unica",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Excelente", votos: 10 },
          { id: "o2", texto: "Bueno", votos: 9 },
          { id: "o3", texto: "Regular", votos: 4 },
          { id: "o4", texto: "Deficiente", votos: 1 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p2",
        texto: "¿Qué temas te gustaría profundizar?",
        tipo: "multiple",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Trámites en línea", votos: 12 },
          { id: "o2", texto: "Seguridad y contraseñas", votos: 15 },
          { id: "o3", texto: "Redes sociales", votos: 9 },
          { id: "o4", texto: "Videollamadas", votos: 7 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p3",
        texto: "¿Qué mejorarías de la actividad?",
        tipo: "texto",
        requerida: false,
        opciones: [],
        respuestasTexto: [
          "Más tiempo para practicar con el celular.",
          "Tener material impreso con los pasos principales.",
          "Me gustaría una segunda sesión sobre trámites.",
          "El lugar estaba bien, pero faltaban enchufes.",
        ],
      },
    ],
    demostracion: true,
  },
  {
    id: "ENC-002",
    titulo: "Hábitos de reciclaje en el barrio",
    descripcion:
      "Encuesta breve para orientar las próximas jornadas de reciclaje.",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    estado: "Activa",
    fechaCreacion: "2026-10-20",
    fechaCierre: "2026-11-05",
    habilitados: 22,
    respondidas: 12,
    preguntas: [
      {
        id: "p1",
        texto: "¿Con qué frecuencia reciclas en tu hogar?",
        tipo: "unica",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Siempre", votos: 3 },
          { id: "o2", texto: "Casi siempre", votos: 4 },
          { id: "o3", texto: "A veces", votos: 3 },
          { id: "o4", texto: "Nunca", votos: 2 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p2",
        texto: "¿Qué residuos separas actualmente?",
        tipo: "multiple",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Plástico", votos: 8 },
          { id: "o2", texto: "Vidrio", votos: 5 },
          { id: "o3", texto: "Orgánico", votos: 7 },
          { id: "o4", texto: "Papel y cartón", votos: 6 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p3",
        texto: "¿Qué necesitas para reciclar mejor?",
        tipo: "texto",
        requerida: false,
        opciones: [],
        respuestasTexto: [
          "Más contenedores cerca de casa.",
          "Una guía simple sobre qué va en cada recipiente.",
          "Jornadas de reciclaje los fines de semana.",
          "Información sobre qué hacen con los residuos.",
        ],
      },
    ],
    demostracion: true,
  },
  {
    id: "ENC-003",
    titulo: "Actividad física en el barrio",
    descripcion:
      "Queremos conocer tus preferencias para la próxima temporada.",
    proyectoId: "barrio-movimiento",
    proyectoNombre: "Barrio en movimiento",
    estado: "Pendiente",
    fechaCreacion: "2026-10-22",
    fechaCierre: "2026-11-20",
    habilitados: 26,
    respondidas: 0,
    preguntas: [
      {
        id: "p1",
        texto: "¿Cuántas veces por semana realizas actividad física?",
        tipo: "unica",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Ninguna o una vez", votos: 0 },
          { id: "o2", texto: "Dos o tres veces", votos: 0 },
          { id: "o3", texto: "Cuatro o cinco veces", votos: 0 },
          { id: "o4", texto: "Todos los días", votos: 0 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p2",
        texto: "¿Qué actividades te gustaría sumar?",
        tipo: "texto",
        requerida: false,
        opciones: [],
        respuestasTexto: [],
      },
    ],
    demostracion: true,
  },
  {
    id: "ENC-004",
    titulo: "Satisfacción general 2025",
    descripcion:
      "Resultados de la encuesta de cierre del ciclo anterior.",
    proyectoId: "conecta-barrio",
    proyectoNombre: "Conecta Barrio",
    estado: "Cerrada",
    fechaCreacion: "2025-11-01",
    fechaCierre: "2025-12-01",
    habilitados: 30,
    respondidas: 26,
    preguntas: [
      {
        id: "p1",
        texto: "¿Qué tan satisfecho estás con las actividades del proyecto?",
        tipo: "unica",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Muy satisfecho", votos: 12 },
          { id: "o2", texto: "Satisfecho", votos: 9 },
          { id: "o3", texto: "Neutral", votos: 3 },
          { id: "o4", texto: "Insatisfecho", votos: 2 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p2",
        texto: "Comentarios finales",
        tipo: "texto",
        requerida: false,
        opciones: [],
        respuestasTexto: [
          "Buen acompañamiento de los voluntarios.",
          "Me gustaría que las actividades fueran más frecuentes.",
          "Las sedes son accesibles y cómodas.",
          "Faltó difusión en algunos sectores.",
          "Excelente iniciativa para las personas mayores.",
        ],
      },
    ],
    demostracion: true,
  },
  {
    id: "ENC-005",
    titulo: "Evaluación del huerto comunitario",
    descripcion:
      "Percepción de las personas que participaron en septiembre.",
    proyectoId: "semillas-comunidad",
    proyectoNombre: "Semillas de comunidad",
    estado: "Cerrada",
    fechaCreacion: "2026-09-01",
    fechaCierre: "2026-09-15",
    habilitados: 20,
    respondidas: 15,
    preguntas: [
      {
        id: "p1",
        texto: "¿Cómo evaluarías el huerto comunitario?",
        tipo: "unica",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Excelente", votos: 6 },
          { id: "o2", texto: "Bueno", votos: 6 },
          { id: "o3", texto: "Regular", votos: 2 },
          { id: "o4", texto: "Deficiente", votos: 1 },
        ],
        respuestasTexto: [],
      },
      {
        id: "p2",
        texto: "¿Qué mejoras priorizarías?",
        tipo: "multiple",
        requerida: true,
        opciones: [
          { id: "o1", texto: "Sistema de riego", votos: 8 },
          { id: "o2", texto: "Herramientas", votos: 6 },
          { id: "o3", texto: "Horarios de cuidado", votos: 5 },
          { id: "o4", texto: "Más espacios de cultivo", votos: 4 },
        ],
        respuestasTexto: [],
      },
    ],
    demostracion: true,
  },
];

const CLAVE_CREADAS = "syncpass-encuestas-creadas-demo-v1";
const CLAVE_RESPUESTAS = "syncpass-respuestas-encuestas-demo-v1";

function esPregunta(valor: unknown): valor is PreguntaEncuesta {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const pregunta = valor as Partial<PreguntaEncuesta>;

  return (
    typeof pregunta.id === "string" &&
    typeof pregunta.texto === "string" &&
    (pregunta.tipo === "unica" ||
      pregunta.tipo === "multiple" ||
      pregunta.tipo === "texto") &&
    typeof pregunta.requerida === "boolean" &&
    Array.isArray(pregunta.opciones) &&
    Array.isArray(pregunta.respuestasTexto)
  );
}

function esEncuesta(valor: unknown): valor is EncuestaDemo {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const encuesta = valor as Partial<EncuestaDemo>;

  return (
    typeof encuesta.id === "string" &&
    typeof encuesta.titulo === "string" &&
    typeof encuesta.descripcion === "string" &&
    typeof encuesta.proyectoId === "string" &&
    typeof encuesta.proyectoNombre === "string" &&
    (encuesta.estado === "Activa" ||
      encuesta.estado === "Pendiente" ||
      encuesta.estado === "Cerrada") &&
    typeof encuesta.fechaCreacion === "string" &&
    typeof encuesta.fechaCierre === "string" &&
    typeof encuesta.habilitados === "number" &&
    typeof encuesta.respondidas === "number" &&
    Array.isArray(encuesta.preguntas) &&
    encuesta.preguntas.length > 0 &&
    encuesta.preguntas.every(esPregunta) &&
    encuesta.demostracion === true
  );
}

export function cargarEncuestasDemo(): EncuestaDemo[] {
  const base = encuestasDemo.map((encuesta) => ({
    ...encuesta,
    preguntas: encuesta.preguntas.map((pregunta) => ({
      ...pregunta,
      opciones: pregunta.opciones.map((opcion) => ({ ...opcion })),
      respuestasTexto: [...pregunta.respuestasTexto],
    })),
  }));

  try {
    const guardadas = localStorage.getItem(CLAVE_CREADAS);

    if (guardadas === null) {
      return base;
    }

    const datos: unknown = JSON.parse(guardadas);

    if (!Array.isArray(datos)) {
      return base;
    }

    return [...base, ...datos.filter(esEncuesta)];
  } catch {
    return base;
  }
}

export function guardarEncuestaDemo(encuesta: EncuestaDemo): boolean {
  try {
    const guardadas = localStorage.getItem(CLAVE_CREADAS);
    const datos: unknown = guardadas === null ? [] : JSON.parse(guardadas);
    const creadas = Array.isArray(datos) ? datos.filter(esEncuesta) : [];

    localStorage.setItem(
      CLAVE_CREADAS,
      JSON.stringify([...creadas, encuesta])
    );

    return true;
  } catch {
    return false;
  }
}

export function cargarRespuestasEncuestasDemo(): RespuestaLocalEncuesta[] {
  try {
    const guardadas = localStorage.getItem(CLAVE_RESPUESTAS);

    if (guardadas === null) {
      return [];
    }

    const datos: unknown = JSON.parse(guardadas);

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.filter(
      (valor): valor is RespuestaLocalEncuesta => {
        if (typeof valor !== "object" || valor === null) {
          return false;
        }

        const respuesta = valor as Partial<RespuestaLocalEncuesta>;

        return (
          typeof respuesta.encuestaId === "string" &&
          typeof respuesta.fecha === "string" &&
          typeof respuesta.respuestas === "object" &&
          respuesta.respuestas !== null
        );
      }
    );
  } catch {
    return [];
  }
}

export function guardarRespuestaEncuestasDemo(
  respuesta: RespuestaLocalEncuesta
): boolean {
  try {
    const guardadas = localStorage.getItem(CLAVE_RESPUESTAS);
    const datos: unknown = guardadas === null ? [] : JSON.parse(guardadas);
    const respuestas = Array.isArray(datos)
      ? datos.filter(
          (valor): valor is RespuestaLocalEncuesta =>
            typeof valor === "object" &&
            valor !== null &&
            typeof (valor as Partial<RespuestaLocalEncuesta>)
              .encuestaId === "string"
        )
      : [];

    localStorage.setItem(
      CLAVE_RESPUESTAS,
      JSON.stringify([...respuestas, respuesta])
    );

    return true;
  } catch {
    return false;
  }
}

export function restablecerEncuestasDemo(): void {
  try {
    localStorage.removeItem(CLAVE_CREADAS);
    localStorage.removeItem(CLAVE_RESPUESTAS);
  } catch {
    // El estado en memoria igualmente se restablece desde la pantalla.
  }
}
