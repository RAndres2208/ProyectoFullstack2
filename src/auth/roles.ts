import { useMemo } from "react";
import { useAuth } from "react-oidc-context";

/**
 * Roles funcionales de SyncPass. Los nombres canónicos se mantienen en
 * minúsculas para uso interno; la etiqueta visible se define en ROLES.
 */
export type RolSyncPass =
  | "estudiante"
  | "profesor"
  | "coordinador"
  | "administrador";

/** Tipo legado para componentes que todavía consumen useRol(). */
export type RolUsuario = "docente" | "estudiante" | "desconocido";

export type DefinicionRol = {
  id: RolSyncPass;
  etiqueta: string;
  etiquetaGrupo: string;
  descripcion: string;
  rutaInicio: string;
  icono: string;
};

export const ROLES: Record<RolSyncPass, DefinicionRol> = {
  estudiante: {
    id: "estudiante",
    etiqueta: "Estudiante",
    etiquetaGrupo: "ESTUDIANTE",
    descripcion:
      "Consulta tus cursos, asistencia, encuestas, proyectos y perfil académico.",
    rutaInicio: "/estudiante/dashboard",
    icono: "🎓",
  },
  profesor: {
    id: "profesor",
    etiqueta: "Docente",
    etiquetaGrupo: "PROFESOR",
    descripcion:
      "Gestiona cursos, estudiantes asignados y registros de asistencia.",
    rutaInicio: "/docente/dashboard",
    icono: "📚",
  },
  coordinador: {
    id: "coordinador",
    etiqueta: "Coordinador",
    etiquetaGrupo: "COORDINADOR",
    descripcion:
      "Revisa indicadores académicos de tu ámbito, docentes y reportes.",
    rutaInicio: "/coordinador/dashboard",
    icono: "📊",
  },
  administrador: {
    id: "administrador",
    etiqueta: "Administrador",
    etiquetaGrupo: "ADMINISTRADOR",
    descripcion:
      "Accede a los módulos de usuarios, roles, cursos y configuración general.",
    rutaInicio: "/administrador/dashboard",
    icono: "🛡️",
  },
};

/** Orden de presentación en selectores y tarjetas. */
export const ORDEN_ROLES: RolSyncPass[] = [
  "estudiante",
  "profesor",
  "coordinador",
  "administrador",
];

/**
 * Prioridad para elegir la vista inicial cuando la sesión tiene varios
 * grupos. Es solo una preferencia visual: no modifica permisos.
 */
const ORDEN_PRIORIDAD: RolSyncPass[] = [
  "administrador",
  "coordinador",
  "profesor",
  "estudiante",
];

const GRUPOS_POR_ROL: Record<RolSyncPass, string[]> = {
  estudiante: ["ESTUDIANTE", "ESTUDIANTES", "ALUMNO", "ALUMNA"],
  profesor: ["PROFESOR", "PROFESORES", "DOCENTE", "DOCENTES"],
  coordinador: ["COORDINADOR", "COORDINADORA", "COORDINADORES"],
  administrador: ["ADMINISTRADOR", "ADMINISTRADORA", "ADMINISTRADORES", "ADMIN"],
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function normalizarClave(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function valoresDeClaim(
  claims: Record<string, unknown>,
  clave: string
): string[] {
  const valor = claims[clave];

  if (typeof valor === "string") {
    const texto = valor.trim();

    if (!texto) {
      return [];
    }

    // Algunos emisores entregan listas serializadas como string.
    if (
      texto.startsWith("[") ||
      texto.includes(",") ||
      texto.includes(" ")
    ) {
      return texto
        .replace(/[[\]"']/g, " ")
        .split(/[\s,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [texto];
  }

  if (Array.isArray(valor)) {
    return valor.filter(
      (item): item is string => typeof item === "string"
    );
  }

  return [];
}

/**
 * Interpreta grupos y claims de rol. Los grupos de Cognito tienen prioridad
 * conceptual, pero se combinan con el claim personalizado para tolerar
 * configuraciones heredadas.
 */
export function interpretarRoles(claims: unknown): RolSyncPass[] {
  if (!esRegistro(claims)) {
    return [];
  }

  const candidatos: string[] = [];

  for (const clave of [
    "cognito:groups",
    "groups",
    "custom:groups",
    "custom:rol",
    "rol",
    "role",
    "roles",
  ]) {
    candidatos.push(...valoresDeClaim(claims, clave));
  }

  const encontrados = new Set<RolSyncPass>();

  for (const candidato of candidatos) {
    const normalizado = normalizarClave(candidato);

    for (const rol of ORDEN_ROLES) {
      if (GRUPOS_POR_ROL[rol].includes(normalizado)) {
        encontrados.add(rol);
      }
    }
  }

  return ORDEN_ROLES.filter((rol) => encontrados.has(rol));
}

function unirRoles(...listas: RolSyncPass[][]): RolSyncPass[] {
  const encontrados = new Set<RolSyncPass>();

  for (const lista of listas) {
    for (const rol of lista) {
      encontrados.add(rol);
    }
  }

  return ORDEN_ROLES.filter((rol) => encontrados.has(rol));
}

function decodificarBase64Url(texto: string): string {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const binario = window.atob(`${base64}${relleno}`);
  const bytes = Uint8Array.from(binario, (caracter) =>
    caracter.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

/**
 * Decodifica los claims del access token únicamente para navegación.
 * No valida la firma: la autorización real la sigue haciendo la API.
 */
export function decodificarClaimsAccessToken(
  token: string | undefined
): Record<string, unknown> | null {
  if (!token) {
    return null;
  }

  const partes = token.split(".");

  if (partes.length < 2) {
    return null;
  }

  try {
    const json = decodificarBase64Url(partes[1]);
    const datos: unknown = JSON.parse(json);

    return esRegistro(datos) ? datos : null;
  } catch {
    return null;
  }
}

export function parseRolSyncPass(valor: string): RolSyncPass | null {
  const normalizado = valor.trim().toLowerCase();

  if (normalizado === "docente") {
    return "profesor";
  }

  return ORDEN_ROLES.find((rol) => rol === normalizado) ?? null;
}

export function rolPrincipal(roles: RolSyncPass[]): RolSyncPass | null {
  return (
    ORDEN_PRIORIDAD.find((rol) => roles.includes(rol)) ??
    ORDEN_ROLES.find((rol) => roles.includes(rol)) ??
    null
  );
}

export function rutaInicioDeRol(rol: RolSyncPass): string {
  return ROLES[rol].rutaInicio;
}

export function rolDesdeRuta(ruta: string): RolSyncPass | null {
  if (ruta.startsWith("/estudiante")) {
    return "estudiante";
  }

  if (ruta.startsWith("/docente")) {
    return "profesor";
  }

  if (ruta.startsWith("/coordinador")) {
    return "coordinador";
  }

  if (ruta.startsWith("/administrador")) {
    return "administrador";
  }

  return null;
}

export type EstadoRoles = {
  roles: RolSyncPass[];
  cargando: boolean;
  autenticado: boolean;
};

export function useRoles(): EstadoRoles {
  const auth = useAuth();

  const roles = useMemo(() => {
    const claimsAccess = decodificarClaimsAccessToken(
      auth.user?.access_token
    );

    return unirRoles(
      interpretarRoles(claimsAccess),
      interpretarRoles(auth.user?.profile)
    );
  }, [auth.user]);

  return {
    roles,
    cargando: auth.isLoading,
    autenticado: auth.isAuthenticated,
  };
}

/**
 * Compatibilidad con componentes heredados. La navegación nueva debe usar
 * useRoles()/usePerfilActivo() para conservar múltiples grupos.
 */
export function useRol(): {
  rol: RolUsuario;
  cargando: boolean;
  esDocente: boolean;
  esEstudiante: boolean;
} {
  const { roles, cargando } = useRoles();
  const esDocente =
    roles.includes("profesor") || roles.includes("coordinador");
  const esEstudiante = roles.includes("estudiante");

  const rol: RolUsuario = esDocente
    ? "docente"
    : esEstudiante
      ? "estudiante"
      : "desconocido";

  return {
    rol,
    cargando,
    esDocente,
    esEstudiante,
  };
}

export function obtenerNombreUsuario(perfil: unknown): string {
  if (!esRegistro(perfil)) {
    return "Usuario";
  }

  const nombre = perfil.name ?? perfil.given_name;
  const correo = perfil.email;

  if (typeof nombre === "string" && nombre.trim()) {
    return nombre.trim();
  }

  if (typeof correo === "string" && correo.trim()) {
    return correo.split("@")[0] ?? "Usuario";
  }

  return "Usuario";
}
