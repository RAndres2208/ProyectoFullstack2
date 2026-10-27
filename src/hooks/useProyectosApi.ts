import { useCallback, useEffect, useState } from "react";
import {
  ErrorProyectos,
  huellaToken,
  obtenerProyectosApi,
  type ProyectoApi,
} from "../services/proyectosApi";

export type EstadoProyectosApi =
  | "inactivo"
  | "cargando"
  | "exito"
  | "error";

type ResultadoConsulta = {
  clave: string;
  proyectos: ProyectoApi[];
  error: ErrorProyectos | null;
};

/**
 * Centraliza la carga del listado de proyectos. No mezcla datos locales:
 * si la consulta falla, el estado queda en error y la vista debe ofrecer
 * reintentar o activar el modo demostración de forma explícita.
 */
export function useProyectosApi(
  habilitado: boolean,
  accessToken?: string
) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] =
    useState<ResultadoConsulta | null>(null);

  const clave = `${intento}::${accessToken ? huellaToken(accessToken) : "sin-token"}`;

  useEffect(() => {
    if (!habilitado || !accessToken) {
      return;
    }

    let cancelado = false;

    obtenerProyectosApi(accessToken)
      .then((datos) => {
        if (cancelado) {
          return;
        }

        setResultado({
          clave,
          proyectos: datos,
          error: null,
        });
      })
      .catch((fallo: unknown) => {
        if (cancelado) {
          return;
        }

        setResultado({
          clave,
          proyectos: [],
          error:
            fallo instanceof ErrorProyectos
              ? fallo
              : new ErrorProyectos(
                  "red",
                  "No fue posible consultar los proyectos."
                ),
        });
      });

    return () => {
      cancelado = true;
    };
  }, [habilitado, accessToken, clave]);

  const recargar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  if (!habilitado) {
    return {
      proyectos: [] as ProyectoApi[],
      estado: "inactivo" as EstadoProyectosApi,
      error: null,
      recargar,
    };
  }

  if (!accessToken) {
    return {
      proyectos: [] as ProyectoApi[],
      estado: "error" as EstadoProyectosApi,
      error: new ErrorProyectos(
        "sesion",
        "No hay una sesión de Cognito disponible para consultar los proyectos."
      ),
      recargar,
    };
  }

  if (!resultado || resultado.clave !== clave) {
    return {
      proyectos: [] as ProyectoApi[],
      estado: "cargando" as EstadoProyectosApi,
      error: null,
      recargar,
    };
  }

  return {
    proyectos: resultado.proyectos,
    estado: (resultado.error ? "error" : "exito") as EstadoProyectosApi,
    error: resultado.error,
    recargar,
  };
}
