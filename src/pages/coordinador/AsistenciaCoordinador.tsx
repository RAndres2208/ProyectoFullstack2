import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  AvisoDemo,
  BarraProgreso,
  Etiqueta,
} from "../../components/ui/Ui";
import { asistenciaCursosDemo } from "../../data/coordinacionData";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import styles from "./Coordinacion.module.css";

export function AsistenciaCoordinador() {
  return (
    <PageLayout
      titulo="Asistencia por curso"
      descripcion="Indicadores de asistencia del ámbito · Datos de demostración"
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Los porcentajes son demostrativos y no provienen de la API. El umbral
        de 75% se muestra solo como referencia visual.
      </AvisoDemo>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Resumen por curso</h3>
            <p>Sesiones registradas y asistencia estimada</p>
          </div>
        </header>

        <div className={dashboardStyles.list}>
          {asistenciaCursosDemo.map((curso) => (
            <article key={curso.cursoId} className={styles.itemAsistencia}>
              <div className={styles.datosCurso}>
                <strong>{curso.curso}</strong>
                <p>
                  {curso.docente} · {curso.presentes} presentes ·{" "}
                  {curso.ausentes} ausentes · {curso.sesiones} sesiones
                </p>
              </div>

              <div className={styles.progreso}>
                <BarraProgreso
                  valor={curso.tasa}
                  umbral={75}
                  etiqueta="Asistencia acumulada"
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
            <h3>Detalle numérico</h3>
            <p>Resumen de sesiones consideradas en la demostración</p>
          </div>
        </header>

        <div className={dashboardStyles.tableWrapper}>
          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Docente</th>
                <th>Sesiones</th>
                <th>Presentes</th>
                <th>Ausentes</th>
                <th>Tasa</th>
              </tr>
            </thead>
            <tbody>
              {asistenciaCursosDemo.map((curso) => (
                <tr key={curso.cursoId}>
                  <td>{curso.curso}</td>
                  <td>{curso.docente}</td>
                  <td>{curso.sesiones}</td>
                  <td>{curso.presentes}</td>
                  <td>{curso.ausentes}</td>
                  <td>{curso.tasa}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  );
}
