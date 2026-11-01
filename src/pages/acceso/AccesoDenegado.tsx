import { Link } from "wouter";
import { usePerfilActivo } from "../../auth/perfilActivo";
import { ROLES } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, Etiqueta } from "../../components/ui/Ui";
import dashboardStyles from "../dashboard/Dashboard.module.css";

export function AccesoDenegado() {
  const { roles, rolActivo } = usePerfilActivo();
  const inicio = rolActivo
    ? ROLES[rolActivo].rutaInicio
    : "/seleccion-rol";

  return (
    <PageLayout
      titulo="Acceso restringido"
      descripcion="Tu sesión no pertenece al grupo requerido para esta vista"
      rol="◈ Sesión verificada"
      demo="COGNITO · SIN AUTORIZACIÓN"
    >
      <Aviso tono="peligro">
        <strong>No tienes acceso a esta sección.</strong> Escribir la URL de
        forma manual no cambia los grupos asignados a tu cuenta.
      </Aviso>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Perfiles disponibles en tu sesión</h3>
            <p>La autorización se valida con los grupos de Cognito</p>
          </div>
        </header>

        <div className={dashboardStyles.list}>
          {roles.length === 0 ? (
            <p>Tu sesión no tiene grupos de SyncPass asignados.</p>
          ) : (
            roles.map((rol) => (
              <article
                key={rol}
                className={dashboardStyles.listItem}
              >
                <div>
                  <strong>{ROLES[rol].etiqueta}</strong>
                  <p>{ROLES[rol].descripcion}</p>
                </div>
                <Etiqueta tono={rol === rolActivo ? "exito" : "neutral"}>
                  {rol === rolActivo ? "Perfil activo" : "Disponible"}
                </Etiqueta>
              </article>
            ))
          )}
        </div>

        <div className={dashboardStyles.actionsGrid}>
          <Link href={inicio} className={dashboardStyles.actionCard}>
            <span
              className={dashboardStyles.actionIcon}
              aria-hidden="true"
            >
              ⌂
            </span>
            <span>Volver a mi panel</span>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
