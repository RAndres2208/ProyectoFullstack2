import { useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useDemoRole } from "../../auth/demoRole";
import { useVistaPrevia } from "../../auth/vistaPrevia";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { useAcademico } from "../../context/AcademicoContext";
import { useAcademicoApi } from "../../hooks/useAcademicoApi";
import type { DocenteAcademico } from "../../types/academico";
import { normalizarTexto } from "../../utils/format";
import dashboardStyles from "../dashboard/Dashboard.module.css";

type DocenteConDatos = {
  docente: DocenteAcademico;
  cursosAsignados: string[];
  estudiantes: number;
  asistencia: number | null;
  registros: number;
};

export function DocentesCoordinador() {
  const auth = useAuth();
  const { esModoDemo } = useDemoRole();
  const { activo: vistaPreviaActiva } = useVistaPrevia();
  const {
    docentes: docentesContexto,
    cursos: cursosContexto,
    registrosAsistencia,
    obtenerEstudiantesDeCurso,
    asignarDocente: asignarDocenteLocal,
  } = useAcademico();

  // La API solo se habilita con una sesión real. Demo y vista previa
  // conservan los datos ficticios y la asignación en memoria.
  const apiHabilitada =
    auth.isAuthenticated && !esModoDemo && !vistaPreviaActiva;
  const academicoApi = useAcademicoApi(
    apiHabilitada,
    auth.user?.access_token
  );

  const docentes = apiHabilitada
    ? academicoApi.docentes
    : docentesContexto;
  const cursos = apiHabilitada
    ? academicoApi.cursos
    : cursosContexto;

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [docenteAsignando, setDocenteAsignando] =
    useState<DocenteAcademico | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [asignando, setAsignando] = useState(false);
  const [errorAsignacion, setErrorAsignacion] = useState("");

  const cargando = apiHabilitada && academicoApi.estado === "cargando";
  const errorCarga = apiHabilitada
    ? academicoApi.error?.message ?? null
    : null;

  const docentesConDatos = useMemo<DocenteConDatos[]>(() => {
    return docentes.map((docente) => {
      const cursosDelDocente = cursos.filter(
        (curso) => curso.docenteId === docente.id
      );
      const cursosAsignados = cursosDelDocente.map(
        (curso) => curso.nombre
      );

      if (apiHabilitada) {
        return {
          docente,
          cursosAsignados,
          estudiantes: cursosDelDocente.reduce(
            (total, curso) => total + curso.estudiantes,
            0
          ),
          asistencia: null,
          registros: 0,
        };
      }

      const estudiantes = new Set<string>();
      let presentes = 0;
      let totalRegistros = 0;

      for (const curso of cursosDelDocente) {
        for (const estudiante of obtenerEstudiantesDeCurso(curso.id)) {
          estudiantes.add(estudiante.id);
        }

        for (const registro of registrosAsistencia) {
          if (registro.cursoId !== curso.id) {
            continue;
          }

          totalRegistros += 1;

          if (registro.estado !== "Ausente") {
            presentes += 1;
          }
        }
      }

      return {
        docente,
        cursosAsignados,
        estudiantes: estudiantes.size,
        asistencia:
          totalRegistros > 0
            ? Math.round((presentes / totalRegistros) * 100)
            : null,
        registros: totalRegistros,
      };
    });
  }, [
    apiHabilitada,
    cursos,
    docentes,
    obtenerEstudiantesDeCurso,
    registrosAsistencia,
  ]);

  const docentesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return docentesConDatos.filter(({ docente, cursosAsignados }) => {
      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${docente.nombre} ${docente.email} ${cursosAsignados.join(" ")}`
      ).includes(texto);
    });
  }, [busqueda, docentesConDatos]);

  const cursosDisponibles = useMemo(() => {
    if (!docenteAsignando) {
      return [];
    }

    return cursos.filter(
      (curso) => curso.docenteId !== docenteAsignando.id
    );
  }, [cursos, docenteAsignando]);

  function cerrarAsignacion() {
    setDocenteAsignando(null);
    setCursoSeleccionado("");
    setErrorAsignacion("");
  }

  function abrirAsignacion(docente: DocenteAcademico) {
    const disponibles = cursos.filter(
      (curso) => curso.docenteId !== docente.id
    );

    setMensaje("");
    setErrorAsignacion("");
    setDocenteAsignando(docente);
    setCursoSeleccionado(disponibles[0]?.id ?? "");
  }

  async function confirmarAsignacion() {
    if (!docenteAsignando || !cursoSeleccionado) {
      return;
    }

    setMensaje("");
    setErrorAsignacion("");

    if (apiHabilitada) {
      setAsignando(true);

      try {
        const actualizado = await academicoApi.asignarDocente(
          cursoSeleccionado,
          docenteAsignando.id
        );

        setMensaje(
          `Curso "${actualizado.nombre}" asignado a ${docenteAsignando.nombre} en PostgreSQL.`
        );
        cerrarAsignacion();
      } catch (fallo) {
        setErrorAsignacion(
          fallo instanceof Error
            ? fallo.message
            : "No fue posible asignar el curso."
        );
      } finally {
        setAsignando(false);
      }

      return;
    }

    const curso = cursos.find((item) => item.id === cursoSeleccionado);
    const actualizado = asignarDocenteLocal(
      cursoSeleccionado,
      docenteAsignando.id
    );

    if (!actualizado) {
      setMensaje("El curso ya no existe en la demostración.");
      return;
    }

    setMensaje(
      `Curso "${curso?.nombre ?? actualizado.nombre}" asignado a ${docenteAsignando.nombre} en la memoria de esta sesión.`
    );
    cerrarAsignacion();
  }

  return (
    <PageLayout
      titulo="Docentes asignados"
      descripcion={
        apiHabilitada
          ? "Equipo docente y cursos asignados · Datos de SyncPass API"
          : "Equipo docente, cursos y asistencia de referencia · Modo demostración"
      }
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo={apiHabilitada ? "DUOC UC · API" : "DUOC UC · DEMO"}
    >
      {apiHabilitada ? (
        <Aviso tono="info">
          Los docentes y cursos se consultan con tu sesión de Cognito. La
          asignación se guarda en PostgreSQL mediante SyncPass API.
        </Aviso>
      ) : (
        <AvisoDemo>
          Esta vista de demostración calcula docentes, cursos y porcentajes con
          datos ficticios en memoria y no llama a la API. La versión con sesión
          real consulta SyncPass y guarda las asignaciones en PostgreSQL.
        </AvisoDemo>
      )}

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Equipo docente</h3>
            <p>
              {apiHabilitada
                ? "Cursos asignados y cantidad de inscripciones informada por la API"
                : "Cursos asignados y registros de asistencia de demostración"}
            </p>
          </div>
        </header>

        {cargando ? (
          <EstadoVacio
            titulo="Cargando docentes y cursos"
            descripcion="Consultando GET /api/docentes y GET /api/cursos con tu sesión de Cognito."
          />
        ) : errorCarga ? (
          <Aviso tono="peligro">
            <strong>No fue posible cargar los docentes.</strong>{" "}
            {errorCarga}
            <div className={ui.botonesFila} style={{ marginTop: 12 }}>
              <button
                type="button"
                className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                onClick={academicoApi.recargar}
              >
                Reintentar
              </button>
            </div>
          </Aviso>
        ) : (
          <>
            <Buscador
              id="buscar-docentes-coordinador"
              etiqueta="Buscar docentes por nombre, correo o curso"
              valor={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por nombre, correo o curso..."
            />

            {docentesFiltrados.length === 0 ? (
              <EstadoVacio
                titulo={
                  docentes.length === 0
                    ? "Sin docentes registrados"
                    : "Sin docentes coincidentes"
                }
                descripcion={
                  docentes.length === 0
                    ? apiHabilitada
                      ? "La API no devolvió usuarios con rol Profesor. Verifica que existan docentes registrados en SyncPass."
                      : "Ajusta la búsqueda para ver otros docentes del ámbito."
                    : "Ajusta la búsqueda para ver otros docentes del ámbito."
                }
              />
            ) : (
              <div className={dashboardStyles.tableWrapper}>
                <table className={dashboardStyles.table}>
                  <thead>
                    <tr>
                      <th>Docente</th>
                      <th>Correo</th>
                      <th>Cursos</th>
                      <th>{apiHabilitada ? "Inscripciones" : "Estudiantes"}</th>
                      <th>
                        {apiHabilitada ? "Asistencia" : "Asistencia demo"}
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docentesFiltrados.map(
                      ({
                        docente,
                        cursosAsignados,
                        estudiantes,
                        asistencia,
                      }) => (
                        <tr key={docente.id}>
                          <td>
                            <strong>{docente.nombre}</strong>
                          </td>
                          <td>{docente.email}</td>
                          <td>
                            {cursosAsignados.length > 0
                              ? cursosAsignados.join(", ")
                              : "Sin curso asignado"}
                          </td>
                          <td>{estudiantes}</td>
                          <td>
                            {apiHabilitada ? (
                              <Etiqueta tono="neutral">
                                No disponible
                              </Etiqueta>
                            ) : asistencia === null ? (
                              <Etiqueta tono="neutral">
                                Sin registros
                              </Etiqueta>
                            ) : (
                              <Etiqueta
                                tono={
                                  asistencia >= 75
                                    ? "exito"
                                    : "advertencia"
                                }
                              >
                                {asistencia}%
                              </Etiqueta>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                              onClick={() => abrirAsignacion(docente)}
                            >
                              Asignar curso
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <p className={ui.metaTexto} style={{ marginTop: 14 }}>
              {apiHabilitada
                ? "La asignación se guarda en PostgreSQL mediante PUT /api/cursos/{id}/docente. La asistencia aún no se consulta desde la API."
                : "La asignación de cursos se mantiene solo en la memoria de esta sesión. No se envía a PostgreSQL ni a la API."}
            </p>
          </>
        )}
      </section>

      <Modal
        abierto={Boolean(docenteAsignando)}
        titulo={`Asignar curso${
          docenteAsignando ? ` · ${docenteAsignando.nombre}` : ""
        }`}
        onCerrar={cerrarAsignacion}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={cerrarAsignacion}
              disabled={asignando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={() => void confirmarAsignacion()}
              disabled={!cursoSeleccionado || asignando}
            >
              {asignando
                ? "Asignando..."
                : apiHabilitada
                  ? "Asignar en la API"
                  : "Asignar en la demostración"}
            </button>
          </>
        }
      >
        {errorAsignacion && (
          <Aviso tono="peligro">{errorAsignacion}</Aviso>
        )}

        {cursosDisponibles.length === 0 ? (
          <EstadoVacio
            titulo="Sin cursos disponibles"
            descripcion={
              apiHabilitada
                ? "Todos los cursos de la API ya están asignados a este docente."
                : "Todos los cursos de demostración ya están asignados a este docente."
            }
          />
        ) : (
          <>
            <Aviso tono="info">
              {apiHabilitada
                ? "El cambio se guarda en PostgreSQL mediante PUT /api/cursos/{id}/docente."
                : "El cambio se guarda solo en la memoria de esta sesión. No modifica la base de datos ni la API."}
            </Aviso>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-asignar-docente"
              >
                Curso a asignar
              </label>
              <select
                id="curso-asignar-docente"
                value={cursoSeleccionado}
                onChange={(evento) =>
                  setCursoSeleccionado(evento.target.value)
                }
                disabled={asignando}
              >
                {cursosDisponibles.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.codigo} · {curso.nombre} · Docente actual:{" "}
                    {curso.docente}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </Modal>
    </PageLayout>
  );
}
