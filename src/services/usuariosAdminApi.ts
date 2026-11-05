/**
 * Cliente HTTP de la administración de usuarios de SyncPass.
 *
 * Endpoints confirmados (todos requieren ROLE_ADMINISTRADOR):
 * - GET    /api/usuarios?page=0&size=20
 * - GET    /api/usuarios/{id}
 * - DELETE /api/usuarios/{id}
 *
 * El identificador debe ser el ID real del usuario persistido
 * (Cognito + PostgreSQL), no el nombre, el correo ni el username.
 *
 * Contrato de listado:
 * { success, data: { content, page, size, totalElements, totalPages,
 *   first, last }, message, timestamp }
 *
 * Contrato de eliminación exitosa:
 * { success, data: { usuarioId, estado, cognitoEliminado,
 *   postgresEliminado }, message, timestamp }
 */

import {
  ErrorApi,
  solicitarApi,
  type TipoErrorApi,
} from "./apiClient";

export const TAMANO_PAGINA_PREDETERMINADO = 20;
export const TAMANO_PAGINA_MAXIMO = 100;

export type UsuarioAdmin = {
  id: string;
  nombre: string;
  email: string;
  roles: string[];
};

export type PaginaUsuariosAdmin = {
  content: UsuarioAdmin[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type EstadoEliminacionUsuario = "ELIMINADO" | "RECONCILIADO";

export type ResultadoEliminacionUsuario = {
  usuarioId: string;
  estado: EstadoEliminacionUsuario;
  cognitoEliminado: boolean;
  postgresEliminado: boolean;
};

export type TipoErrorUsuariosAdmin = TipoErrorApi;

export class ErrorUsuariosAdmin extends ErrorApi {
  constructor(
    tipo: TipoErrorUsuariosAdmin,
    mensaje: string,
    status?: number
  ) {
    super(tipo, mensaje, status);
    this.name = "ErrorUsuariosAdmin";
  }
}

type OpcionesConsulta = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function esEnteroNoNegativo(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= 0
  );
}

function errorRespuesta(mensaje: string): ErrorUsuariosAdmin {
  return new ErrorUsuariosAdmin("respuesta", mensaje);
}

export function normalizarPagina(pagina: number): number {
  if (!Number.isFinite(pagina)) {
    return 0;
  }

  return Math.max(0, Math.trunc(pagina));
}

export function normalizarTamano(tamano: number): number {
  if (!Number.isFinite(tamano) || tamano <= 0) {
    return TAMANO_PAGINA_PREDETERMINADO;
  }

  return Math.min(
    TAMANO_PAGINA_MAXIMO,
    Math.max(1, Math.trunc(tamano))
  );
}

/**
 * Valida una cuenta individual sin transformar los roles del backend.
 */
export function validarUsuarioAdmin(
  valor: unknown
): UsuarioAdmin {
  if (!esObjeto(valor)) {
    throw errorRespuesta(
      "La API devolvió un usuario con un formato inesperado."
    );
  }

  const { id, nombre, email, roles } = valor;

  if (typeof id !== "string" || !id.trim()) {
    throw errorRespuesta(
      "La respuesta no contiene un identificador de usuario válido."
    );
  }

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw errorRespuesta(
      "La respuesta no contiene un nombre de usuario válido."
    );
  }

  if (
    typeof email !== "string" ||
    !PATRON_EMAIL.test(email.trim())
  ) {
    throw errorRespuesta(
      "La respuesta contiene un correo electrónico inválido."
    );
  }

  if (
    !Array.isArray(roles) ||
    !roles.every(
      (rol): rol is string =>
        typeof rol === "string" && Boolean(rol.trim())
    )
  ) {
    throw errorRespuesta(
      "La respuesta contiene roles de usuario inválidos."
    );
  }

  return {
    id: id.trim(),
    nombre: nombre.trim(),
    email: email.trim(),
    roles: Array.from(
      new Set(roles.map((rol) => rol.trim()))
    ),
  };
}

/**
 * Valida la envoltura paginada de Spring Data.
 */
export function validarPaginaUsuariosAdmin(
  valor: unknown
): PaginaUsuariosAdmin {
  if (!esObjeto(valor)) {
    throw errorRespuesta(
      "La API devolvió un listado de usuarios con un formato inesperado."
    );
  }

  const {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first,
    last,
  } = valor;

  if (!Array.isArray(content)) {
    throw errorRespuesta(
      "El listado de usuarios no contiene una colección válida."
    );
  }

  if (
    !esEnteroNoNegativo(page) ||
    !esEnteroNoNegativo(size) ||
    !esEnteroNoNegativo(totalElements) ||
    !esEnteroNoNegativo(totalPages)
  ) {
    throw errorRespuesta(
      "El listado de usuarios contiene valores de paginación inválidos."
    );
  }

  if (typeof first !== "boolean" || typeof last !== "boolean") {
    throw errorRespuesta(
      "El listado de usuarios no indica correctamente sus límites."
    );
  }

  return {
    content: content.map(validarUsuarioAdmin),
    page,
    size,
    totalElements,
    totalPages,
    first,
    last,
  };
}

/**
 * Valida el objeto exacto de la baja administrativa.
 *
 * No se acepta un 200 genérico ni un cuerpo de texto: la interfaz solo
 * puede afirmar que una cuenta fue eliminada con este contrato.
 */
export function validarResultadoEliminacionUsuario(
  valor: unknown
): ResultadoEliminacionUsuario {
  if (!esObjeto(valor)) {
    throw errorRespuesta(
      "La API no devolvió el resultado de eliminación esperado."
    );
  }

  const {
    usuarioId,
    estado,
    cognitoEliminado,
    postgresEliminado,
  } = valor;

  if (typeof usuarioId !== "string" || !usuarioId.trim()) {
    throw errorRespuesta(
      "El resultado de eliminación no contiene un identificador válido."
    );
  }

  if (typeof estado !== "string" || !estado.trim()) {
    throw errorRespuesta(
      "El resultado de eliminación no contiene un estado válido."
    );
  }

  const estadoNormalizado = estado.trim().toUpperCase();

  if (
    estadoNormalizado !== "ELIMINADO" &&
    estadoNormalizado !== "RECONCILIADO"
  ) {
    throw errorRespuesta(
      "El resultado de eliminación contiene un estado desconocido."
    );
  }

  if (
    typeof cognitoEliminado !== "boolean" ||
    typeof postgresEliminado !== "boolean"
  ) {
    throw errorRespuesta(
      "El resultado de eliminación no confirma el estado de Cognito y PostgreSQL."
    );
  }

  return {
    usuarioId: usuarioId.trim(),
    estado: estadoNormalizado,
    cognitoEliminado,
    postgresEliminado,
  };
}

export function validarIdUsuario(id: string): string {
  const limpio = id.trim();

  if (!limpio) {
    throw new ErrorUsuariosAdmin(
      "solicitud",
      "No se recibió el identificador del usuario."
    );
  }

  if (limpio.length > 200 || /\s/.test(limpio)) {
    throw new ErrorUsuariosAdmin(
      "solicitud",
      "El identificador del usuario no tiene un formato válido."
    );
  }

  return limpio;
}

function comoErrorUsuariosAdmin(
  error: unknown,
  mensajeDefecto: string
): ErrorUsuariosAdmin {
  if (error instanceof ErrorUsuariosAdmin) {
    return error;
  }

  if (error instanceof ErrorApi) {
    return new ErrorUsuariosAdmin(
      error.tipo,
      error.message,
      error.status
    );
  }

  return new ErrorUsuariosAdmin("red", mensajeDefecto);
}

function detalleUtil(error: ErrorUsuariosAdmin): string {
  const detalle = error.message.trim();

  if (
    !detalle ||
    /^El servidor de SyncPass/.test(detalle) ||
    /^La API rechazó/.test(detalle) ||
    /^El recurso solicitado/.test(detalle) ||
    /^No tienes permisos/.test(detalle) ||
    /^Tu sesión de Cognito/.test(detalle)
  ) {
    return "";
  }

  return detalle;
}

/**
 * Traduce los errores del listado y la consulta individual.
 */
export function mensajeListadoUsuarios(
  error: ErrorUsuariosAdmin
): string {
  switch (error.status) {
    case 401:
      return "Tu sesión de Cognito expiró o no es válida. Vuelve a iniciar sesión para consultar los usuarios.";
    case 403:
      return "No tienes autorización para consultar usuarios. La operación requiere una cuenta con ROLE_ADMINISTRADOR.";
    case 404:
      return "El endpoint de listado de usuarios no está disponible en este entorno de SyncPass.";
    case 500:
      return "El backend no pudo obtener el listado de usuarios. Intenta actualizar la lista en unos instantes.";
    default:
      return (
        detalleUtil(error) ||
        "No fue posible obtener el listado de usuarios."
      );
  }
}

export function mensajeConsultaUsuario(
  error: ErrorUsuariosAdmin
): string {
  switch (error.status) {
    case 401:
      return "Tu sesión de Cognito expiró o no es válida. Vuelve a iniciar sesión para consultar la cuenta.";
    case 403:
      return "No tienes autorización para consultar esta cuenta. La operación requiere ROLE_ADMINISTRADOR.";
    case 404:
      return "El usuario ya no existe en el backend o su identificador dejó de estar disponible.";
    default:
      return (
        detalleUtil(error) ||
        "No fue posible consultar el estado real del usuario."
      );
  }
}

/**
 * Traduce los estados HTTP de la baja a mensajes accionables.
 */
export function mensajeEliminacionUsuario(
  error: ErrorUsuariosAdmin
): string {
  switch (error.status) {
    case 400:
      return `La solicitud de eliminación no es válida. Verifica el identificador del usuario.${detalleUtil(error) ? ` ${detalleUtil(error)}` : ""}`;
    case 401:
      return "Tu sesión de Cognito expiró o no es válida. Vuelve a iniciar sesión antes de eliminar la cuenta.";
    case 403:
      return "No tienes autorización para eliminar usuarios. La operación requiere una cuenta con ROLE_ADMINISTRADOR.";
    case 404:
      return "El backend respondió 404 al intentar eliminar la cuenta. No se puede concluir que el usuario desapareció: el listado se actualizará y se consultará su estado real.";
    case 409:
      return `No se puede eliminar la cuenta porque existen datos relacionados que lo impiden.${detalleUtil(error) ? ` Detalle del backend: ${detalleUtil(error)}` : ""}`;
    case 500:
      return `El backend respondió 500: la eliminación quedó parcial y requiere reconciliación. Revisa el estado real de la cuenta antes de reintentar de forma controlada.${detalleUtil(error) ? ` Detalle del backend: ${detalleUtil(error)}` : ""}`;
    case 503:
      return "El backend respondió 503: falló la comunicación o la operación con Amazon Cognito. La cuenta no se eliminó de la lista. Puedes reintentar de forma controlada.";
    default:
      return (
        detalleUtil(error) ||
        "No fue posible eliminar la cuenta del usuario."
      );
  }
}

/**
 * Obtiene una página real del listado persistente.
 */
export async function listarUsuariosAdministrativosApi(
  pagina: number,
  tamano: number,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<PaginaUsuariosAdmin> {
  const paginaSegura = normalizarPagina(pagina);
  const tamanoSeguro = normalizarTamano(tamano);

  try {
    const resultado = await solicitarApi<PaginaUsuariosAdmin>({
      ruta: `/api/usuarios?page=${paginaSegura}&size=${tamanoSeguro}`,
      accessToken,
      contexto: "consultar el listado de usuarios",
      metodo: "GET",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarPaginaUsuariosAdmin,
    });

    if (!resultado) {
      throw errorRespuesta(
        "La API no devolvió el listado de usuarios esperado."
      );
    }

    return resultado;
  } catch (error) {
    throw comoErrorUsuariosAdmin(
      error,
      "No fue posible obtener el listado de usuarios."
    );
  }
}

/**
 * Consulta una cuenta por su ID real.
 */
export async function obtenerUsuarioAdministrativoApi(
  id: string,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<UsuarioAdmin> {
  const identificador = validarIdUsuario(id);

  try {
    const usuario = await solicitarApi<UsuarioAdmin>({
      ruta: `/api/usuarios/${encodeURIComponent(identificador)}`,
      accessToken,
      contexto: `consultar el usuario ${identificador}`,
      metodo: "GET",
      signal: opciones.signal,
      timeoutMs: opciones.timeoutMs,
      validarData: validarUsuarioAdmin,
    });

    if (!usuario) {
      throw errorRespuesta(
        "La API no devolvió los datos del usuario consultado."
      );
    }

    if (usuario.id !== identificador) {
      throw errorRespuesta(
        "La API devolvió un usuario distinto al solicitado."
      );
    }

    return usuario;
  } catch (error) {
    throw comoErrorUsuariosAdmin(
      error,
      "No fue posible consultar el usuario."
    );
  }
}

/**
 * Solicita la baja de un usuario por su ID real.
 *
 * La interfaz no elimina filas localmente: solo refresca el listado
 * después de recibir y validar el objeto de eliminación del backend.
 */
export async function eliminarUsuarioAdministrativoApi(
  id: string,
  accessToken: string,
  opciones: OpcionesConsulta = {}
): Promise<ResultadoEliminacionUsuario> {
  const identificador = validarIdUsuario(id);

  try {
    const resultado =
      await solicitarApi<ResultadoEliminacionUsuario>({
        ruta: `/api/usuarios/${encodeURIComponent(identificador)}`,
        accessToken,
        contexto: `eliminar el usuario ${identificador}`,
        metodo: "DELETE",
        signal: opciones.signal,
        timeoutMs: opciones.timeoutMs,
        validarData: validarResultadoEliminacionUsuario,
      });

    if (!resultado) {
      throw errorRespuesta(
        "La API no devolvió el resultado de eliminación esperado."
      );
    }

    if (resultado.usuarioId !== identificador) {
      throw errorRespuesta(
        "La API confirmó la eliminación de un usuario distinto al solicitado."
      );
    }

    return resultado;
  } catch (error) {
    throw comoErrorUsuariosAdmin(
      error,
      "No fue posible eliminar la cuenta del usuario."
    );
  }
}
