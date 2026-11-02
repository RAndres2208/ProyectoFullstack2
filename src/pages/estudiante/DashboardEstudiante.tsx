import { useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, AvisoDemo } from "../../components/ui/Ui";
import { useAcademico } from "../../context/AcademicoContext";
import { resolverEstudianteActivo } from "../../utils/academico";
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
  const {
    estudiantes,
    registrosAsistencia,
    listarCursosPorPerfil,
  } = useAcademico();

  const { estudiante, vinculado } = useMemo(
    () => resolverEstudianteActivo(auth.user?.profile, estudiantes),
    [auth.user?.profile, estudiantes]
  );

  const misCursos = useMemo(
    () =>
      estudiante
        ? listarCursosPorPerfil({
            rol: "estudiante",
            estudianteId: estudiante.id,
          })
        : [],
    [estudiante, listarCursosPorPerfil]
  );

  const cursosActivos = misCursos.filter(
    (curso) => curso.estado === "Activo"
  ).length;

  const asistencia = useMemo(() => {
    if (!estudiante) {
      return null;
    }

    const idsCursos = new Set(misCursos.map((curso) => curso.id));
    const registros = registrosAsistencia.filter(
      (registro) =>
        registro.estudianteId === estudiante.id &&
        idsCursos.has(registro.cursoId)
    );

    if (registros.length === 0) {
      return null;
    }

    const asistidos = registros.filter(
      (registro) => registro.estado !== "Ausente"
    ).length;

    return Math.round((asistidos / registros.length) * 100);
  }, [estudiante, misCursos, registrosAsistencia]);

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
        Los cursos, indicadores y registros de esta vista son ficticios y viven
        en la memoria de la sesión. Los estudiantes solo pueden consultar.
      </AvisoDemo>

      {!vinculado && (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha estudiantil
          de demostración. Se usa como referencia la ficha de{" "}
          <strong>{estudiante?.nombre ?? "un estudiante de ejemplo"}</strong>;
          este vínculo no es real.
        </Aviso>
      )}

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
            <p className={styles.statLabel}>Asistencia registrada</p>
            <p className={styles.statValue}>
              {asistencia === null ? "—" : `${asistencia}%`}
            </p>
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

        {misCursos.length === 0 ? (
          <p className={styles.note}>
            La ficha de demostración no tiene cursos inscritos.
          </p>
        ) : (
          <div className={styles.list}>
            {misCursos.map((curso) => (
              <article key={curso.id} className={styles.listItem}>
                <div>
                  <strong>{curso.nombre}</strong>
                  <p>{curso.descripcion || "Sin descripción"}</p>
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
        )}
      </section>

      <p className={styles.note}>
        Datos de demostración en memoria · Solo consulta para estudiantes
      </p>
    </PageLayout>
  );
}
