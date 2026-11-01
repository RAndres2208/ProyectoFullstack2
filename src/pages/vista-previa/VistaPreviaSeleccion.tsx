import { useLocation } from "wouter";
import {
  ORDEN_ROLES,
  ROLES,
  type RolSyncPass,
} from "../../auth/roles";
import { useVistaPrevia } from "../../auth/vistaPrevia";
import styles from "../seleccion/SeleccionRol.module.css";

/**
 * Acceso a la vista previa de los cuatro perfiles. El recorrido queda
 * aislado de la sesión real y no modifica los grupos de Cognito.
 */
export function VistaPreviaSeleccion() {
  const { activar, salir } = useVistaPrevia();
  const [, setLocation] = useLocation();

  const entrarComo = (rol: RolSyncPass) => {
    activar(rol);
    setLocation(ROLES[rol].rutaInicio);
  };

  const salirDeVistaPrevia = () => {
    salir();
    setLocation("/");
  };

  return (
    <main className={styles.contenedor}>
      <section className={styles.tarjeta}>
        <header className={styles.cabecera}>
          <div className={styles.marca}>
            <span aria-hidden="true">▣</span>
            SyncPass
          </div>
          <h1>Vista previa de roles</h1>
          <p>
            Recorre las pantallas de cada perfil con datos de demostración.
            Esta vista no modifica permisos, tokens ni la sesión de Cognito.
          </p>
          <span className={styles.demoBadge}>
            VISTA PREVIA · DATOS DE DEMOSTRACIÓN
          </span>
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
                Ver vista {ROLES[rol].etiqueta}
              </button>
            </article>
          ))}
        </div>

        <p className={styles.nota}>
          Al salir de la vista previa volverás a tu sesión real. Los permisos
          siguen dependiendo de los grupos asignados en Cognito.
        </p>

        <footer className={styles.pie}>
          <button
            type="button"
            className={styles.botonSecundario}
            onClick={salirDeVistaPrevia}
          >
            Salir de vista previa
          </button>
        </footer>
      </section>
    </main>
  );
}
