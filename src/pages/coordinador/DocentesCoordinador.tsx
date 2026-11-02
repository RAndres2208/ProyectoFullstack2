import { useMemo, useState } from "react";
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
  const {
    docentes,
    cursos,
    registrosAsistencia,
    obtenerEstudiantesDeCurso,
    asignarDocente,
  } = useAcademico();

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [docenteAsignando, setDocenteAsignando] =
    useState<DocenteAcademico | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  const docentesConDatos = useMemo<DocenteConDatos[]>(() => {
    return docentes.map((docente) => {
      const cursosDelDocente = cursos.filter(
        (curso) => curso.docenteId === docente.id
      );
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
        cursosAsignados: cursosDelDocente.map((curso) => curso.nombre),
        estudiantes: estudiantes.size,
        asistencia:
          totalRegistros > 0
            ? Math.round((presentes / totalRegistros) * 100)
            : null,
        registros: totalRegistros,
      };
    });
  }, [cursos, docentes, obtenerEstudiantesDeCurso, registrosAsistencia]);

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

  function abrirAsignacion(docente: DocenteAcademico) {
    const disponibles = cursos.filter(
      (curso) => curso.docenteId !== docente.id
    );

    setMensaje("");
    setDocenteAsignando(docente);
    setCursoSeleccionado(disponibles[0]?.id ?? "");
  }

  function confirmarAsignacion() {
    if (!docenteAsignando || !cursoSeleccionado) {
      return;
    }

    const curso = cursos.find((item) => item.id === cursoSeleccionado);
    const actualizado = asignarDocente(
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
    setDocenteAsignando(null);
    setCursoSeleccionado("");
  }

  return (
    <PageLayout
      titulo="Docentes asignados"
      descripcion="Equipo docente, cursos y asistencia de referencia · Modo demostración"
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Los docentes, cursos y porcentajes se calculan con datos ficticios de
        esta sesión. No existe todavía un endpoint de coordinación para
        consultarlos.
      </AvisoDemo>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Equipo docente</h3>
            <p>Cursos asignados y registros de asistencia de demostración</p>
          </div>
        </header>

        <Buscador
          id="buscar-docentes-coordinador"
          etiqueta="Buscar docentes por nombre, correo o curso"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre, correo o curso..."
        />

        {docentesFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="Sin docentes coincidentes"
            descripcion="Ajusta la búsqueda para ver otros docentes del ámbito."
          />
        ) : (
          <div className={dashboardStyles.tableWrapper}>
            <table className={dashboardStyles.table}>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Correo</th>
                  <th>Cursos</th>
                  <th>Estudiantes</th>
                  <th>Asistencia demo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.map(
                  ({ docente, cursosAsignados, estudiantes, asistencia }) => (
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
                        {asistencia === null ? (
                          <Etiqueta tono="neutral">Sin registros</Etiqueta>
                        ) : (
                          <Etiqueta
                            tono={asistencia >= 75 ? "exito" : "advertencia"}
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
          La asignación de cursos se mantiene solo en la memoria de esta sesión.
          No se envía a PostgreSQL ni a la API.
        </p>
      </section>

      <Modal
        abierto={Boolean(docenteAsignando)}
        titulo={`Asignar curso${
          docenteAsignando ? ` · ${docenteAsignando.nombre}` : ""
        }`}
        onCerrar={() => setDocenteAsignando(null)}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setDocenteAsignando(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={confirmarAsignacion}
              disabled={!cursoSeleccionado}
            >
              Asignar en la demostración
            </button>
          </>
        }
      >
        {cursosDisponibles.length === 0 ? (
          <EstadoVacio
            titulo="Sin cursos disponibles"
            descripcion="Todos los cursos de demostración ya están asignados a este docente."
          />
        ) : (
          <>
            <Aviso tono="info">
              El cambio se guarda solo en la memoria de esta sesión. No modifica
              la base de datos ni la API.
            </Aviso>

            <div className={ui.campo}>
              <label className={ui.campoEtiqueta} htmlFor="curso-asignar-docente">
                Curso a asignar
              </label>
              <select
                id="curso-asignar-docente"
                value={cursoSeleccionado}
                onChange={(evento) =>
                  setCursoSeleccionado(evento.target.value)
                }
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
