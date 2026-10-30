import { PageLayout } from "../../components/page-layout/PageLayout";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario } from "../../auth/roles";
import styles from "../dashboard/Dashboard.module.css";

export function PerfilEstudiante() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const email = auth.user?.profile?.email || "estudiante@duoc.cl";

  return (
    <PageLayout titulo="Mi Perfil" descripcion="Información personal" volverA="/estudiante/dashboard" rol="Estudiante" demo="DUOC UC · DEMO">
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Datos personales</h3>
            <p>Información de tu cuenta</p>
          </div>
        </header>
        <div style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <div>
            <strong>Nombre:</strong>
            <p style={{ margin: "0.25rem 0", color: "#6b4f4f" }}>{nombre}</p>
          </div>
          <div>
            <strong>Correo:</strong>
            <p style={{ margin: "0.25rem 0", color: "#6b4f4f" }}>{email}</p>
          </div>
          <div>
            <strong>Rol:</strong>
            <p style={{ margin: "0.25rem 0", color: "#6b4f4f" }}>Estudiante</p>
          </div>
          <div>
            <strong>Institución:</strong>
            <p style={{ margin: "0.25rem 0", color: "#6b4f4f" }}>DUOC UC</p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
