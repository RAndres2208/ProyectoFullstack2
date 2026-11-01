import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  AvisoDemo,
  BarraProgreso,
  Etiqueta,
} from "../../components/ui/Ui";
import {
  asistenciaCursosDemo,
  docentesCoordinacionDemo,
} from "../../data/coordinacionData";
import { cursosDemo } from "../../data/cursosData";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import styles from "./Coordinacion.module.css";

const accesos = [
  {
    nombre: "Cursos del ámbito",
    icono: "📚",
    ruta: "/coordinador/cursos",
  },
  {
    nombre: "Docentes asignados",
    icono: "👥",
    ruta: "/coordinador/docentes",
  },
  {
    nombre: "Asistencia por curso",
    icono: "✓",
    ruta: "/coordinador/asistencia",
  },
  {
    nombre: "Reportes",
    icono: "▥",
    ruta: "/reportes",
  },
];

function promedioAsistencia(): number {
  if (asistenciaCursosDemo.length === 0) {
    return 0;
  }

  const total = asistenciaCursosDemo.reduce(
    (suma, curso) => suma + curso.tasa,
    0
  );

  return Math.round(total / asistenciaCursosDemo.length);
}

export function DashboardCoordinador() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const totalEstudiantes = cursosDemo.reduce(
    (suma, curso) => suma + curso.estudiantes,
    0
  );
  const asistenciaPromedio = promedioAsistencia();

  return (
    <PageLayout
      titulo="Dashboard Coordinador"
      descripcion="Indicadores académicos de tu ámbito · Datos de demostración"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <section className={dashboardStyles.welcome}>
        <div>
          <p className={dashboardStyles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={dashboardStyles.welcomeName}>{nombre}</h2>
          <p className={dashboardStyles.welcomeSubtitle}>
            Seguimiento académico de cursos, docentes y asistencia
          </p>
        </div>
      </section>

      <AvisoDemo>
        Esta vista usa indicadores ficticios mientras la API no exponga
        endpoints específicos para Coordinación. No representa una
        integración funcional ni habilita operaciones protegidas.
      </AvisoDemo>

      <section className={dashboardStyles.stats}>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>📚</div>
          <div>
            <p className={dashboardStyles.statLabel}>Cursos del ámbito</p>
            <p className={dashboardStyles.statValue}>{cursosDemo.length}</p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>👩‍🏫</div>
          <div>
            <p className={dashboardStyles.statLabel}>Docentes asignados</p>
            <p className={dashboardStyles.statValue}>
              {docentesCoordinacionDemo.length}
            </p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>👥</div>
          <div>
            <p className={dashboardStyles.statLabel}>Estudiantes inscritos</p>
            <p className={dashboardStyles.statValue}>{totalEstudiantes}</p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>✓</div>
          <div>
            <p className={dashboardStyles.statLabel}>Asistencia promedio</p>
            <p className={dashboardStyles.statValue}>{asistenciaPromedio}%</p>
          </div>
        </article>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Accesos de coordinación</h3>
            <p>Información académica disponible en esta vista</p>
          </div>
        </header>

        <div className={dashboardStyles.actionsGrid}>
          {accesos.map((acceso) => (
            <Link
              key={acceso.ruta}
              href={acceso.ruta}
              className={dashboardStyles.actionCard}
            >
              <span className={dashboardStyles.actionIcon} aria-hidden="true">
                {acceso.icono}
              </span>
              <span>{acceso.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Asistencia por curso</h3>
            <p>Umbral institucional de referencia: 75%</p>
          </div>
          <Link
            href="/coordinador/asistencia"
            className={dashboardStyles.sectionLink}
          >
            Ver detalle
          </Link>
        </header>

        <div className={dashboardStyles.list}>
          {asistenciaCursosDemo.map((curso) => (
            <article key={curso.cursoId} className={styles.itemAsistencia}>
              <div className={styles.datosCurso}>
                <strong>{curso.curso}</strong>
                <p>
                  {curso.docente} · {curso.presentes} de {curso.sesiones}{" "}
                  sesiones con asistencia
                </p>
              </div>

              <div className={styles.progreso}>
                <BarraProgreso
                  valor={curso.tasa}
                  umbral={75}
                  etiqueta={curso.tasa >= 75 ? "Sobre el umbral" : "Bajo el umbral"}
                />
              </div>

              <Etiqueta tono={curso.tasa >= 75 ? "exito" : "advertencia"}>
                {curso.tasa}%
              </Etiqueta>
            </article>
          ))}
        </div>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Docentes del ámbito</h3>
            <p>Cursos y asistencia registrada por docente</p>
          </div>
          <Link
            href="/coordinador/docentes"
            className={dashboardStyles.sectionLink}
          >
            Ver docentes
          </Link>
        </header>

        <div className={dashboardStyles.list}>
          {docentesCoordinacionDemo.map((docente) => (
            <article key={docente.id} className={dashboardStyles.listItem}>
              <div>
                <strong>{docente.nombre}</strong>
                <p>
                  {docente.cursos.join(" · ")} · {docente.estudiantes}{" "}
                  estudiantes
                </p>
              </div>
              <Etiqueta tono={docente.asistencia >= 80 ? "exito" : "advertencia"}>
                {docente.asistencia}% asistencia
              </Etiqueta>
            </article>
          ))}
        </div>
      </section>

      <p className={dashboardStyles.note}>
        Datos de demostración · Preparado para una futura integración con la
        API académica
      </p>
    </PageLayout>
  );
}
