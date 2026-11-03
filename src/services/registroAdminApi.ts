/**
 * Cliente HTTP del registro administrativo de usuarios de SyncPass.
 *
 * Endpoint: POST /api/auth/registro
 * Permiso requerido en el backend: ADMINISTRADOR.
 *
 * No implementa listado, edición ni eliminación de cuentas.
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
  phoneNumber: string;
  roles: RolRegistro[];
};

export type UsuarioRegistrado = {
  id: string;
  email: string;
  nombre: string;
  roles: RolRegistro[];
};

export type TipoErrorRegistro = TipoErrorApi;

export class ErrorRegistro extends ErrorApi {
  constructor(
    tipo: TipoErrorRegistro,
    mensaje: string,
    status?: number
  ) {
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
const PATRON_TELEFONO = /^\+[1-9]\d{1,14}$/;

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function esRolRegistro(
  valor: unknown
): valor is RolRegistro {
  return (
    typeof valor === "string" &&
    ROLES_REGISTRO.some((rol) => rol === valor)
  );
}

function comoErrorRegistro(
  error: unknown
): ErrorRegistro {
  if (error instanceof ErrorRegistro) {
    return error;
  }

  if (error instanceof ErrorApi) {
    return new ErrorRegistro(
      error.tipo,
      error.message,
      error.status
    );
  }

  return new ErrorRegistro(
    "red",
    "No fue posible completar el registro administrativo."
  );
}

/**
 * Valida la solicitud antes de enviarla.
 */
export function validarRegistroAdministrativo(
  datos: RegistroAdministrativoSolicitud
): RegistroAdministrativoSolicitud {
  const email = datos.email.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  const password = datos.password;
  const phoneNumber = datos.phoneNumber.trim();
  const roles = Array.from(new Set(datos.roles));

  if (!PATRON_EMAIL.test(email)) {
    throw new ErrorRegistro(
      "solicitud",
      "Ingresa un correo electrónico válido."
    );
  }

  if (
    password.length < 8 ||
    password.length > 64
  ) {
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

  if (!PATRON_TELEFONO.test(phoneNumber)) {
    throw new ErrorRegistro(
      "solicitud",
      "Ingresa un teléfono en formato internacional E.164, por ejemplo +56912345678."
    );
  }

  if (roles.length === 0) {
    throw new ErrorRegistro(
      "solicitud",
      "Selecciona al menos un rol para el usuario."
    );
  }

  if (!roles.every(esRolRegistro)) {
    throw new ErrorRegistro(
      "solicitud",
      "Los roles permitidos son ESTUDIANTE, PROFESOR, COORDINADOR y ADMINISTRADOR."
    );
  }

  return {
    email,
    password,
    nombre,
    phoneNumber,
    roles,
  };
}

/**
 * Comprueba que la respuesta corresponde al UsuarioResponse
 * definido por el backend.
 *
 * No recibe ni devuelve contraseñas.
 */
export function validarUsuarioRegistrado(
  valor: unknown
): UsuarioRegistrado {
  if (!esObjeto(valor)) {
    throw new ErrorRegistro(
      "respuesta",
      "La API devolvió un usuario con un formato inesperado."
    );
  }

  const { id, email, nombre, roles } = valor;

  if (
    typeof id !== "string" ||
    !id.trim()
  ) {
    throw new ErrorRegistro(
      "respuesta",
      "La respuesta no contiene un identificador de usuario válido."
    );
  }

  if (
    typeof email !== "string" ||
    !PATRON_EMAIL.test(email.trim())
  ) {
    throw new ErrorRegistro(
      "respuesta",
      "La respuesta contiene un correo electrónico inválido."
    );
  }

  if (
    typeof nombre !== "string" ||
    !nombre.trim()
  ) {
    throw new ErrorRegistro(
      "respuesta",
      "La respuesta no contiene un nombre válido."
    );
  }

  if (
    !Array.isArray(roles) ||
    roles.length === 0 ||
    !roles.every(esRolRegistro)
  ) {
    throw new ErrorRegistro(
      "respuesta",
      "La respuesta contiene roles desconocidos o inválidos."
    );
  }

  return {
    id: id.trim(),
    email: email.trim(),
    nombre: nombre.trim(),
    roles: Array.from(new Set(roles as RolRegistro[])),
  };
}

type OpcionesRegistro = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

/**
 * Registra un usuario mediante el backend.
 *
 * El backend debe validar:
 * - JWT de Cognito.
 * - Pertenencia al grupo ADMINISTRADOR.
 * - Permisos para asignar los roles solicitados.
 *
 * La contraseña nunca se registra en consola
 * ni se devuelve en UsuarioRegistrado.
 */
export async function registrarUsuarioAdministrativoApi(
  datos: RegistroAdministrativoSolicitud,
  accessToken: string,
  opciones: OpcionesRegistro = {}
): Promise<UsuarioRegistrado> {
  const cuerpo = validarRegistroAdministrativo(datos);

  try {
    return await solicitarApi<UsuarioRegistrado>({
      ruta: "/api/auth/registro",
      accessToken,
      contexto: "registrar el usuario",
      metodo: "POST",
      cuerpo,
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarUsuarioRegistrado,
    });
  } catch (error) {
    throw comoErrorRegistro(error);
  }
}
