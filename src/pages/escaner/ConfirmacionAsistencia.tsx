
import { Link, useParams } from "wouter";
import { Menu } from "../../components/menu/Menu";
import styles from "./Escaner.module.css";

export function ConfirmacionAsistencia() {
  const params = useParams<{ id: string }>();

  const codigo = params.id ?? "SP-024";

  const fechaSimulada = "16 oct 2026 · 10:42:18";

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            <Link href="/escaner" className={styles.volver}>
              ←
            </Link>
            <h1>Asistencia registrada</h1>
            <span aria-hidden="true">⋮</span>
          </header>

          <main className={styles.contenido}>
            <div className={styles.institucion}>
              <span className={styles.rol}>
                ◈ Monitor · Voluntario
              </span>
              <span className={styles.demo}>
                DUOC UC · DEMO
              </span>
            </div>

            <section className={styles.confirmacion}>
              <div className={styles.iconoExito}>
                ✓
              </div>

              <h2>¡Asistencia registrada!</h2>

              <p>
                Confirmación simulada para este evento.
              </p>
            </section>

            <section className={styles.comprobante}>
              <div className={styles.comprobanteEncabezado}>
                <strong>{codigo}</strong>
                <span className={styles.validado}>
                  ✓ Código de prueba
                </span>
              </div>

              <div className={styles.comprobanteSeparador} />

              <h3>Alfabetización digital</h3>
              <p className={styles.textoSuave}>
                EVT-016 · Conecta Barrio
              </p>

              <p className={styles.fecha}>
                {fechaSimulada}
              </p>

              <p className={styles.textoSuave}>
                ID de demostración · Sin registro persistente
              </p>
            </section>

            <div className={styles.aviso}>
              <span className={styles.avisoIcono}>◉</span>

              <div>
                <strong>Simulación local · No guardada</strong>
                <p>
                  Aún no se ha registrado asistencia en
                  ningún dispositivo ni servidor.
                </p>
              </div>
            </div>

            <div className={styles.botonesConfirmacion}>
              <Link
                href="/escaner"
                className={styles.botonPrincipal}
              >
                ⌗ Escanear siguiente
              </Link>

              <Link
                href="/offline"
                className={styles.botonSecundario}
              >
                ↥ Ver registros pendientes
              </Link>
            </div>

            <p className={styles.nota}>
              Vista de demostración · Sin autenticación ni
              sincronización real.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
