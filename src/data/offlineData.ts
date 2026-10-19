
export type TipoRegistro = "asistencia" | "encuesta";

export type RegistroLocal = {
  id: string;
  tipo: TipoRegistro;
  eventoId: string;
  identificador: string;
  creadoEn: string;
  estado: "pendiente";
  demostracion: true;
};

const CLAVE = "syncpass-registros-demo-v1";

const registrosIniciales: RegistroLocal[] = [
  {
    id: "demo-a-1",
    tipo: "asistencia",
    eventoId: "EVT-016",
    identificador: "LOC-A022",
    creadoEn: "2026-10-16T10:31:00",
    estado: "pendiente",
    demostracion: true,
  },
  {
    id: "demo-a-2",
    tipo: "asistencia",
    eventoId: "EVT-016",
    identificador: "LOC-A023",
    creadoEn: "2026-10-16T10:32:00",
    estado: "pendiente",
    demostracion: true,
  },
  {
    id: "demo-a-3",
    tipo: "asistencia",
    eventoId: "EVT-016",
    identificador: "LOC-A024",
    creadoEn: "2026-10-16T10:33:00",
    estado: "pendiente",
    demostracion: true,
  },
  {
    id: "demo-e-1",
    tipo: "encuesta",
    eventoId: "EVT-016",
    identificador: "LOC-E008",
    creadoEn: "2026-10-16T10:34:00",
    estado: "pendiente",
    demostracion: true,
  },
  {
    id: "demo-e-2",
    tipo: "encuesta",
    eventoId: "EVT-016",
    identificador: "LOC-E009",
    creadoEn: "2026-10-16T10:35:00",
    estado: "pendiente",
    demostracion: true,
  },
];

export function cargarRegistros(): RegistroLocal[] {
  const guardados = localStorage.getItem(CLAVE);

  if (guardados === null) {
    const iniciales = registrosIniciales.map((r) => ({ ...r }));
    guardarRegistros(iniciales);
    return iniciales;
  }

  const datos: unknown = JSON.parse(guardados);

  if (!Array.isArray(datos)) {
    throw new Error("Formato de registros locales inválido");
  }

  return datos.filter((registro): registro is RegistroLocal => {
    if (typeof registro !== "object" || registro === null) {
      return false;
    }

    const r = registro as Partial<RegistroLocal>;

    return (
      typeof r.id === "string" &&
      typeof r.identificador === "string" &&
      typeof r.eventoId === "string" &&
      typeof r.creadoEn === "string" &&
      (r.tipo === "asistencia" || r.tipo === "encuesta") &&
      r.estado === "pendiente" &&
      r.demostracion === true
    );
  });
}

export function guardarRegistros(registros: RegistroLocal[]) {
  localStorage.setItem(CLAVE, JSON.stringify(registros));
}
