import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { cursosDemo } from "../../data/cursosData";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import styles from "../dashboard/Dashboard.module.css";

export function DashboardEstudiante() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const misCursos = cursosDemo.filter(c => c.id === "CUR-001" || c.id === "CUR-002");

  return (
    <PageLayout titulo="Dashboard Estudiante" descripcion="Panel de estudiante - Consulta y seguimiento académico" rol="◈ Estudiante" demo="DUOC UC · DEMO">
      <section className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>Panel de estudiante - Consulta y seguimiento académico</p>
        </div>
      </section>
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Mis Cursos</h3>
            <p>Cursos en los que estás inscrito</p>
          </div>
          <Link href="/estudiante/mis-cursos" className={styles.sectionLink}>Ver todos</Link>
        </header>
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {misCursos.map(curso => (
            <div key={curso.id} style={{ padding: "1rem", background: "#fff", borderRadius: "0.75rem", border: "1px solid rgba(120,47,64,0.2)" }}>
              <strong>{curso.nombre}</strong>
              <p style={{ margin: "0.25rem 0", color: "#6b4f4f", fontSize: "0.875rem" }}>{curso.descripcion}</p>
              <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}>Docente: {curso.docente}</p>
              <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", background: "#e8f5e9", borderRadius: "0.25rem" }}>{curso.estado}</span>
            </div>
          ))}
        </div>
      </section>
      <p className={styles.note}>Datos de demostración · Vista simplificada para estudiante</p>
    </PageLayout>
  );
}
