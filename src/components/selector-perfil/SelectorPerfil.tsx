import { useId } from "react";
import { useLocation } from "wouter";
import { usePerfilActivo } from "../../auth/perfilActivo";
import {
  ROLES,
  parseRolSyncPass,
} from "../../auth/roles";
import styles from "./SelectorPerfil.module.css";

type SelectorPerfilProps = {
  variante?: "oscuro" | "claro";
};

/**
 * Selector de perfil visual para sesiones con más de un grupo de Cognito.
 * Solo enumera los roles presentes en la sesión autenticada.
 */
export function SelectorPerfil({
  variante = "oscuro",
}: SelectorPerfilProps) {
  const [, setLocation] = useLocation();
  const { roles, rolActivo, seleccionarRol } = usePerfilActivo();
  const id = useId();

  if (roles.length === 0 || !rolActivo) {
    return null;
  }

  const cambiarPerfil = (valor: string) => {
    const rol = parseRolSyncPass(valor);

    if (!rol || !roles.includes(rol)) {
      return;
    }

    seleccionarRol(rol);
    setLocation(ROLES[rol].rutaInicio);
  };

  if (roles.length === 1) {
    return (
      <div
        className={`${styles.contenedor} ${styles[variante]} ${styles.unico}`}
      >
        <span className={styles.etiqueta}>Perfil verificado</span>
        <strong>{ROLES[rolActivo].etiqueta}</strong>
      </div>
    );
  }

  return (
    <div className={`${styles.contenedor} ${styles[variante]}`}>
      <label htmlFor={id} className={styles.etiqueta}>
        Cambiar perfil
      </label>

      <select
        id={id}
        className={styles.selector}
        value={rolActivo}
        onChange={(evento) => cambiarPerfil(evento.target.value)}
      >
        {roles.map((rol) => (
          <option key={rol} value={rol}>
            {ROLES[rol].etiqueta}
          </option>
        ))}
      </select>

      <span className={styles.ayuda}>
        Solo se muestran los roles de tu sesión.
      </span>
    </div>
  );
}
