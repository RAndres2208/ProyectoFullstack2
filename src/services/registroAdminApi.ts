/**
 * Cliente HTTP del registro administrativo de usuarios.
 *
 * Contrato confirmado:
 * - POST {VITE_API_URL}/api/auth/registro
 * - Requiere rol ADMINISTRADOR (validado por el backend).
 *
 * Solicitud:
 * { email, password (8-64), nombre (máx. 100), roles }
 *
 * La API solo confirma el alta. No existen endpoints confirmados para
 * listar, editar o eliminar cuentas, por lo que este servicio no los crea.
 */

import {
  ErrorApi,
  solicitarApi,
  type TipoErrorApi,
} from "./apiClient";

export type RolRegistro =
  | "ESTUDIANTE"
  | "PROFESOR"
  | "COORDINADOR"
  | "ADMINISTRADOR";

export type RegistroAdministrativoSolicitud = {
  email: string;
  password: string;
  nombre: string;
  roles: RolRegistro[];
};

export type TipoErrorRegistro = TipoErrorApi;

export class ErrorRegistro extends ErrorApi {
  constructor(tipo: TipoErrorRegistro, mensaje: string, status?: number) {
    super(tipo, mensaje, status);
    this.name = "ErrorRegistro";
  }
}

export const ROLES_REGISTRO: RolRegistro[] = [
  "ESTUDIANTE",
  "PROFESOR",
  "COORDINADOR",
  "ADMINISTRADOR",
];

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function comoErrorRegistro(error: unknown): ErrorRegistro {
  if (error instanceof ErrorRegistro) {
    return error;
  }

  if (error instanceof ErrorApi) {
    return new ErrorRegistro(error.tipo, error.message, error.status);
  }

  return new ErrorRegistro(
    "red",
    "No fue posible completar el registro administrativo."
  );
}

export function validarRegistroAdministrativo(
  datos: RegistroAdministrativoSolicitud
): RegistroAdministrativoSolicitud {
  const email = datos.email.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  const password = datos.password;
  const roles = Array.from(new Set(datos.roles));

  if (!PATRON_EMAIL.test(email)) {
    throw new ErrorRegistro(
      "solicitud",
      "Ingresa un correo electrónico válido."
    );
  }

  if (password.length < 8 || password.length > 64) {
    throw new ErrorRegistro(
      "solicitud",
      "La contraseña debe tener entre 8 y 64 caracteres."
    );
  }

  if (!nombre || nombre.length > 100) {
    throw new ErrorRegistro(
      "solicitud",
      "El nombre es obligatorio y debe tener como máximo 100 caracteres."
    );
  }

  if (roles.length === 0) {
    throw new ErrorRegistro(
      "solicitud",
      "Selecciona al menos un rol para el usuario."
    );
  }

  if (roles.some((rol) => !ROLES_REGISTRO.includes(rol))) {
    throw new ErrorRegistro(
      "solicitud",
      "Los roles permitidos son ESTUDIANTE, PROFESOR, COORDINADOR y ADMINISTRADOR."
    );
  }

  return { email, password, nombre, roles };
}

/**
 * Crea una cuenta mediante el endpoint administrativo.
 * La contraseña solo viaja en el cuerpo de la solicitud y nunca se registra.
 */
export async function registrarUsuarioAdministrativoApi(
  datos: RegistroAdministrativoSolicitud,
  accessToken: string,
  opciones: {
    signal?: AbortSignal;
    timeoutMs?: number;
  } = {}
): Promise<void> {
  const cuerpo = validarRegistroAdministrativo(datos);

  try {
    await solicitarApi<void>({
      ruta: "/api/auth/registro",
      accessToken,
      contexto: "registrar el usuario",
      metodo: "POST",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      // El alta puede responder data null; solo se exige success === true.
      permitirDataNula: true,
    });
  } catch (error) {
    throw comoErrorRegistro(error);
  }
}
