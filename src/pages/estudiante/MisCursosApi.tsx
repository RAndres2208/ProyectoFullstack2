import { useEffect, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, EstadoVacio, Etiqueta } from "../../components/ui/Ui";
import { cursoApiACurso, listarCursosDeEstudianteApi } from "../../services/academicoApi";
import type { Curso } from "../../types/academico";
import styles from "../dashboard/Dashboard.module.css";

type Props = { token: string; sub: string };
export function MisCursosApi({ token, sub }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let activo = true;
    if (!token || !sub) { setError("Falta la identidad de Cognito. Inicia sesión nuevamente."); setCargando(false); return; }
    setCargando(true);
    listarCursosDeEstudianteApi(sub, token).then((datos) => { if (activo) { setCursos(datos.map(cursoApiACurso)); setError(""); } })
      .catch((e: unknown) => { if (activo) { setCursos([]); setError(e instanceof Error ? e.message : "No fue posible consultar tus cursos."); } })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [token, sub, revision]);
  return <PageLayout titulo="Mis Cursos" descripcion="Cursos en los que estás matriculado" volverA="/estudiante/dashboard" rol="◈ Estudiante" demo="DUOC UC · API">
    <Aviso tono="info">Estos cursos se consultan desde SyncPass API con tu identidad Cognito.</Aviso>
    {error && <Aviso tono="peligro">{error} <button type="button" onClick={() => setRevision((x) => x + 1)}>Reintentar</button></Aviso>}
    <section className={styles.section}><header className={styles.sectionHeader}><div><h3>Listado de cursos</h3><p>Solo consulta</p></div></header>
      {cargando ? <EstadoVacio titulo="Cargando cursos" descripcion="Consultando tus matrículas." /> : !error && (cursos.length === 0 ? <EstadoVacio titulo="Sin cursos inscritos" descripcion="No tienes cursos matriculados." /> : <div className={styles.list}>{cursos.map((curso) => <article className={styles.listItem} key={curso.id}><div><strong>{curso.nombre}</strong><p>{curso.descripcion || "Sin descripción"}</p><p>Código: {curso.codigo} · Docente: {curso.docente} · Estudiantes: {curso.estudiantes}</p></div><Etiqueta tono={curso.estado === "Activo" ? "exito" : "neutral"}>{curso.estado}</Etiqueta></article>)}</div>)}
      <p className={styles.note}>Solo consulta: las matrículas y los cursos se administran desde Coordinación.</p>
    </section>
  </PageLayout>;
}
