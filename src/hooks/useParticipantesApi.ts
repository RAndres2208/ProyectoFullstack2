import { useCallback, useEffect, useState } from "react";
import {
  ErrorParticipantes,
  listarParticipantesApi,
  type ParticipanteApi,
} from "../services/participantesApi";
import { huellaToken } from "../services/proyectosApi";

export type EstadoParticipantesApi =
  | "inactivo"
  | "cargando"
  | "exito"
  | "error";

type ResultadoConsulta = {
  clave: string;
  huella: string;
  participantes: ParticipanteApi[];
  error: ErrorParticipantes | null;
};

/**
 * Carga el listado real de participantes con el token de Cognito.
 *
 * Mientras se recarga la misma sesión se conservan los datos previos para
 * evitar que la tabla desaparezca. Si cambia la sesión, no se reutilizan
 * registros de la consulta anterior.
 */
export function useParticipantesApi(
  habilitado: boolean,
  accessToken?: string
) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] =
    useState<ResultadoConsulta | null>(null);

  const huella = accessToken
    ? huellaToken(accessToken)
    : "sin-token";
  const clave = `${intento}::${huella}`;

  useEffect(() => {
    if (!habilitado || !accessToken) {
      return;
    }

    let cancelado = false;

    listarParticipantesApi(accessToken)
      .then((datos) => {
        if (cancelado) return;

        setResultado({
          clave,
          huella,
          participantes: datos,
          error: null,
        });
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;

        setResultado((actual) => ({
          clave,
          huella,
          participantes:
            actual && actual.huella === huella
              ? actual.participantes
              : [],
          error:
            fallo instanceof ErrorParticipantes
              ? fallo
              : new ErrorParticipantes(
                  "red",
                  "No fue posible consultar los participantes."
                ),
        }));
      });

    return () => {
      cancelado = true;
    };
  }, [habilitado, accessToken, clave, huella]);

  const recargar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  if (!habilitado) {
    return {
      participantes: [] as ParticipanteApi[],
      estado: "inactivo" as EstadoParticipantesApi,
      error: null,
      recargar,
    };
  }

  if (!accessToken) {
    return {
      participantes: [] as ParticipanteApi[],
      estado: "error" as EstadoParticipantesApi,
      error: new ErrorParticipantes(
        "sesion",
        "No hay una sesión de Cognito disponible para consultar los participantes."
      ),
      recargar,
    };
  }

  if (!resultado || resultado.clave !== clave) {
    return {
      participantes:
        resultado && resultado.huella === huella
          ? resultado.participantes
          : ([] as ParticipanteApi[]),
      estado: "cargando" as EstadoParticipantesApi,
      error: null,
      recargar,
    };
  }

  return {
    participantes: resultado.participantes,
    estado: (resultado.error
      ? "error"
      : "exito") as EstadoParticipantesApi,
    error: resultado.error,
    recargar,
  };
}
