import type {
  DocenteAcademico,
  EstudianteAcademico,
} from "../types/academico";
import { normalizarTexto } from "./format";

type DatosPerfil = {
  nombre: string;
  email: string;
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function leerDatosPerfil(perfil: unknown): DatosPerfil {
  if (!esRegistro(perfil)) {
    return { nombre: "", email: "" };
  }

  const nombre =
    typeof perfil.name === "string"
      ? perfil.name
      : typeof perfil.given_name === "string"
        ? perfil.given_name
        : "";

  const email = typeof perfil.email === "string" ? perfil.email : "";

  return {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
  };
}

function coincidePersona(
  datos: DatosPerfil,
  persona: { nombre: string; email: string }
): boolean {
  if (datos.email && persona.email.toLowerCase() === datos.email) {
    return true;
  }

  if (datos.nombre && normalizarTexto(persona.nombre) === normalizarTexto(datos.nombre)) {
    return true;
  }

  return false;
}

/**
 * Intenta vincular la sesión de Cognito con una ficha docente de demostración.
 * Cognito todavía no entrega un identificador académico, por lo que el vínculo
 * se resuelve por correo o nombre. Si no hay coincidencia, se devuelve null y
 * la pantalla debe mostrar el alcance completo con una advertencia.
 */
export function resolverDocenteActivo(
  perfil: unknown,
  docentes: DocenteAcademico[]
): { docente: DocenteAcademico | null; vinculado: boolean } {
  const datos = leerDatosPerfil(perfil);

  if (!datos.nombre && !datos.email) {
    return { docente: null, vinculado: false };
  }

  const docente =
    docentes.find((candidato) => coincidePersona(datos, candidato)) ?? null;

  return { docente, vinculado: Boolean(docente) };
}

/**
 * Intenta vincular la sesión de Cognito con una ficha estudiantil. En modo
 * demostración se usa la primera ficha como referencia visual, pero se informa
 * que el vínculo no es real.
 */
export function resolverEstudianteActivo(
  perfil: unknown,
  estudiantes: EstudianteAcademico[]
): { estudiante: EstudianteAcademico | null; vinculado: boolean } {
  const datos = leerDatosPerfil(perfil);

  if (datos.nombre || datos.email) {
    const encontrado =
      estudiantes.find((candidato) => coincidePersona(datos, candidato)) ??
      null;

    if (encontrado) {
      return { estudiante: encontrado, vinculado: true };
    }
  }

  return {
    estudiante: estudiantes[0] ?? null,
    vinculado: false,
  };
}
