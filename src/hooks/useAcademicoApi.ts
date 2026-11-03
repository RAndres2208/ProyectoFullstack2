import { useCallback, useEffect, useState } from "react";
import {
  ErrorAcademico,
  actualizarCursoApi,
  asignarDocenteApi,
  crearCursoApi,
  cursoApiACurso,
  docenteApiADocente,
  estudianteApiAEstudiante,
  inscribirEstudianteApi,
  listarCursosApi,
  listarCursosDeEstudianteApi,
  listarDocentesApi,
  listarEstudiantesApi,
  listarEstudiantesDeCursoApi,
  retirarEstudianteApi,
  type CursoApi,
} from "../services/academicoApi";
import { huellaToken } from "../services/proyectosApi";
import type {
  Curso,
  CursoSolicitud,
  DocenteAcademico,
  EstudianteAcademico,
} from "../types/academico";

export type EstadoAcademicoApi =
  | "inactivo"
  | "cargando"
  | "exito"
  | "error";

type ResultadoConsulta = {
  clave: string;
  huella: string;
  cursos: Curso[];
  docentes: DocenteAcademico[];
  error: ErrorAcademico | null;
};

function convertirIdCurso(id: string): number {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorAcademico(
      "solicitud",
      "El identificador del curso no es válido para la API."
    );
  }

  return numero;
}

function reemplazarCurso(cursos: Curso[], curso: Curso): Curso[] {
  const existe = cursos.some((item) => item.id === curso.id);

  if (!existe) {
    return [...cursos, curso];
  }

  return cursos.map((item) => (item.id === curso.id ? curso : item));
}

/**
 * Carga cursos y docentes reales con el access_token de Cognito.
 *
 * Se usa solo en las pantallas de coordinación cuando hay una sesión real.
 * En modo demostración o vista previa debe llamarse con `habilitado = false`
 * para no mezclar datos locales con respuestas de la API.
 */
export function useAcademicoApi(
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

    Promise.all([
      listarCursosApi(accessToken),
      listarDocentesApi(accessToken),
    ])
      .then(([cursosApi, docentesApi]) => {
        if (cancelado) return;

        setResultado({
          clave,
          huella,
          cursos: cursosApi.map(cursoApiACurso),
          docentes: docentesApi.map(docenteApiADocente),
          error: null,
        });
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;

        setResultado((actual) => ({
          clave,
          huella,
          cursos:
            actual && actual.huella === huella
              ? actual.cursos
              : [],
          docentes:
            actual && actual.huella === huella
              ? actual.docentes
              : [],
          error:
            fallo instanceof ErrorAcademico
              ? fallo
              : new ErrorAcademico(
                  "red",
                  "No fue posible consultar cursos y docentes."
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

  const crearCurso = useCallback(
    async (datos: CursoSolicitud): Promise<Curso> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para crear el curso."
        );
      }

      const creado: CursoApi = await crearCursoApi(
        datos,
        accessToken
      );
      const curso = cursoApiACurso(creado);

      setResultado((actual) =>
        actual && actual.huella === huella
          ? { ...actual, cursos: reemplazarCurso(actual.cursos, curso) }
          : actual
      );

      return curso;
    },
    [habilitado, accessToken, huella]
  );

  const actualizarCurso = useCallback(
    async (id: string, datos: CursoSolicitud): Promise<Curso> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para actualizar el curso."
        );
      }

      const actualizado: CursoApi = await actualizarCursoApi(
        convertirIdCurso(id),
        datos,
        accessToken
      );
      const curso = cursoApiACurso(actualizado);

      setResultado((actual) =>
        actual && actual.huella === huella
          ? { ...actual, cursos: reemplazarCurso(actual.cursos, curso) }
          : actual
      );

      return curso;
    },
    [habilitado, accessToken, huella]
  );

  const asignarDocente = useCallback(
    async (id: string, docenteId: string | null): Promise<Curso> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para asignar el docente."
        );
      }

      const actualizado: CursoApi = await asignarDocenteApi(
        convertirIdCurso(id),
        docenteId,
        accessToken
      );
      const curso = cursoApiACurso(actualizado);

      setResultado((actual) =>
        actual && actual.huella === huella
          ? { ...actual, cursos: reemplazarCurso(actual.cursos, curso) }
          : actual
      );

      return curso;
    },
    [habilitado, accessToken, huella]
  );

  const listarEstudiantes = useCallback(
    async (): Promise<EstudianteAcademico[]> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para consultar estudiantes."
        );
      }

      const estudiantesApi = await listarEstudiantesApi(accessToken);
      return estudiantesApi.map(estudianteApiAEstudiante);
    },
    [habilitado, accessToken]
  );

  const listarEstudiantesDeCurso = useCallback(
    async (cursoId: string): Promise<EstudianteAcademico[]> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para consultar estudiantes."
        );
      }

      const estudiantesApi = await listarEstudiantesDeCursoApi(
        convertirIdCurso(cursoId),
        accessToken
      );
      return estudiantesApi.map(estudianteApiAEstudiante);
    },
    [habilitado, accessToken]
  );

  const inscribirEstudiante = useCallback(
    async (cursoId: string, estudianteId: string): Promise<void> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para inscribir estudiantes."
        );
      }

      await inscribirEstudianteApi(
        convertirIdCurso(cursoId),
        estudianteId,
        accessToken
      );

      setResultado((actual) => {
        if (!actual || actual.huella !== huella) return actual;
        return {
          ...actual,
          cursos: actual.cursos.map((curso) =>
            curso.id === cursoId
              ? { ...curso, estudiantes: curso.estudiantes + 1 }
              : curso
          ),
        };
      });
    },
    [habilitado, accessToken, huella]
  );

  const retirarEstudiante = useCallback(
    async (cursoId: string, estudianteId: string): Promise<void> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para retirar estudiantes."
        );
      }

      await retirarEstudianteApi(
        convertirIdCurso(cursoId),
        estudianteId,
        accessToken
      );

      setResultado((actual) => {
        if (!actual || actual.huella !== huella) return actual;
        return {
          ...actual,
          cursos: actual.cursos.map((curso) =>
            curso.id === cursoId
              ? {
                  ...curso,
                  estudiantes: Math.max(0, curso.estudiantes - 1),
                }
              : curso
          ),
        };
      });
    },
    [habilitado, accessToken, huella]
  );

  const listarCursosDeEstudiante = useCallback(
    async (estudianteId: string): Promise<Curso[]> => {
      if (!habilitado || !accessToken) {
        throw new ErrorAcademico(
          "sesion",
          "No hay una sesión de Cognito disponible para consultar cursos."
        );
      }

      const cursosApi = await listarCursosDeEstudianteApi(
        estudianteId,
        accessToken
      );
      return cursosApi.map(cursoApiACurso);
    },
    [habilitado, accessToken]
  );

  if (!habilitado) {
    return {
      cursos: [] as Curso[],
      docentes: [] as DocenteAcademico[],
      estado: "inactivo" as EstadoAcademicoApi,
      error: null,
      recargar,
      crearCurso,
      actualizarCurso,
      asignarDocente,
      listarEstudiantes,
      listarEstudiantesDeCurso,
      inscribirEstudiante,
      retirarEstudiante,
      listarCursosDeEstudiante,
    };
  }

  if (!accessToken) {
    return {
      cursos: [] as Curso[],
      docentes: [] as DocenteAcademico[],
      estado: "error" as EstadoAcademicoApi,
      error: new ErrorAcademico(
        "sesion",
        "No hay una sesión de Cognito disponible para consultar cursos y docentes."
      ),
      recargar,
      crearCurso,
      actualizarCurso,
      asignarDocente,
      listarEstudiantes,
      listarEstudiantesDeCurso,
      inscribirEstudiante,
      retirarEstudiante,
      listarCursosDeEstudiante,
    };
  }

  if (!resultado || resultado.clave !== clave) {
    return {
      cursos:
        resultado && resultado.huella === huella
          ? resultado.cursos
          : ([] as Curso[]),
      docentes:
        resultado && resultado.huella === huella
          ? resultado.docentes
          : ([] as DocenteAcademico[]),
      estado: "cargando" as EstadoAcademicoApi,
      error: null,
      recargar,
      crearCurso,
      actualizarCurso,
      asignarDocente,
      listarEstudiantes,
      listarEstudiantesDeCurso,
      inscribirEstudiante,
      retirarEstudiante,
      listarCursosDeEstudiante,
    };
  }

  return {
    cursos: resultado.cursos,
    docentes: resultado.docentes,
    estado: (resultado.error
      ? "error"
      : "exito") as EstadoAcademicoApi,
    error: resultado.error,
    recargar,
    crearCurso,
    actualizarCurso,
    asignarDocente,
      listarEstudiantes,
      listarEstudiantesDeCurso,
      inscribirEstudiante,
      retirarEstudiante,
      listarCursosDeEstudiante,
  };
}
