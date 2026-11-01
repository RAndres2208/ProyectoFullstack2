import { PageLayout } from "../../components/page-layout/PageLayout";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import styles from "../dashboard/Dashboard.module.css";

export function PerfilEstudiante() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const email = auth.user?.profile?.email || "estudiante@duoc.cl";

  return (
    <PageLayout titulo="Mi Perfil" descripcion="Información personal" volverA="/estudiante/dashboard" rol="◈ Estudiante" demo="DUOC UC · DEMO">
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Datos personales</h3>
            <p>Información de tu cuenta</p>
          </div>
        </header>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <th style={{ width: "200px" }}>Nombre</th>
                <td>{nombre}</td>
              </tr>
              <tr>
                <th>Correo</th>
                <td>{email}</td>
              </tr>
              <tr>
                <th>Rol</th>
                <td>Estudiante</td>
              </tr>
              <tr>
                <th>Institución</th>
                <td>DUOC UC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  );
}
