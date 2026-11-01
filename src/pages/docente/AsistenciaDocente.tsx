import { PageLayout } from "../../components/page-layout/PageLayout";
import { useState } from "react";
import styles from "../dashboard/Dashboard.module.css";

export function AsistenciaDocente() {
  const [asistencias] = useState([
    { id: 1, estudiante: "Ana García", curso: "Programación Web", fecha: "2025-10-20", estado: "Presente" },
    { id: 2, estudiante: "Carlos López", curso: "Base de Datos", fecha: "2025-10-20", estado: "Ausente" },
    { id: 3, estudiante: "María Rodríguez", curso: "Programación Web", fecha: "2025-10-21", estado: "Presente" },
  ]);

  return (
    <PageLayout titulo="Gestionar Asistencia" descripcion="Registro y control de asistencia - Modo demostración" volverA="/docente/dashboard" rol="◈ Docente" demo="DUOC UC · DEMO">
      <section className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Fecha</th>
                <th style={{ textAlign: "center" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map(a => (
                <tr key={a.id}>
                  <td>{a.estudiante}</td>
                  <td>{a.curso}</td>
                  <td>{a.fecha}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={a.estado === "Presente" ? styles.badgeSuccess : styles.badgeWarning}>{a.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  );
}
