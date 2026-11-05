import { useCallback, useEffect, useRef, useState } from "react";
import { huellaToken } from "../services/proyectosApi";
import {
  ErrorUsuariosAdmin,
  listarUsuariosAdministrativosApi,
  normalizarTamano,
  type PaginaUsuariosAdmin,
} from "../services/usuariosAdminApi";

export type EstadoUsuariosAdmin =
  | "inactivo"
  | "cargando"
  | "exito"
  | "error";

type ResultadoConsulta = {
  clave: string;
  huella: string;
  pagina: PaginaUsuariosAdmin | null;
  error: ErrorUsuariosAdmin | null;
};

type OpcionesUsuariosAdmin = {
  /** Tamaño de página solicitado. Se limita entre 1 y 100. */
  tamano?: number;
  /**
   * Cambiar este valor solicita una recarga desde la página 0.
   * Se usa, por ejemplo, después de registrar una cuenta.
   */
  tokenRefresco?: number;
};

/**
 * Carga el listado persistente de usuarios con el token de Cognito.
 *
 * Mantiene los datos visibles durante una recarga de la misma sesión,
 * evita reutilizar respuestas de otra sesión y retrocede una página
 * cuando el backend devuelve una página vacía con page > 0.
 */
export function useUsuariosAdmin(
  habilitado: boolean,
  accessToken?: string,
  opciones: OpcionesUsuariosAdmin = {}
) {
  const tamano = normalizarTamano(opciones.tamano ?? 20);
  const tokenRefresco = opciones.tokenRefresco ?? 0;

  const [pagina, setPagina] = useState(0);
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] =
    useState<ResultadoConsulta | null>(null);

  const refrescoRef = useRef(tokenRefresco);
  const huella = accessToken
    ? huellaToken(accessToken)
    : "sin-token";
  const clave = `${intento}::${pagina}::${tamano}::${huella}`;

  useEffect(() => {
    if (tokenRefresco === refrescoRef.current) {
      return;
    }

    refrescoRef.current = tokenRefresco;
    setPagina(0);
    setIntento((actual) => actual + 1);
  }, [tokenRefresco]);

  useEffect(() => {
    if (!habilitado || !accessToken) {
      return;
    }

    let cancelado = false;

    listarUsuariosAdministrativosApi(
      pagina,
      tamano,
      accessToken
    )
      .then((datos) => {
        if (cancelado) return;

        setResultado({
          clave,
          huella,
          pagina: datos,
          error: null,
        });

        // Si una página dejó de existir (por ejemplo, tras eliminar al
        // último usuario), se consulta la página anterior en la misma
        // operación sin esperar a un efecto adicional.
        if (datos.content.length === 0 && datos.page > 0) {
          const destino = Math.min(
            Math.max(datos.page - 1, 0),
            Math.max(datos.totalPages - 1, 0)
          );

          if (destino !== pagina) {
            setPagina(destino);
          }
        }
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;

        setResultado((actual) => ({
          clave,
          huella,
          pagina:
            actual && actual.huella === huella
              ? actual.pagina
              : null,
          error:
            fallo instanceof ErrorUsuariosAdmin
              ? fallo
              : new ErrorUsuariosAdmin(
                  "red",
                  "No fue posible obtener el listado de usuarios."
                ),
        }));
      });

    return () => {
      cancelado = true;
    };
  }, [habilitado, accessToken, pagina, tamano, clave, huella]);

  const recargar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  const recargarDesdeInicio = useCallback(() => {
    setPagina(0);
    setIntento((actual) => actual + 1);
  }, []);

  const irAPagina = useCallback(
    (destino: number) => {
      const totalPaginas = resultado?.pagina?.totalPages ?? 0;
      const ultimaPagina = Math.max(totalPaginas - 1, 0);
      const siguiente = Math.min(
        ultimaPagina,
        Math.max(0, Math.trunc(destino))
      );

      setPagina(siguiente);
    },
    [resultado]
  );

  if (!habilitado) {
    return {
      usuarios: [],
      pagina: 0,
      tamano,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      estado: "inactivo" as EstadoUsuariosAdmin,
      error: null as ErrorUsuariosAdmin | null,
      recargar,
      recargarDesdeInicio,
      irAPagina,
    };
  }

  if (!accessToken) {
    return {
      usuarios: [],
      pagina: 0,
      tamano,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      estado: "error" as EstadoUsuariosAdmin,
      error: new ErrorUsuariosAdmin(
        "sesion",
        "No hay una sesión de Cognito disponible para consultar los usuarios."
      ),
      recargar,
      recargarDesdeInicio,
      irAPagina,
    };
  }

  const paginaVisible =
    resultado &&
    (resultado.clave === clave || resultado.huella === huella)
      ? resultado.pagina
      : null;

  const cargando =
    !resultado || resultado.clave !== clave;

  const error =
    resultado && resultado.clave === clave
      ? resultado.error
      : null;

  return {
    usuarios: paginaVisible?.content ?? [],
    pagina: paginaVisible?.page ?? pagina,
    tamano: paginaVisible?.size ?? tamano,
    totalElements: paginaVisible?.totalElements ?? 0,
    totalPages: paginaVisible?.totalPages ?? 0,
    first: paginaVisible?.first ?? true,
    last: paginaVisible?.last ?? true,
    estado: (
      cargando ? "cargando" : error ? "error" : "exito"
    ) as EstadoUsuariosAdmin,
    error,
    recargar,
    recargarDesdeInicio,
    irAPagina,
  };
}
