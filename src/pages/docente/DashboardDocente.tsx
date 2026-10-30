import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { cursosDemo, estudiantesDemo } from "../../data/cursosData";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import styles from "../dashboard/Dashboard.module.css";

const accionesDocente = [
  { nombre: "Mantenedor Cursos", icono: "📚", ruta: "/docente/cursos" },
  { nombre: "Mantenedor Estudiantes", icono: "👥", ruta: "/docente/estudiantes" },
  { nombre: "Gestión Asistencia", icono: "✓", ruta: "/docente/asistencia" },
  { nombre: "Reportes", icono: "▥", ruta: "/reportes" },
  { nombre: "Participantes", icono: "♧", ruta: "/participantes" },
  { nombre: "Perfil", icono: "♙", ruta: "/perfil" },
];

export function DashboardDocente() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const cursosActivos = cursosDemo.filter(c => c.estado === "Activo").length;
  const totalEstudiantes = estudiantesDemo.length;

  return (
    <PageLayout titulo="Dashboard Docente" descripcion="Panel de coordinación - Gestión académica y asistencia" rol="◈ Docente · Coordinador" demo="DUOC UC · DEMO">
      <section className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>Panel de coordinación - Gestión académica y asistencia</p>
        </div>
      </section>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div>
            <p className={styles.statLabel}>Cursos activos</p>
            <p className={styles.statValue}>{cursosActivos}</p>
          </div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div>
            <p className={styles.statLabel}>Total estudiantes</p>
            <p className={styles.statValue}>{totalEstudiantes}</p>
          </div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <div>
            <p className={styles.statLabel}>Asistencias registradas</p>
            <p className={styles.statValue}>12</p>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Accesos rápidos</h3>
            <p>Gestión docente</p>
          </div>
        </header>
        <div className={styles.actionsGrid}>
          {accionesDocente.map((accion) => (
            <Link key={accion.nombre} href={accion.ruta} className={styles.actionCard}>
              <span className={styles.actionIcon}>{accion.icono}</span>
              <span>{accion.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Cursos administrados</h3>
            <p>Listado de cursos asignados</p>
          </div>
          <Link href="/docente/cursos" className={styles.sectionLink}>Administrar</Link>
        </header>
        <div className={styles.list}>
          {cursosDemo.slice(0, 3).map(curso => (
            <article key={curso.id} className={styles.listItem}>
              <div>
                <strong>{curso.nombre}</strong>
                <p>{curso.codigo} · {curso.estudiantes} estudiantes</p>
              </div>
              <span className={curso.estado === "Activo" ? styles.badgeSuccess : styles.badgeWarning}>{curso.estado}</span>
            </article>
          ))}
        </div>
      </section>

      <p className={styles.note}>Datos de demostración · Preparado para integración con API REST</p>
    </PageLayout>
  );
}
