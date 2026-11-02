import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { useAcademico } from "../../context/AcademicoContext";
import {
  ESTADOS_ASISTENCIA,
  type EstadoAsistencia,
} from "../../types/academico";
import { formatearFecha } from "../../utils/format";
import { resolverDocenteActivo } from "../../utils/academico";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import academicoStyles from "../../components/academico/Academico.module.css";

type Marcas = Record<string, EstadoAsistencia>;

function fechaLocalHoy(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function tonoAsistencia(estado: EstadoAsistencia) {
  if (estado === "Presente") {
    return "exito" as const;
  }

  if (estado === "Atrasado") {
    return "advertencia" as const;
  }

  return "peligro" as const;
}

function claseOpcion(estado: EstadoAsistencia) {
  if (estado === "Presente") {
    return academicoStyles.opcionPresente;
  }

  if (estado === "Atrasado") {
    return academicoStyles.opcionAtrasado;
  }

  return academicoStyles.opcionAusente;
}

export function AsistenciaDocente() {
  const auth = useAuth();
  const {
    cursos,
    docentes,
    estudiantes,
    obtenerEstudiantesDeCurso,
    listarRegistrosAsistencia,
    guardarSesionAsistencia,
  } = useAcademico();

  const { docente, vinculado } = useMemo(
    () => resolverDocenteActivo(auth.user?.profile, docentes),
    [auth.user?.profile, docentes]
  );

  const cursosVisibles = useMemo(() => {
    if (!docente) {
      return cursos;
    }

    return cursos.filter((curso) => curso.docenteId === docente.id);
  }, [cursos, docente]);

  const [cursoId, setCursoId] = useState("");
  const [fecha, setFecha] = useState(fechaLocalHoy);
  const [marcasSesion, setMarcasSesion] = useState<{
    clave: string;
    valores: Marcas;
  }>({ clave: "", valores: {} });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cursoSeleccionado =
    cursosVisibles.find((curso) => curso.id === cursoId) ??
    cursosVisibles[0] ??
    null;

  const estudiantesCurso = useMemo(
    () =>
      cursoSeleccionado
        ? obtenerEstudiantesDeCurso(cursoSeleccionado.id)
        : [],
    [cursoSeleccionado, obtenerEstudiantesDeCurso]
  );

  const registrosSesion = useMemo(
    () =>
      cursoSeleccionado
        ? listarRegistrosAsistencia(cursoSeleccionado.id, fecha)
        : [],
    [cursoSeleccionado, fecha, listarRegistrosAsistencia]
  );

  const historial = useMemo(() => {
    if (!cursoSeleccionado) {
      return [];
    }

    return [...listarRegistrosAsistencia(cursoSeleccionado.id)].sort(
      (a, b) => {
        if (a.fecha !== b.fecha) {
          return b.fecha.localeCompare(a.fecha);
        }

        return b.registradoEn.localeCompare(a.registradoEn);
      }
    );
  }, [cursoSeleccionado, listarRegistrosAsistencia]);

  const marcasIniciales = useMemo<Marcas>(() => {
    const inicial: Marcas = {};

    for (const estudiante of estudiantesCurso) {
      inicial[estudiante.id] = "Presente";
    }

    for (const registro of registrosSesion) {
      if (estudianteCursoIncluye(estudiantesCurso, registro.estudianteId)) {
        inicial[registro.estudianteId] = registro.estado;
      }
    }

    return inicial;
  }, [estudiantesCurso, registrosSesion]);

  const claveSesion = `${cursoSeleccionado?.id ?? "sin-curso"}|${fecha}`;

  const marcas =
    marcasSesion.clave === claveSesion
      ? marcasSesion.valores
      : marcasIniciales;

  const resumen = useMemo(() => {
    const conteo: Record<EstadoAsistencia, number> = {
      Presente: 0,
      Atrasado: 0,
      Ausente: 0,
    };

    for (const estudiante of estudiantesCurso) {
      const estado = marcas[estudiante.id] ?? "Presente";
      conteo[estado] += 1;
    }

    return conteo;
  }, [estudiantesCurso, marcas]);

  const nombresEstudiantes = useMemo(
    () =>
      new Map(estudiantes.map((estudiante) => [estudiante.id, estudiante])),
    [estudiantes]
  );

  function cambiarCurso(id: string) {
    setCursoId(id);
    setMarcasSesion({ clave: "", valores: {} });
    setMensaje("");
    setError("");
  }

  function cambiarFecha(valor: string) {
    setFecha(valor);
    setMarcasSesion({ clave: "", valores: {} });
    setMensaje("");
    setError("");
  }

  function marcarEstudiante(
    estudianteId: string,
    estado: EstadoAsistencia
  ) {
    setMarcasSesion({
      clave: claveSesion,
      valores: { ...marcas, [estudianteId]: estado },
    });
    setMensaje("");
    setError("");
  }

  function marcarTodos(estado: EstadoAsistencia) {
    const siguiente: Marcas = {};
    for (const estudiante of estudiantesCurso) {
      siguiente[estudiante.id] = estado;
    }
    setMarcasSesion({ clave: claveSesion, valores: siguiente });
    setMensaje("");
    setError("");
  }

  function guardarAsistencia(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!cursoSeleccionado) {
      setError("Selecciona un curso para registrar la asistencia.");
      return;
    }

    if (!fecha) {
      setError("Selecciona la fecha de la sesión.");
      return;
    }

    if (estudiantesCurso.length === 0) {
      setError("El curso no tiene estudiantes inscritos en la demostración.");
      return;
    }

    const registros = estudiantesCurso.map((estudiante) => ({
      estudianteId: estudiante.id,
      estado: marcas[estudiante.id] ?? "Presente",
    }));

    guardarSesionAsistencia({
      cursoId: cursoSeleccionado.id,
      fecha,
      registros,
    });

    setError("");
    setMensaje(
      `Asistencia de "${cursoSeleccionado.nombre}" guardada en la memoria de esta sesión (${registros.length} estudiantes). No se envió a PostgreSQL ni a la API.`
    );
  }

  return (
    <PageLayout
      titulo="Gestionar Asistencia"
      descripcion="Registro de asistencia por curso y fecha · Modo demostración"
      volverA="/docente/dashboard"
      rol="◈ Docente"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        La asistencia se guarda solo en la memoria de esta sesión. No se envía a
        PostgreSQL ni a la API: el backend aún no publica el contrato de
        asistencia. Los estudiantes no pueden modificar estos registros.
      </AvisoDemo>

      {vinculado && docente ? (
        <Aviso tono="info">
          Sesión vinculada con <strong>{docente.nombre}</strong>. Solo se pueden
          registrar asistencias de sus cursos asignados.
        </Aviso>
      ) : (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha docente de
          demostración. Para no bloquear la vista, se muestran todos los cursos
          de ejemplo.
        </Aviso>
      )}

      {cursosVisibles.length === 0 ? (
        <EstadoVacio
          titulo="Sin cursos asignados"
          descripcion="Cuando tengas cursos asignados podrás registrar asistencia por fecha."
        />
      ) : (
        <>
          <section className={ui.panel} aria-labelledby="registro-asistencia">
            <div className={ui.panelCabecera}>
              <div>
                <h2 id="registro-asistencia" className={ui.panelTitulo}>
                  Registrar asistencia
                </h2>
                <p className={ui.panelDescripcion}>
                  Selecciona el curso y la fecha, luego marca a cada estudiante.
                </p>
              </div>
            </div>

            {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
            {error && <Aviso tono="peligro">{error}</Aviso>}

            <form onSubmit={guardarAsistencia} noValidate>
              <div className={academicoStyles.filtros}>
                <div className={ui.campo}>
                  <label
                    className={ui.campoEtiqueta}
                    htmlFor="asistencia-curso"
                  >
                    Curso
                  </label>
                  <select
                    id="asistencia-curso"
                    value={cursoSeleccionado?.id ?? ""}
                    onChange={(evento) => cambiarCurso(evento.target.value)}
                  >
                    {cursosVisibles.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.codigo} · {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={ui.campo}>
                  <label
                    className={ui.campoEtiqueta}
                    htmlFor="asistencia-fecha"
                  >
                    Fecha de la sesión
                  </label>
                  <input
                    id="asistencia-fecha"
                    type="date"
                    value={fecha}
                    onChange={(evento) => cambiarFecha(evento.target.value)}
                    required
                  />
                </div>
              </div>

              {cursoSeleccionado && (
                <p className={ui.textoSuave}>
                  Docente: <strong>{cursoSeleccionado.docente}</strong> ·{" "}
                  {estudiantesCurso.length}{" "}
                  {estudiantesCurso.length === 1
                    ? "estudiante inscrito"
                    : "estudiantes inscritos"}{" "}
                  · Sesión {formatearFecha(fecha)}
                </p>
              )}

              {estudiantesCurso.length > 0 && (
                <p className={ui.metaTexto}>
                  Los estudiantes sin registro previo para esta fecha aparecen
                  como <strong>Presente</strong> por defecto. Ajusta los estados
                  antes de guardar.
                </p>
              )}

              {registrosSesion.length > 0 && (
                <Aviso tono="advertencia">
                  Ya existen {registrosSesion.length} registros para esta fecha.
                  Al guardar se reemplazarán en la memoria de la sesión.
                </Aviso>
              )}

              {estudiantesCurso.length === 0 ? (
                <EstadoVacio
                  titulo="Sin estudiantes inscritos"
                  descripcion="Inscribe estudiantes desde la gestión de cursos para registrar su asistencia."
                />
              ) : (
                <>
                  <div className={ui.botonesFila}>
                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                      onClick={() => marcarTodos("Presente")}
                    >
                      Marcar todos presentes
                    </button>
                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                      onClick={() => marcarTodos("Ausente")}
                    >
                      Marcar todos ausentes
                    </button>
                  </div>

                  <div className={academicoStyles.progresoAsistencia}>
                    {ESTADOS_ASISTENCIA.map((estado) => (
                      <div
                        key={estado}
                        className={academicoStyles.contadorAsistencia}
                      >
                        <span>{estado}</span>
                        <strong>{resumen[estado]}</strong>
                      </div>
                    ))}
                  </div>

                  <div className={dashboardStyles.tableWrapper}>
                    <table className={dashboardStyles.table}>
                      <caption className={ui.srOnly}>
                        Estudiantes inscritos y su estado de asistencia
                      </caption>
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Estado de asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesCurso.map((estudiante) => {
                          const estado =
                            marcas[estudiante.id] ?? "Presente";

                          return (
                            <tr key={estudiante.id}>
                              <td>
                                <div
                                  className={academicoStyles.celdaAsistenciaInfo}
                                >
                                  <strong>{estudiante.nombre}</strong>
                                  <span>
                                    {estudiante.email} · {estudiante.carrera}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div
                                  className={academicoStyles.selectorEstado}
                                  role="radiogroup"
                                  aria-label={`Estado de ${estudiante.nombre}`}
                                >
                                  {ESTADOS_ASISTENCIA.map((opcion) => (
                                    <label
                                      key={opcion}
                                      className={`${academicoStyles.opcionEstado} ${
                                        estado === opcion
                                          ? claseOpcion(opcion)
                                          : ""
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`asistencia-${estudiante.id}`}
                                        value={opcion}
                                        checked={estado === opcion}
                                        onChange={() =>
                                          marcarEstudiante(
                                            estudiante.id,
                                            opcion
                                          )
                                        }
                                        className={academicoStyles.radioOculto}
                                      />
                                      {opcion}
                                    </label>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className={academicoStyles.metaFila}>
                    <p className={ui.metaTexto}>
                      Guardar reemplaza los registros de este curso y fecha solo
                      en la memoria de la sesión.
                    </p>
                    <button
                      type="submit"
                      className={`${ui.boton} ${ui.botonPrimario}`}
                    >
                      Guardar asistencia
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>

          <section
            className={ui.panel}
            aria-labelledby="historial-asistencia"
          >
            <div className={ui.panelCabecera}>
              <div>
                <h2 id="historial-asistencia" className={ui.panelTitulo}>
                  Registros previos del curso
                </h2>
                <p className={ui.panelDescripcion}>
                  Sesiones de demostración guardadas en esta sesión.
                </p>
              </div>
            </div>

            {historial.length === 0 ? (
              <EstadoVacio
                titulo="Sin registros previos"
                descripcion="Aún no hay asistencias guardadas para este curso en la memoria de la sesión."
              />
            ) : (
              <div className={dashboardStyles.tableWrapper}>
                <table className={dashboardStyles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante</th>
                      <th>Estado</th>
                      <th>Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((registro) => {
                      const estudiante = nombresEstudiantes.get(
                        registro.estudianteId
                      );

                      return (
                        <tr key={registro.id}>
                          <td>{formatearFecha(registro.fecha)}</td>
                          <td>
                            {estudiante?.nombre ?? registro.estudianteId}
                          </td>
                          <td>
                            <Etiqueta tono={tonoAsistencia(registro.estado)}>
                              {registro.estado}
                            </Etiqueta>
                          </td>
                          <td>
                            {registro.origen === "demo"
                              ? "Memoria de la sesión"
                              : "API"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className={ui.metaTexto} style={{ marginTop: 14 }}>
              Historial de demostración. La persistencia real en PostgreSQL
              requiere que el backend confirme el contrato de asistencia.
            </p>
          </section>
        </>
      )}
    </PageLayout>
  );
}

function estudianteCursoIncluye(
  estudiantesCurso: Array<{ id: string }>,
  estudianteId: string
): boolean {
  return estudiantesCurso.some(
    (estudiante) => estudiante.id === estudianteId
  );
}
