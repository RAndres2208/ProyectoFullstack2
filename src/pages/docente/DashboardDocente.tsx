import { useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, AvisoDemo } from "../../components/ui/Ui";
import { useAcademico } from "../../context/AcademicoContext";
import { resolverDocenteActivo } from "../../utils/academico";
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
  const {
    cursos,
    docentes,
    registrosAsistencia,
    obtenerEstudiantesDeCurso,
  } = useAcademico();

  const { docente, vinculado } = useMemo(
    () => resolverDocenteActivo(auth.user?.profile, docentes),
    [auth.user?.profile, docentes]
  );

  const cursosVisibles = useMemo(
    () =>
      docente
        ? cursos.filter((curso) => curso.docenteId === docente.id)
        : cursos,
    [cursos, docente]
  );

  const estudiantesVisibles = useMemo(() => {
    const ids = new Set<string>();

    for (const curso of cursosVisibles) {
      for (const estudiante of obtenerEstudiantesDeCurso(curso.id)) {
        ids.add(estudiante.id);
      }
    }

    return ids.size;
  }, [cursosVisibles, obtenerEstudiantesDeCurso]);

  const asistenciasRegistradas = useMemo(() => {
    const idsCursos = new Set(cursosVisibles.map((curso) => curso.id));

    return registrosAsistencia.filter((registro) =>
      idsCursos.has(registro.cursoId)
    ).length;
  }, [cursosVisibles, registrosAsistencia]);

  const cursosActivos = cursosVisibles.filter(
    (curso) => curso.estado === "Activo"
  ).length;

  return (
    <PageLayout
      titulo="Dashboard Docente"
      descripcion="Panel docente - Gestión académica y asistencia"
      rol="◈ Docente"
      demo="DUOC UC · DEMO"
    >
      <section className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>
            Panel docente - Gestión académica y asistencia
          </p>
        </div>
      </section>

      <AvisoDemo>
        Los cursos, estudiantes y asistencias de esta vista son ficticios y
        viven en la memoria de la sesión. Los cambios no se guardan en la API.
      </AvisoDemo>

      {!vinculado && (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha docente de
          demostración. Los indicadores muestran todos los cursos de ejemplo.
        </Aviso>
      )}

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
            <p className={styles.statLabel}>Estudiantes</p>
            <p className={styles.statValue}>{estudiantesVisibles}</p>
          </div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <div>
            <p className={styles.statLabel}>Asistencias registradas</p>
            <p className={styles.statValue}>{asistenciasRegistradas}</p>
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
            <Link
              key={accion.nombre}
              href={accion.ruta}
              className={styles.actionCard}
            >
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
          <Link href="/docente/cursos" className={styles.sectionLink}>
            Administrar
          </Link>
        </header>
        {cursosVisibles.length === 0 ? (
          <p className={styles.note}>
            No hay cursos asignados en la demostración.
          </p>
        ) : (
          <div className={styles.list}>
            {cursosVisibles.slice(0, 3).map((curso) => (
              <article key={curso.id} className={styles.listItem}>
                <div>
                  <strong>{curso.nombre}</strong>
                  <p>
                    {curso.codigo} · {curso.estudiantes} estudiantes
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
        )}
      </section>

      <p className={styles.note}>
        Datos de demostración en memoria · Preparado para integración con API
        REST
      </p>
    </PageLayout>
  );
}
