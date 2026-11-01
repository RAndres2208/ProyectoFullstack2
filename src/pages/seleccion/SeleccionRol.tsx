import { useAuth } from "react-oidc-context";
import { Redirect, useLocation } from "wouter";
import {
  ORDEN_ROLES,
  ROLES,
  rolPrincipal,
  useRoles,
  type RolSyncPass,
} from "../../auth/roles";
import { useDemoRole } from "../../auth/demoRole";
import styles from "./SeleccionRol.module.css";

/**
 * Selector de demostración para sesiones sin grupos de SyncPass. Los roles
 * que aparecen aquí no provienen de Cognito: solo habilitan un recorrido
 * visual con datos ficticios y nunca autorizan llamadas a la API.
 */
export function SeleccionRol() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const { roles } = useRoles();
  const { setRolDemo } = useDemoRole();

  const rolReal = rolPrincipal(roles);

  if (rolReal) {
    return <Redirect to={ROLES[rolReal].rutaInicio} />;
  }

  const entrarComo = (rol: RolSyncPass) => {
    setRolDemo(rol);
    setLocation(ROLES[rol].rutaInicio);
  };

  return (
    <main className={styles.contenedor}>
      <section className={styles.tarjeta}>
        <header className={styles.cabecera}>
          <div className={styles.marca}>
            <span aria-hidden="true">▣</span>
            SyncPass
          </div>
          <h1>Selecciona tu experiencia</h1>
          <p>
            {auth.isAuthenticated
              ? "Tu sesión no tiene grupos de SyncPass asignados. Puedes recorrer las cuatro vistas con datos ficticios para conocer la plataforma."
              : "Estás en el recorrido de demostración. Elige un perfil para conocer la plataforma con datos ficticios, sin iniciar sesión."}
          </p>
          <span className={styles.demoBadge}>DEMO · SIN PERMISOS REALES</span>
        </header>

        <div className={styles.grid}>
          {ORDEN_ROLES.map((rol) => (
            <article className={styles.card} key={rol}>
              <div className={styles.cardIcono} aria-hidden="true">
                {ROLES[rol].icono}
              </div>
              <h2>{ROLES[rol].etiqueta}</h2>
              <p>{ROLES[rol].descripcion}</p>
              <button
                type="button"
                className={styles.boton}
                onClick={() => entrarComo(rol)}
              >
                Entrar como {ROLES[rol].etiqueta} (demo)
              </button>
            </article>
          ))}
        </div>

        <p className={styles.nota}>
          La autorización real depende exclusivamente de los grupos de
          Cognito. Esta selección no modifica tu token ni tus permisos.
        </p>

        {auth.isAuthenticated && (
          <footer className={styles.pie}>
            <button
              type="button"
              className={styles.botonSecundario}
              onClick={() => void auth.signoutRedirect()}
            >
              Cerrar sesión
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
