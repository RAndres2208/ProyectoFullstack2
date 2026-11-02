import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import { useAcademico } from "../../context/AcademicoContext";
import { resolverEstudianteActivo } from "../../utils/academico";
import styles from "../dashboard/Dashboard.module.css";

export function MisCursos() {
  const auth = useAuth();
  const { estudiantes, listarCursosPorPerfil } = useAcademico();

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

  return (
    <PageLayout
      titulo="Mis Cursos"
      descripcion="Cursos inscritos · Solo consulta"
      volverA="/estudiante/dashboard"
      rol="◈ Estudiante"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Este listado usa cursos e inscripciones de demostración guardados en la
        memoria de la sesión. La consulta real se habilitará cuando exista un
        endpoint académico para estudiantes.
      </AvisoDemo>

      {vinculado && estudiante ? (
        <Aviso tono="info">
          Sesión vinculada por correo o nombre con la ficha de demostración de{" "}
          <strong>{estudiante.nombre}</strong>. La vista es solo de consulta.
        </Aviso>
      ) : (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha estudiantil
          de demostración. Se muestra como referencia la ficha de{" "}
          <strong>{estudiante?.nombre ?? "un estudiante de ejemplo"}</strong>;
          este vínculo no es real.
        </Aviso>
      )}

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Listado de cursos</h3>
            <p>
              {estudiante
                ? `Cursos en los que está inscrito ${estudiante.nombre}`
                : "Cursos en los que estás inscrito"}
            </p>
          </div>
        </header>

        {misCursos.length === 0 ? (
          <EstadoVacio
            titulo="Sin cursos inscritos"
            descripcion="La ficha de demostración no tiene cursos inscritos en este momento."
          />
        ) : (
          <div className={styles.list}>
            {misCursos.map((curso) => (
              <article key={curso.id} className={styles.listItem}>
                <div>
                  <strong>{curso.nombre}</strong>
                  <p>{curso.descripcion || "Sin descripción"}</p>
                  <p>
                    Código: {curso.codigo} · Docente: {curso.docente} ·
                    Estudiantes: {curso.estudiantes}
                  </p>
                </div>
                <Etiqueta
                  tono={curso.estado === "Activo" ? "exito" : "neutral"}
                >
                  {curso.estado}
                </Etiqueta>
              </article>
            ))}
          </div>
        )}

        <p className={styles.note}>
          Solo consulta: los estudiantes no pueden crear, modificar ni eliminar
          cursos, inscripciones o registros de asistencia.
        </p>
      </section>
    </PageLayout>
  );
}
