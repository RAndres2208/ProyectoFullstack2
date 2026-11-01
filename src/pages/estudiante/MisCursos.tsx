import { PageLayout } from "../../components/page-layout/PageLayout";
import { AvisoDemo } from "../../components/ui/Ui";
import { cursosDemo } from "../../data/cursosData";
import styles from "../dashboard/Dashboard.module.css";

export function MisCursos() {
  const misCursos = cursosDemo.filter(c => c.id === "CUR-001" || c.id === "CUR-002");

  return (
    <PageLayout titulo="Mis Cursos" descripcion="Cursos inscritos - Solo consulta" volverA="/estudiante/dashboard" rol="◈ Estudiante" demo="DUOC UC · DEMO">
      <AvisoDemo>
        Este listado usa cursos de demostración. La consulta de cursos reales
        se habilitará cuando exista un endpoint para estudiantes.
      </AvisoDemo>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Listado de cursos</h3>
            <p>Cursos en los que estás inscrito</p>
          </div>
        </header>
        <div className={styles.list}>
          {misCursos.map(curso => (
            <article key={curso.id} className={styles.listItem}>
              <div>
                <strong>{curso.nombre}</strong>
                <p>{curso.descripcion}</p>
                <p>Código: {curso.codigo} · Docente: {curso.docente} · Estudiantes: {curso.estudiantes}</p>
              </div>
              <span className={curso.estado === "Activo" ? styles.badgeSuccess : styles.badgeWarning}>{curso.estado}</span>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
