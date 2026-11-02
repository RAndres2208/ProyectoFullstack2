import { useMemo, useState, type ReactNode } from "react";
import { cursosDemo, estudiantesDemo } from "../data/cursosData";
import { registrosAsistenciaDemo } from "../data/asistenciaData";
import { INTEGRACION_ACADEMICA } from "../services/academicoContratos";
import type {
  Curso,
  DocenteAcademico,
  EstudianteAcademico,
  EstadoAsistencia,
  RegistroAsistencia,
} from "../types/academico";
import { AcademicoContext, type AcademicoContextValue } from "./AcademicoContext";

type AcademicoProviderProps = {
  children: ReactNode;
};

const docentesPorDefecto: DocenteAcademico[] = [
  { id: "DOC-001", nombre: "María González", email: "maria.gonzalez@duoc.cl" },
  { id: "DOC-002", nombre: "Carlos Pérez", email: "carlos.perez@duoc.cl" },
  { id: "DOC-003", nombre: "Ana Torres", email: "ana.torres@duoc.cl" },
];

function crearId(prefijo: string): string {
  const timestamp = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefijo}-${timestamp}-${aleatorio}`;
}

export function AcademicoProvider({ children }: AcademicoProviderProps) {
  const [cursos, setCursos] = useState<Curso[]>(() =>
    cursosDemo.map((curso) => ({ ...curso }))
  );
  const [docentes] = useState<DocenteAcademico[]>(docentesPorDefecto);
  const [estudiantes] = useState<EstudianteAcademico[]>(estudiantesDemo);
  const [inscripciones, setInscripciones] = useState<Set<string>>(() => {
    const inicial = new Set<string>();
    for (const estudiante of estudiantesDemo) {
      for (const cursoId of estudiante.cursos) {
        inicial.add(`${cursoId}|${estudiante.id}`);
      }
    }
    return inicial;
  });
  const [registrosAsistencia, setRegistrosAsistencia] = useState<
    RegistroAsistencia[]
  >(() => registrosAsistenciaDemo.map((registro) => ({ ...registro })));

  const estudiantesPorCurso = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const clave of inscripciones) {
      const [cursoId, estudianteId] = clave.split("|");
      if (!mapa.has(cursoId)) {
        mapa.set(cursoId, []);
      }
      mapa.get(cursoId)!.push(estudianteId);
    }
    return mapa;
  }, [inscripciones]);

  const cursosConConteo = useMemo<Curso[]>(() => {
    return cursos.map((curso) => ({
      ...curso,
      estudiantes: (estudiantesPorCurso.get(curso.id) ?? []).length,
    }));
  }, [cursos, estudiantesPorCurso]);

  const listarCursosPorPerfil = useMemo<
    AcademicoContextValue["listarCursosPorPerfil"]
  >(
    () =>
      ({ rol, estudianteId, docenteId }) => {
        if (rol === "estudiante") {
          if (!estudianteId) {
            return [];
          }
          const cursosDelEstudiante = new Set<string>();
          for (const clave of inscripciones) {
            const [cursoId, idEstudiante] = clave.split("|");
            if (idEstudiante === estudianteId) {
              cursosDelEstudiante.add(cursoId);
            }
          }
          return cursosConConteo.filter((curso) =>
            cursosDelEstudiante.has(curso.id)
          );
        }

        if (rol === "profesor") {
          if (!docenteId) {
            return [];
          }
          return cursosConConteo.filter((curso) => curso.docenteId === docenteId);
        }

        // coordinador y administrador ven el ámbito completo (preparado para filtrar por ámbito)
        if (rol === "coordinador" || rol === "administrador") {
          return cursosConConteo;
        }

        return [];
      },
    [cursosConConteo, inscripciones]
  );

  const crearCurso = useMemo<AcademicoContextValue["crearCurso"]>(
    () => (datos) => {
      const docente = docentes.find((d) => d.id === datos.docenteId) ?? null;
      const nuevoCurso: Curso = {
        id: crearId("CUR"),
        codigo: datos.codigo.trim(),
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        docente: docente ? docente.nombre : "Sin docente asignado",
        docenteId: datos.docenteId,
        estado: datos.estado,
        estudiantes: 0,
      };
      setCursos((actuales) => [...actuales, nuevoCurso]);
      return nuevoCurso;
    },
    [docentes]
  );

  const actualizarCurso = useMemo<AcademicoContextValue["actualizarCurso"]>(
    () => (id, datos) => {
      const cursoActual = cursos.find((curso) => curso.id === id);

      if (!cursoActual) {
        return null;
      }

      const docente = docentes.find((d) => d.id === datos.docenteId) ?? null;
      const cursoActualizado: Curso = {
        ...cursoActual,
        codigo: datos.codigo.trim(),
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        docente: docente ? docente.nombre : "Sin docente asignado",
        docenteId: datos.docenteId,
        estado: datos.estado,
        estudiantes: (estudiantesPorCurso.get(cursoActual.id) ?? []).length,
      };

      setCursos((actuales) =>
        actuales.map((curso) =>
          curso.id === id ? cursoActualizado : curso
        )
      );

      return cursoActualizado;
    },
    [cursos, docentes, estudiantesPorCurso]
  );

  const asignarDocente = useMemo<AcademicoContextValue["asignarDocente"]>(
    () => (id, docenteId) => {
      const cursoActual = cursos.find((curso) => curso.id === id);

      if (!cursoActual) {
        return null;
      }

      const docente = docenteId
        ? docentes.find((d) => d.id === docenteId) ?? null
        : null;
      const cursoActualizado: Curso = {
        ...cursoActual,
        docenteId,
        docente: docente ? docente.nombre : "Sin docente asignado",
      };

      setCursos((actuales) =>
        actuales.map((curso) =>
          curso.id === id ? cursoActualizado : curso
        )
      );

      return cursoActualizado;
    },
    [cursos, docentes]
  );

  const eliminarCurso = useMemo<AcademicoContextValue["eliminarCurso"]>(
    () => (id) => {
      if (!cursos.some((curso) => curso.id === id)) {
        return false;
      }

      setCursos((actuales) => actuales.filter((curso) => curso.id !== id));
      setInscripciones((actuales) => {
        const siguiente = new Set(actuales);
        for (const clave of siguiente) {
          if (clave.startsWith(`${id}|`)) {
            siguiente.delete(clave);
          }
        }
        return siguiente;
      });
      setRegistrosAsistencia((actuales) =>
        actuales.filter((registro) => registro.cursoId !== id)
      );

      return true;
    },
    [cursos]
  );

  const obtenerEstudiantesDeCurso = useMemo<
    AcademicoContextValue["obtenerEstudiantesDeCurso"]
  >(
    () => (cursoId) => {
      const ids = estudiantesPorCurso.get(cursoId) ?? [];
      return estudiantes.filter((estudiante) => ids.includes(estudiante.id));
    },
    [estudiantes, estudiantesPorCurso]
  );

  const inscribirEstudiante = useMemo<
    AcademicoContextValue["inscribirEstudiante"]
  >(
    () => (cursoId, estudianteId) => {
      const clave = `${cursoId}|${estudianteId}`;
      if (inscripciones.has(clave)) {
        return false;
      }
      setInscripciones((actual) => {
        const nuevo = new Set(actual);
        nuevo.add(clave);
        return nuevo;
      });
      return true;
    },
    [inscripciones]
  );

  const retirarEstudiante = useMemo<
    AcademicoContextValue["retirarEstudiante"]
  >(
    () => (cursoId, estudianteId) => {
      const clave = `${cursoId}|${estudianteId}`;
      if (!inscripciones.has(clave)) {
        return false;
      }
      setInscripciones((actual) => {
        const nuevo = new Set(actual);
        nuevo.delete(clave);
        return nuevo;
      });
      return true;
    },
    [inscripciones]
  );

  const listarRegistrosAsistencia = useMemo<
    AcademicoContextValue["listarRegistrosAsistencia"]
  >(
    () => (cursoId, fecha) => {
      return registrosAsistencia
        .filter((registro) => {
          if (registro.cursoId !== cursoId) {
            return false;
          }
          if (fecha && registro.fecha !== fecha) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.fecha !== b.fecha) {
            return a.fecha.localeCompare(b.fecha);
          }
          return a.estudianteId.localeCompare(b.estudianteId);
        });
    },
    [registrosAsistencia]
  );

  const guardarSesionAsistencia = useMemo<
    AcademicoContextValue["guardarSesionAsistencia"]
  >(
    () => (datos) => {
      const registradoEn = new Date().toISOString();
      const registrosUnicos = new Map<string, EstadoAsistencia>();

      for (const item of datos.registros) {
        registrosUnicos.set(item.estudianteId, item.estado);
      }

      const guardados: RegistroAsistencia[] = Array.from(
        registrosUnicos.entries()
      ).map(([estudianteId, estado], indice) => ({
        id: crearId(`ASI-${indice + 1}`),
        cursoId: datos.cursoId,
        estudianteId,
        fecha: datos.fecha,
        estado,
        registradoEn,
        origen: "demo",
      }));

      const clavesSesion = new Set(
        guardados.map(
          (registro) =>
            `${registro.cursoId}|${registro.fecha}|${registro.estudianteId}`
        )
      );

      setRegistrosAsistencia((actuales) => [
        ...actuales.filter(
          (registro) =>
            !clavesSesion.has(
              `${registro.cursoId}|${registro.fecha}|${registro.estudianteId}`
            )
        ),
        ...guardados,
      ]);

      return guardados;
    },
    []
  );

  const marcarAsistenciaRapida = useMemo<
    AcademicoContextValue["marcarAsistenciaRapida"]
  >(
    () => (cursoId, fecha, estudianteId, estado) => {
      const registradoEn = new Date().toISOString();
      const existente = registrosAsistencia.find(
        (registro) =>
          registro.cursoId === cursoId &&
          registro.fecha === fecha &&
          registro.estudianteId === estudianteId
      );
      const registro: RegistroAsistencia = existente
        ? { ...existente, estado, registradoEn }
        : {
            id: crearId("ASI"),
            cursoId,
            estudianteId,
            fecha,
            estado,
            registradoEn,
            origen: "demo",
          };

      setRegistrosAsistencia((actuales) => {
        if (existente) {
          return actuales.map((actual) =>
            actual.id === existente.id ? registro : actual
          );
        }

        return [...actuales, registro];
      });

      return registro;
    },
    [registrosAsistencia]
  );

  const valor = useMemo<AcademicoContextValue>(
    () => ({
      cargando: false,
      usandoApi: false,
      pendienteApi: INTEGRACION_ACADEMICA.asistencia === "pendiente",
      cursos: cursosConConteo,
      docentes,
      estudiantes,
      registrosAsistencia,
      listarCursosPorPerfil,
      crearCurso,
      actualizarCurso,
      eliminarCurso,
      asignarDocente,
      obtenerEstudiantesDeCurso,
      inscribirEstudiante,
      retirarEstudiante,
      listarRegistrosAsistencia,
      guardarSesionAsistencia,
      marcarAsistenciaRapida,
    }),
    [
      asignarDocente,
      actualizarCurso,
      crearCurso,
      cursosConConteo,
      docentes,
      eliminarCurso,
      estudiantes,
      guardarSesionAsistencia,
      inscribirEstudiante,
      listarCursosPorPerfil,
      listarRegistrosAsistencia,
      marcarAsistenciaRapida,
      obtenerEstudiantesDeCurso,
      registrosAsistencia,
      retirarEstudiante,
    ]
  );

  return (
    <AcademicoContext.Provider value={valor}>
      {children}
    </AcademicoContext.Provider>
  );
}
