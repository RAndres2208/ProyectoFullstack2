import { useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  Buscador,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { useAcademico } from "../../context/AcademicoContext";
import { normalizarTexto } from "../../utils/format";
import { resolverDocenteActivo } from "../../utils/academico";
import styles from "../dashboard/Dashboard.module.css";
import academicoStyles from "../../components/academico/Academico.module.css";

export function EstudiantesDocente() {
  const auth = useAuth();
  const { cursos, docentes, estudiantes, obtenerEstudiantesDeCurso } =
    useAcademico();

  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("Todos");

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

  const estudiantesConCursos = useMemo(() => {
    const cursosPorEstudiante = new Map<string, string[]>();

    for (const curso of cursosVisibles) {
      for (const estudiante of obtenerEstudiantesDeCurso(curso.id)) {
        const cursosActuales = cursosPorEstudiante.get(estudiante.id) ?? [];
        cursosActuales.push(curso.nombre);
        cursosPorEstudiante.set(estudiante.id, cursosActuales);
      }
    }

    return estudiantes
      .filter((estudiante) => cursosPorEstudiante.has(estudiante.id))
      .map((estudiante) => ({
        ...estudiante,
        cursosInscritos: cursosPorEstudiante.get(estudiante.id) ?? [],
      }));
  }, [cursosVisibles, estudiantes, obtenerEstudiantesDeCurso]);

  const estudiantesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    const cursoSeleccionado = cursosVisibles.find(
      (curso) => curso.id === filtroCurso
    );

    return estudiantesConCursos.filter((estudiante) => {
      const coincideCurso =
        filtroCurso === "Todos" ||
        (cursoSeleccionado
          ? estudiante.cursosInscritos.includes(cursoSeleccionado.nombre)
          : false);

      if (!coincideCurso) {
        return false;
      }

      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${estudiante.nombre} ${estudiante.email} ${estudiante.carrera} ${estudiante.cursosInscritos.join(" ")}`
      ).includes(texto);
    });
  }, [busqueda, cursosVisibles, estudiantesConCursos, filtroCurso]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroCurso("Todos");
  }

  return (
    <PageLayout
      titulo="Estudiantes del docente"
      descripcion="Estudiantes inscritos en tus cursos · Modo demostración"
      volverA="/docente/dashboard"
      rol="◈ Docente"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Las inscripciones son de demostración y viven solo en la memoria de esta
        sesión. La API todavía no expone un endpoint de matrículas.
      </AvisoDemo>

      {vinculado && docente ? (
        <Aviso tono="info">
          Sesión vinculada con <strong>{docente.nombre}</strong>. El listado se
          limita a los estudiantes inscritos en sus cursos asignados.
        </Aviso>
      ) : (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha docente de
          demostración. Se muestran los estudiantes de todos los cursos de
          ejemplo.
        </Aviso>
      )}

      <div className={academicoStyles.filtros}>
        <Buscador
          id="buscar-estudiantes-docente"
          etiqueta="Buscar estudiantes por nombre, correo, carrera o curso"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre, correo, carrera o curso..."
        />

        <div className={ui.campo}>
          <label className={ui.campoEtiqueta} htmlFor="filtro-curso-estudiantes">
            Curso
          </label>
          <select
            id="filtro-curso-estudiantes"
            value={filtroCurso}
            onChange={(evento) => setFiltroCurso(evento.target.value)}
          >
            <option value="Todos">Todos los cursos</option>
            {cursosVisibles.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.codigo} · {curso.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={ui.resultadoCabecera}>
        <p className={ui.resultadoConteo} role="status">
          {estudiantesFiltrados.length}{" "}
          {estudiantesFiltrados.length === 1
            ? "estudiante encontrado"
            : "estudiantes encontrados"}{" "}
          de {estudiantesConCursos.length}
        </p>

        {(busqueda || filtroCurso !== "Todos") && (
          <button
            type="button"
            className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {cursosVisibles.length === 0 ? (
        <EstadoVacio
          titulo="Sin cursos asignados"
          descripcion="Cuando tengas cursos asignados, aquí aparecerán sus estudiantes inscritos."
        />
      ) : estudiantesConCursos.length === 0 ? (
        <EstadoVacio
          titulo="Sin estudiantes inscritos"
          descripcion="Inscribe estudiantes desde la pantalla de cursos para verlos en este listado."
        />
      ) : estudiantesFiltrados.length === 0 ? (
        <EstadoVacio
          titulo="Sin estudiantes coincidentes"
          descripcion="Ajusta la búsqueda o el filtro de curso para ver otros estudiantes."
          accion={
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Correo</th>
                <th>Carrera</th>
                <th>Cursos en tu ámbito</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map((estudiante) => (
                <tr key={estudiante.id}>
                  <td>
                    <strong>{estudiante.nombre}</strong>
                  </td>
                  <td>{estudiante.email}</td>
                  <td>{estudiante.carrera}</td>
                  <td>
                    <Etiqueta tono="info">
                      {estudiante.cursosInscritos.length}{" "}
                      {estudiante.cursosInscritos.length === 1
                        ? "curso"
                        : "cursos"}
                    </Etiqueta>
                    <p className={ui.metaTexto}>
                      {estudiante.cursosInscritos.join(" · ")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className={ui.metaTexto} style={{ marginTop: 14 }}>
        Datos de demostración. La matrícula real se habilitará cuando el backend
        publique el contrato de inscripciones académicas.
      </p>
    </PageLayout>
  );
}
