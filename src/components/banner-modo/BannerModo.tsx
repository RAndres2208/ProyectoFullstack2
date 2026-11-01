import type { ReactNode } from "react";
import styles from "./BannerModo.module.css";

type BannerModoProps = {
  tipo: "demo" | "vista-previa";
  onSalir?: () => void;
  onCambiar?: () => void;
  children?: ReactNode;
};

const TEXTOS = {
  demo: {
    titulo: "Modo demostración",
    detalle:
      "Datos ficticios. Esta vista no autoriza operaciones reales ni envía peticiones protegidas.",
  },
  "vista-previa": {
    titulo: "Vista previa de roles",
    detalle:
      "Recorrido visual aislado. Los permisos reales siguen dependiendo de los grupos de Cognito.",
  },
} as const;

/**
 * Identifica de forma visible cualquier recorrido con datos simulados.
 */
export function BannerModo({
  tipo,
  onSalir,
  onCambiar,
  children,
}: BannerModoProps) {
  const texto = TEXTOS[tipo];

  return (
    <aside className={styles.banner} role="status" aria-live="polite">
      <span className={styles.icono} aria-hidden="true">
        ◈
      </span>

      <div className={styles.texto}>
        <strong>{texto.titulo}</strong>
        <span>{texto.detalle}</span>
        {children}
      </div>

      <div className={styles.acciones}>
        {onCambiar && (
          <button
            type="button"
            className={styles.boton}
            onClick={onCambiar}
          >
            Cambiar vista
          </button>
        )}

        {onSalir && (
          <button
            type="button"
            className={styles.boton}
            onClick={onSalir}
          >
            Salir
          </button>
        )}
      </div>
    </aside>
  );
}
