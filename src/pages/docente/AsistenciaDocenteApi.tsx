import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, EstadoVacio } from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import styles from "../dashboard/Dashboard.module.css";
import academicoStyles from "../../components/academico/Academico.module.css";
import { cursoApiACurso, estudianteApiAEstudiante, listarCursosApi, listarEstudiantesDeCursoApi } from "../../services/academicoApi";
import { consultarAsistenciaCursoApi, guardarSesionAsistenciaApi } from "../../services/asistenciaApi";
import { ESTADOS_ASISTENCIA, type Curso, type EstadoAsistencia, type EstudianteAcademico, type RegistroAsistencia } from "../../types/academico";
import { formatearFecha } from "../../utils/format";

type Props = { token: string; sub: string };
type Marcas = Record<string, EstadoAsistencia>;

function hoyLocal(): string {
  const fecha = new Date();
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible consultar SyncPass API.";
}

export function AsistenciaDocenteApi({ token, sub }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState("");
  const [fecha, setFecha] = useState(hoyLocal);
  const [estudiantes, setEstudiantes] = useState<EstudianteAcademico[]>([]);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [marcas, setMarcas] = useState<Marcas>({});
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let activo = true;
    if (!token || !sub) {
      setCargandoCursos(false);
      setError("No se encontro una sesion valida de Cognito.");
      return;
    }
    setCargandoCursos(true);
    listarCursosApi(token).then((lista) => {
      if (!activo) return;
      const propios = lista.map(cursoApiACurso).filter((curso) => curso.docenteId === sub);
      setCursos(propios);
      setCursoId((prev) => propios.some((c) => c.id === prev) ? prev : propios[0]?.id ?? "");
      setError("");
    }).catch((e: unknown) => { if (activo) { setCursos([]); setError(mensajeError(e)); } })
      .finally(() => { if (activo) setCargandoCursos(false); });
    return () => { activo = false; };
  }, [token, sub]);

  useEffect(() => {
    let activo = true;
    if (!cursoId || !token) {
      setEstudiantes([]);
      setRegistros([]);
      setMarcas({});
      setCargandoSesion(false);
      return;
    }
    setCargandoSesion(true);
    setMensaje("");
    Promise.all([
      listarEstudiantesDeCursoApi(Number(cursoId), token),
      consultarAsistenciaCursoApi(cursoId, fecha, token),
    ]).then(([lista, asistencias]) => {
      if (!activo) return;
      const alumnos = lista.map(estudianteApiAEstudiante);
      setEstudiantes(alumnos);
      setRegistros(asistencias);
      const inicial: Marcas = {};
      for (const alumno of alumnos) inicial[alumno.id] = "Presente";
      for (const registro of asistencias) if (registro.estudianteId in inicial) inicial[registro.estudianteId] = registro.estado;
      setMarcas(inicial);
      setError("");
    }).catch((e: unknown) => {
      if (activo) { setEstudiantes([]); setRegistros([]); setMarcas({}); setError(mensajeError(e)); }
    }).finally(() => { if (activo) setCargandoSesion(false); });
    return () => { activo = false; };
  }, [cursoId, fecha, token, revision]);

  const curso = cursos.find((c) => c.id === cursoId);
  const bloqueado = cargandoCursos || cargandoSesion || guardando;
  const resumen = useMemo(() => {
    const conteo: Record<EstadoAsistencia, number> = { Presente: 0, Atrasado: 0, Ausente: 0 };
    for (const alumno of estudiantes) conteo[marcas[alumno.id] ?? "Presente"] += 1;
    return conteo;
  }, [estudiantes, marcas]);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!curso || !token || !sub || curso.docenteId !== sub) {
      setError("No tienes un curso asignado vÃ¡lido para registrar asistencia.");
      return;
    }
    if (!estudiantes.length) { setError("El curso no tiene estudiantes matriculados."); return; }
    setGuardando(true);
    setMensaje("");
    setError("");
    try {
      const guardados = await guardarSesionAsistenciaApi({
        cursoId: curso.id, fecha,
        registros: estudiantes.map((alumno) => ({
          estudianteId: alumno.id, estado: marcas[alumno.id] ?? "Presente",
        })),
      }, token);
      setRegistros(guardados);
      setMensaje(`Se guardÃ³ la asistencia de ${guardados.length} estudiantes mediante SyncPass API.`);
    } catch (fallo) { setError(mensajeError(fallo)); }
    finally { setGuardando(false); }
  }

  return (
    <PageLayout titulo="Gestionar Asistencia" descripcion="Asistencia real por curso y fecha" volverA="/docente/dashboard" rol="â—ˆ Docente" demo="DUOC UC Â· API">
      <Aviso tono="info">Los registros se consultan y guardan mediante SyncPass API. Solo puedes operar sobre cursos asignados a tu cuenta.</Aviso>
      {error && <Aviso tono="peligro">{error} <button type="button" onClick={() => setRevision((n) => n + 1)}>Reintentar</button></Aviso>}
      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {cargandoCursos ? <EstadoVacio titulo="Cargando cursos" descripcion="Consultando tus cursos asignados." /> : cursos.length === 0 ? (
        <EstadoVacio titulo="Sin cursos asignados" descripcion="Pide al coordinador que te asigne un curso." />
      ) : (
        <section className={ui.panel} aria-labelledby="asistencia-api-titulo">
          <div className={ui.panelCabecera}><div><h2 id="asistencia-api-titulo" className={ui.panelTitulo}>Registrar asistencia</h2><p className={ui.panelDescripcion}>Selecciona curso y fecha; despuÃ©s marca los estados.</p></div></div>
          <form onSubmit={(e) => void guardar(e)}>
            <div className={academicoStyles.filtros}>
              <div className={ui.campo}><label className={ui.campoEtiqueta} htmlFor="curso-asistencia-api">Curso</label><select id="curso-asistencia-api" value={cursoId} onChange={(e) => setCursoId(e.target.value)} disabled={bloqueado}>{cursos.map((c) => <option key={c.id} value={c.id}>{c.codigo} Â· {c.nombre}</option>)}</select></div>
              <div className={ui.campo}><label className={ui.campoEtiqueta} htmlFor="fecha-asistencia-api">Fecha</label><input id="fecha-asistencia-api" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={bloqueado}/></div>
            </div>
            {cargandoSesion ? <EstadoVacio titulo="Cargando estudiantes y asistencia" descripcion="Consultando las matrÃ­culas y los registros de la fecha." /> : estudiantes.length === 0 ? (
              <EstadoVacio titulo="Sin estudiantes inscritos" descripcion="El coordinador debe matricular estudiantes en este curso." />
            ) : (
              <>
                <p className={ui.metaTexto}>{estudiantes.length} estudiantes Â· SesiÃ³n {formatearFecha(fecha)}. Los registros sin marca previa estÃ¡n seleccionados como Presente; revÃ­salos antes de guardar.</p>
                {registros.length > 0 && <Aviso tono="advertencia">Existen {registros.length} registros de esta fecha. Guardar actualizarÃ¡ los estados en la API.</Aviso>}
                <div className={ui.botonesFila}>
                  <button type="button" className={`${ui.boton} ${ui.botonSecundario}`} disabled={bloqueado} onClick={() => setMarcas(Object.fromEntries(estudiantes.map((a) => [a.id, "Presente"])))}>Todos presentes</button>
                  <button type="button" className={`${ui.boton} ${ui.botonSecundario}`} disabled={bloqueado} onClick={() => setMarcas(Object.fromEntries(estudiantes.map((a) => [a.id, "Ausente"])))}>Todos ausentes</button>
                </div>
                <p className={ui.metaTexto}>{ESTADOS_ASISTENCIA.map((estado) => `${estado}: ${resumen[estado]}`).join(" Â· ")}</p>
                <div className={styles.tableWrapper}><table className={styles.table}><thead><tr><th>Estudiante</th><th>Asistencia</th></tr></thead><tbody>
                  {estudiantes.map((alumno) => <tr key={alumno.id}><td><strong>{alumno.nombre}</strong><p>{alumno.email} Â· {alumno.carrera}</p></td><td><div role="radiogroup" aria-label={`Asistencia de ${alumno.nombre}`} className={academicoStyles.selectorEstado}>{ESTADOS_ASISTENCIA.map((estado) => <label key={estado} className={academicoStyles.opcionEstado}><input type="radio" name={`asistencia-${alumno.id}`} checked={(marcas[alumno.id] ?? "Presente") === estado} onChange={() => setMarcas((prev) => ({ ...prev, [alumno.id]: estado }))} disabled={bloqueado}/>{estado}</label>)}</div></td></tr>)}
                </tbody></table></div>
                <div className={ui.botonesFila}><button type="submit" className={`${ui.boton} ${ui.botonPrimario}`} disabled={bloqueado}>{guardando ? "Guardando..." : "Guardar asistencia en la API"}</button></div>
              </>
            )}
          </form>
        </section>
      )}
    </PageLayout>
  );
}

