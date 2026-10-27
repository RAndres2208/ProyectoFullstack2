import type { ReactNode } from "react";
import { Link } from "wouter";
import { Menu } from "../menu/Menu";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  titulo: string;
  descripcion?: string;
  volverA?: string;
  volverEtiqueta?: string;
  rol?: string;
  demo?: string;
  acciones?: ReactNode;
  children: ReactNode;
};

/**
 * Estructura común de las pantallas internas de SyncPass. Reutiliza el
 * menú, el encabezado, la identificación institucional y el workspace.
 */
export function PageLayout({
  titulo,
  descripcion,
  volverA,
  volverEtiqueta,
  rol,
  demo,
  acciones,
  children,
}: PageLayoutProps) {
  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            {volverA ? (
              <Link
                href={volverA}
                className={styles.volver}
                aria-label={volverEtiqueta ?? "Volver"}
              >
                ←
              </Link>
            ) : (
              <span className={styles.volverEspacio} aria-hidden="true" />
            )}

            <div className={styles.tituloGrupo}>
              <h1>{titulo}</h1>
              {descripcion && <p>{descripcion}</p>}
            </div>

            {acciones && (
              <div className={styles.acciones}>{acciones}</div>
            )}

            <span className={styles.opciones} aria-hidden="true">
              ⋮
            </span>
          </header>

          <main className={styles.contenido}>
            <div className={styles.institucion}>
              <span className={styles.rol}>
                {rol ?? "◈ Docente · Coordinador"}
              </span>
              <span className={styles.demo}>
                {demo ?? "DUOC UC · DEMO"}
              </span>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
