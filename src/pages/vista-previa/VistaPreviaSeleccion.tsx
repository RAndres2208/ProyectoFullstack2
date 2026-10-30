import { useVistaPrevia } from "../../auth/vistaPrevia";
import styles from "../seleccion/SeleccionRol.module.css";

export function VistaPreviaSeleccion() {
  const { activar } = useVistaPrevia();

  const entrarDocente = () => {
    activar("docente");
    window.location.href = "/docente/dashboard";
  };

  const entrarEstudiante = () => {
    activar("estudiante");
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
          <h1>Vista previa de roles</h1>
          <p>
            Visualización aislada para demostración académica. 
            No modifica permisos ni tokens de Cognito.
          </p>
          <span className={styles.demoBadge}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</span>
        </header>

        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardIcono} aria-hidden="true">🎓</div>
            <h2>Vista Docente</h2>
            <p>Administrar cursos, estudiantes y asistencias. CRUD simulados en memoria.</p>
            <button type="button" className={styles.boton} onClick={entrarDocente}>
              Ver vista Docente
            </button>
          </article>

          <article className={styles.card}>
            <div className={styles.cardIcono} aria-hidden="true">👨‍🎓</div>
            <h2>Vista Estudiante</h2>
            <p>Consultar mis cursos, asistencia y perfil. Datos de demostración.</p>
            <button type="button" className={styles.boton} onClick={entrarEstudiante}>
              Ver vista Estudiante
            </button>
          </article>
        </div>

        <footer className={styles.pie}>
          <button type="button" className={styles.botonSecundario} onClick={() => window.location.href = "/"}>
            Salir de vista previa
          </button>
        </footer>
      </section>
    </main>
  );
}
