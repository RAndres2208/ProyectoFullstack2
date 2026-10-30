import { PageLayout } from "../../components/page-layout/PageLayout";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import styles from "../dashboard/Dashboard.module.css";

export function MiAsistencia() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);

  const asistencia = [
    { curso: "Programación Web", fecha: "2025-10-15", estado: "Presente" },
    { curso: "Base de Datos", fecha: "2025-10-16", estado: "Presente" },
    { curso: "Ingeniería de Software", fecha: "2025-10-17", estado: "Ausente" },
  ];

  return (
    <PageLayout titulo="Mi Asistencia" descripcion="Registro de asistencia - Solo consulta" volverA="/estudiante/dashboard" rol="Estudiante" demo="DUOC UC · DEMO">
      <div className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Hola,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>Consulta tu historial de asistencia</p>
        </div>
      </div>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Historial</h3>
            <p>Últimos registros</p>
          </div>
        </header>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {asistencia.map((a, idx) => (
                <tr key={idx}>
                  <td>{a.curso}</td>
                  <td>{a.fecha}</td>
                  <td>
                    <span className={a.estado === "Presente" ? styles.badgeSuccess : styles.badgeWarning}>
                      {a.estado}
                    </span>
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
