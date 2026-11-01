import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { cursosDemo } from "../../data/cursosData";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { AvisoDemo } from "../../components/ui/Ui";
import styles from "../dashboard/Dashboard.module.css";

const accionesEstudiante = [
  { nombre: "Mis cursos", icono: "📚", ruta: "/estudiante/mis-cursos" },
  {
    nombre: "Mi asistencia",
    icono: "✓",
    ruta: "/estudiante/mi-asistencia",
  },
  { nombre: "Escáner QR", icono: "▦", ruta: "/escaner" },
  { nombre: "Encuestas", icono: "◫", ruta: "/encuestas" },
];

export function DashboardEstudiante() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const misCursos = cursosDemo.filter(
    (curso) => curso.id === "CUR-001" || curso.id === "CUR-002"
  );
  const cursosActivos = misCursos.filter(
    (curso) => curso.estado === "Activo"
  ).length;

  return (
    <PageLayout
      titulo="Dashboard Estudiante"
      descripcion="Consulta tus cursos, asistencia y actividad académica"
      rol="◈ Estudiante"
      demo="DUOC UC · DEMO"
    >
      <section className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>
            Este es tu resumen académico de demostración
          </p>
        </div>
      </section>

      <AvisoDemo>
        Los cursos, indicadores y registros de esta vista son ficticios. La
        consulta de datos reales se habilitará cuando la API académica
        publique los endpoints para estudiantes.
      </AvisoDemo>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div>
            <p className={styles.statLabel}>Cursos inscritos</p>
            <p className={styles.statValue}>{misCursos.length}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <div>
            <p className={styles.statLabel}>Cursos activos</p>
            <p className={styles.statValue}>{cursosActivos}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div>
            <p className={styles.statLabel}>Asistencia estimada</p>
            <p className={styles.statValue}>92%</p>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Accesos rápidos</h3>
            <p>Las secciones disponibles para tu perfil</p>
          </div>
        </header>

        <div className={styles.actionsGrid}>
          {accionesEstudiante.map((accion) => (
            <Link
              key={accion.ruta}
              href={accion.ruta}
              className={styles.actionCard}
            >
              <span className={styles.actionIcon} aria-hidden="true">
                {accion.icono}
              </span>
              <span>{accion.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Mis cursos</h3>
            <p>Cursos en los que estás inscrito</p>
          </div>
          <Link
            href="/estudiante/mis-cursos"
            className={styles.sectionLink}
          >
            Ver todos
          </Link>
        </header>

        <div className={styles.list}>
          {misCursos.map((curso) => (
            <article key={curso.id} className={styles.listItem}>
              <div>
                <strong>{curso.nombre}</strong>
                <p>{curso.descripcion}</p>
                <p>
                  Docente: {curso.docente} · {curso.codigo}
                </p>
              </div>
              <span
                className={
                  curso.estado === "Activo"
                    ? styles.badgeSuccess
                    : styles.badgeWarning
                }
              >
                {curso.estado}
              </span>
            </article>
          ))}
        </div>
      </section>

      <p className={styles.note}>
        Datos de demostración · Vista simplificada para estudiante
      </p>
    </PageLayout>
  );
}
