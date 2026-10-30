import { useAuth } from "react-oidc-context";
import { useLocation } from "wouter";
import { useRol } from "../../auth/roles";
import { useDemoRole } from "../../auth/demoRole";
import styles from "./SeleccionRol.module.css";

export function SeleccionRol() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const { esDocente, esEstudiante } = useRol();
  const { setRolDemo } = useDemoRole();

  // Si tiene rol real, redirigir directamente
  if (esDocente) {
    setLocation("/docente/dashboard");
    return null;
  }
  if (esEstudiante) {
    setLocation("/estudiante/dashboard");
    return null;
  }

  const entrarComoDocente = () => {
    setRolDemo("docente");
    window.location.href = "/docente/dashboard";
  };

  const entrarComoEstudiante = () => {
    setRolDemo("estudiante");
    window.location.href = "/estudiante/dashboard";
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
            Modo DEMO - Sin grupos Cognito detectados. 
            Esta selección es únicamente para demostración académica.
          </p>
          <span className={styles.demoBadge}>DEMO - VISUALIZACIÓN</span>
        </header>

        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardIcono} aria-hidden="true">🎓</div>
            <h2>Docente</h2>
            <p>Administrar cursos, estudiantes y asistencias. Acceso a mantenedores web.</p>
            <button type="button" className={styles.boton} onClick={entrarComoDocente}>
              Entrar como docente
            </button>
          </article>

          <article className={styles.card}>
            <div className={styles.cardIcono} aria-hidden="true">👨‍🎓</div>
            <h2>Estudiante</h2>
            <p>Consultar mis cursos, asistencia y perfil. Experiencia simplificada.</p>
            <button type="button" className={styles.boton} onClick={entrarComoEstudiante}>
              Entrar como estudiante
            </button>
          </article>
        </div>

        <footer className={styles.pie}>
          <button type="button" className={styles.botonSecundario} onClick={() => auth.signoutRedirect()}>
            Cerrar sesión
          </button>
        </footer>
      </section>
    </main>
  );
}
