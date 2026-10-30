import { useAuth } from "react-oidc-context";

export type RolUsuario = "docente" | "estudiante" | "desconocido";

const GRUPOS_DOCENTE = ["Docente", "DOCENTE", "docente", "Coordinador", "COORDINADOR"];
const GRUPOS_ESTUDIANTE = ["Estudiante", "ESTUDIANTE", "estudiante", "Alumno", "ALUMNO"];

function obtenerRolDesdePerfil(perfil: any): RolUsuario {
  if (!perfil) return "desconocido";
  
  // Intentar obtener desde grupos de Cognito
  const grupos = perfil["cognito:groups"] || perfil.groups || [];
  if (Array.isArray(grupos)) {
    if (grupos.some((g: string) => GRUPOS_DOCENTE.includes(g))) return "docente";
    if (grupos.some((g: string) => GRUPOS_ESTUDIANTE.includes(g))) return "estudiante";
  }
  
  // Intentar desde claim personalizado
  const rol = perfil["custom:rol"] || perfil.rol || perfil.role;
  if (rol) {
    const r = String(rol).toLowerCase();
    if (r.includes("docente") || r.includes("coordinador")) return "docente";
    if (r.includes("estudiante") || r.includes("alumno")) return "estudiante";
  }
  
  return "desconocido";
}

export function useRol(): { rol: RolUsuario; cargando: boolean; esDocente: boolean; esEstudiante: boolean } {
  const auth = useAuth();
  const rol = obtenerRolDesdePerfil(auth.user?.profile);
  
  return {
    rol,
    cargando: auth.isLoading,
    esDocente: rol === "docente",
    esEstudiante: rol === "estudiante"
  };
}

export function obtenerNombreUsuario(perfil: any): string {
  if (!perfil) return "Usuario";
  return perfil.name || perfil["given_name"] || perfil.email?.split("@")[0] || "Usuario";
}
