/**
 * Historial de demostración. No corresponde a una auditoría real del
 * backend: los registros existen únicamente para validar la interfaz.
 */

export type TipoActividad =
  | "Asistencia"
  | "Proyecto"
  | "Encuesta"
  | "Participante"
  | "Sincronización"
  | "Sesión";

export type EstadoActividad = "Completado" | "Pendiente" | "Error";

export type ActividadDemo = {
  id: string;
  fecha: string;
  tipo: TipoActividad;
  descripcion: string;
  actor: string;
  estado: EstadoActividad;
  detalle: string;
  referencia?: string;
  demostracion: true;
};

export const actividadesDemo: ActividadDemo[] = [
  {
    id: "HIS-021",
    fecha: "2026-10-26T09:42:00",
    tipo: "Sesión",
    descripcion: "Inicio de sesión con Cognito",
    actor: "Robinson · Docente",
    estado: "Completado",
    detalle:
      "Sesión iniciada mediante Amazon Cognito. El historial no almacena tokens ni credenciales.",
    referencia: "Sesión actual",
    demostracion: true,
  },
  {
    id: "HIS-020",
    fecha: "2026-10-26T09:36:00",
    tipo: "Asistencia",
    descripcion: "Asistencia registrada para SP-024",
    actor: "Monitor · Voluntario",
    estado: "Completado",
    detalle:
      "Registro de demostración asociado al evento EVT-026. No se envió información al servidor.",
    referencia: "EVT-026 · SP-024",
    demostracion: true,
  },
  {
    id: "HIS-019",
    fecha: "2026-10-26T09:35:00",
    tipo: "Sincronización",
    descripcion: "Intento de sincronización manual",
    actor: "Robinson · Docente",
    estado: "Pendiente",
    detalle:
      "La sincronización con Spring Boot todavía no está habilitada en esta etapa. Los registros permanecen locales.",
    referencia: "5 registros pendientes",
    demostracion: true,
  },
  {
    id: "HIS-018",
    fecha: "2026-10-25T18:10:00",
    tipo: "Encuesta",
    descripcion: "Encuesta publicada: Hábitos de reciclaje",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Publicación de demostración dentro del navegador. No existe persistencia en el backend.",
    referencia: "ENC-002",
    demostracion: true,
  },
  {
    id: "HIS-017",
    fecha: "2026-10-25T17:48:00",
    tipo: "Participante",
    descripcion: "Participante SP-018 actualizado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Se actualizaron datos de contacto en el módulo de demostración. Los cambios se guardaron en este navegador.",
    referencia: "SP-018 · Rosa Cárdenas",
    demostracion: true,
  },
  {
    id: "HIS-016",
    fecha: "2026-10-24T19:12:00",
    tipo: "Asistencia",
    descripcion: "Cierre de asistencia del evento EVT-024",
    actor: "Sistema SyncPass",
    estado: "Completado",
    detalle:
      "Cierre simulado del registro de asistencia. Total de demostración: 20 asistentes de 26 habilitados.",
    referencia: "EVT-024",
    demostracion: true,
  },
  {
    id: "HIS-015",
    fecha: "2026-10-24T17:05:00",
    tipo: "Asistencia",
    descripcion: "Asistencias pendientes de sincronizar",
    actor: "Sistema SyncPass",
    estado: "Pendiente",
    detalle:
      "Tres registros locales esperan una integración real con la API. No se realizó ninguna llamada HTTP.",
    referencia: "3 registros",
    demostracion: true,
  },
  {
    id: "HIS-014",
    fecha: "2026-10-23T16:22:00",
    tipo: "Proyecto",
    descripcion: "Proyecto Barrio en movimiento marcado como finalizado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Cambio de estado de demostración. El backend todavía no expone una operación de actualización de proyectos.",
    referencia: "Barrio en movimiento",
    demostracion: true,
  },
  {
    id: "HIS-013",
    fecha: "2026-10-22T11:15:00",
    tipo: "Encuesta",
    descripcion: "Borrador de encuesta creado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Se creó el borrador de 'Actividad física en el barrio' con preguntas de opción única y texto.",
    referencia: "ENC-003",
    demostracion: true,
  },
  {
    id: "HIS-012",
    fecha: "2026-10-21T10:05:00",
    tipo: "Participante",
    descripcion: "Participante SP-017 agregado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Alta de demostración en el proyecto Barrio en movimiento. El registro quedó guardado localmente.",
    referencia: "SP-017 · Quintín Espinoza",
    demostracion: true,
  },
  {
    id: "HIS-011",
    fecha: "2026-10-20T11:40:00",
    tipo: "Asistencia",
    descripcion: "Asistencia del evento EVT-021 cerrada",
    actor: "Monitor · Voluntario",
    estado: "Completado",
    detalle:
      "La actividad registró 8 asistentes de 18 participantes habilitados en los datos de demostración.",
    referencia: "EVT-021",
    demostracion: true,
  },
  {
    id: "HIS-010",
    fecha: "2026-10-20T09:28:00",
    tipo: "Sincronización",
    descripcion: "Error de conexión con Spring Boot",
    actor: "Sistema SyncPass",
    estado: "Error",
    detalle:
      "Simulación de error HTTP 503 para representar el estado de la interfaz. No se realizó una solicitud real.",
    referencia: "HTTP 503 · simulado",
    demostracion: true,
  },
  {
    id: "HIS-009",
    fecha: "2026-10-19T15:30:00",
    tipo: "Proyecto",
    descripcion: "Proyecto Semillas de comunidad actualizado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Se agregó la próxima actividad de huerto comunitario en la vista de demostración.",
    referencia: "Semillas de comunidad",
    demostracion: true,
  },
  {
    id: "HIS-008",
    fecha: "2026-10-18T12:10:00",
    tipo: "Encuesta",
    descripcion: "Resultados revisados: Evaluación del huerto",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Revisión de resultados de ejemplo. La encuesta se encuentra cerrada y no admite nuevas respuestas.",
    referencia: "ENC-005",
    demostracion: true,
  },
  {
    id: "HIS-007",
    fecha: "2026-10-16T12:05:00",
    tipo: "Asistencia",
    descripcion: "Asistencia del evento EVT-016 cerrada",
    actor: "Monitor · Voluntario",
    estado: "Completado",
    detalle:
      "Actividad de alfabetización digital con 24 asistentes de 32 inscritos en los datos de ejemplo.",
    referencia: "EVT-016",
    demostracion: true,
  },
  {
    id: "HIS-006",
    fecha: "2026-10-16T10:00:00",
    tipo: "Sesión",
    descripcion: "Sesión de monitor iniciada",
    actor: "Monitor · Voluntario",
    estado: "Completado",
    detalle:
      "Acceso de demostración para apoyar el registro de asistencia del evento EVT-016.",
    referencia: "Sesión de monitor",
    demostracion: true,
  },
  {
    id: "HIS-005",
    fecha: "2026-10-15T09:20:00",
    tipo: "Sincronización",
    descripcion: "Verificación local de registros pendientes",
    actor: "Sistema SyncPass",
    estado: "Completado",
    detalle:
      "Se revisó el almacenamiento local del navegador. No se enviaron datos a ningún servicio externo.",
    referencia: "5 registros locales",
    demostracion: true,
  },
  {
    id: "HIS-004",
    fecha: "2026-10-14T18:35:00",
    tipo: "Participante",
    descripcion: "Participante SP-016 marcado como inactivo",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Cambio de estado de demostración en el proyecto Conecta Barrio.",
    referencia: "SP-016 · Pablo Guzmán",
    demostracion: true,
  },
  {
    id: "HIS-003",
    fecha: "2026-10-12T10:15:00",
    tipo: "Proyecto",
    descripcion: "Proyecto Conecta Barrio actualizado",
    actor: "Docente · Coordinador",
    estado: "Completado",
    detalle:
      "Se modificó la descripción de demostración y la información de eventos vinculados.",
    referencia: "Conecta Barrio",
    demostracion: true,
  },
  {
    id: "HIS-002",
    fecha: "2026-10-10T09:00:00",
    tipo: "Encuesta",
    descripcion: "Encuesta cerrada: Satisfacción general 2025",
    actor: "Sistema SyncPass",
    estado: "Completado",
    detalle:
      "Cierre simulado de la encuesta de ciclo anterior. Los resultados son datos de ejemplo.",
    referencia: "ENC-004",
    demostracion: true,
  },
  {
    id: "HIS-001",
    fecha: "2026-10-08T17:45:00",
    tipo: "Sesión",
    descripcion: "Cierre de sesión anterior",
    actor: "Robinson · Docente",
    estado: "Completado",
    detalle:
      "Registro de demostración del cierre de una sesión anterior. No contiene tokens ni datos de Cognito.",
    referencia: "Sesión finalizada",
    demostracion: true,
  },
];
