import { useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, EstadoVacio, Etiqueta } from "../../components/ui/Ui";
import { historialAsistenciaEstudianteApi } from "../../services/asistenciaApi";
import { cursoApiACurso, listarCursosDeEstudianteApi } from "../../services/academicoApi";
import type { Curso, EstadoAsistencia, RegistroAsistencia } from "../../types/academico";
import { formatearFecha } from "../../utils/format";
import styles from "../dashboard/Dashboard.module.css";

type Props = { token: string; sub: string };
function tono(estado: EstadoAsistencia) { return estado === "Presente" ? "exito" as const : estado === "Atrasado" ? "advertencia" as const : "peligro" as const; }
export function MiAsistenciaApi({ token, sub }: Props) {
  const auth = useAuth();
  const [historial, setHistorial] = useState<RegistroAsistencia[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let activo = true;
    if (!token || !sub) { setCargando(false); setError("Falta la identidad de Cognito. Inicia sesión nuevamente."); return; }
    setCargando(true);
    Promise.all([historialAsistenciaEstudianteApi(sub, token), listarCursosDeEstudianteApi(sub, token)])
      .then(([asistencias, inscritos]) => {
        if (!activo) return;
        setHistorial([...asistencias].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.registradoEn.localeCompare(a.registradoEn)));
        setCursos(inscritos.map(cursoApiACurso));
        setError("");
      }).catch((e: unknown) => { if (activo) { setError(e instanceof Error ? e.message : "No se pudo consultar la API."); setHistorial([]); setCursos([]); } })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [token, sub, revision]);
  const nombres = useMemo(() => new Map(cursos.map((c) => [c.id, c.nombre])), [cursos]);
  const resumen = useMemo(() => ({
    Presente: historial.filter((r) => r.estado === "Presente").length,
    Atrasado: historial.filter((r) => r.estado === "Atrasado").length,
    Ausente: historial.filter((r) => r.estado === "Ausente").length,
  }), [historial]);
  return <PageLayout titulo="Mi Asistencia" descripcion="Historial real de asistencia · Solo consulta" volverA="/estudiante/dashboard" rol="◈ Estudiante" demo="DUOC UC · API">
    <div className={styles.welcome}><div><p className={styles.welcomeLabel}>Hola,</p><h2 className={styles.welcomeName}>{obtenerNombreUsuario(auth.user?.profile)}</h2><p className={styles.welcomeSubtitle}>Consulta los registros vinculados a tu identidad Cognito.</p></div></div>
    <Aviso tono="info">Los registros proceden de SyncPass API. No puedes modificar la asistencia.</Aviso>
    {error && <Aviso tono="peligro">{error} <button type="button" onClick={() => setRevision((x) => x + 1)}>Reintentar</button></Aviso>}
    {cargando ? <EstadoVacio titulo="Consultando asistencia" descripcion="Cargando tu historial desde la API." /> : !error && <>
      <p className={styles.note}>Registros: {historial.length} · Presente: {resumen.Presente} · Atrasado: {resumen.Atrasado} · Ausente: {resumen.Ausente}</p>
      <section className={styles.section}><header className={styles.sectionHeader}><div><h3>Historial</h3><p>Registros guardados por tus docentes</p></div></header>
        {historial.length === 0 ? <EstadoVacio titulo="Sin registros" descripcion="Todavía no tienes asistencias registradas." /> : <div className={styles.tableWrapper}><table className={styles.table}><thead><tr><th>Curso</th><th>Fecha</th><th>Estado</th><th>Origen</th></tr></thead><tbody>
          {historial.map((registro) => <tr key={registro.id}><td>{nombres.get(registro.cursoId) ?? `Curso ${registro.cursoId}`}</td><td>{formatearFecha(registro.fecha)}</td><td><Etiqueta tono={tono(registro.estado)}>{registro.estado}</Etiqueta></td><td>API</td></tr>)}
        </tbody></table></div>}
      </section>
    </>}
  </PageLayout>;
}
