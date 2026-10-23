
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "../../components/menu/Menu";
import styles from "./Escaner.module.css";

export function EscanerQR() {
  const [, navigate] = useLocation();

  const [identificador, setIdentificador] = useState("");
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [linterna, setLinterna] = useState(false);
  const [error, setError] = useState("");

  function simularLectura() {
    // Código fijo para probar el flujo del prototipo.
    navigate("/asistencia/confirmacion/SP-024");
  }

  function registrarSimulacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const codigo = identificador.trim().toUpperCase();

    if (!/^[A-Z0-9-]{3,30}$/.test(codigo)) {
      setError(
        "Ingresa un identificador de 3 a 30 caracteres: letras, números o guiones."
      );
      return;
    }

    setError("");
    navigate(
      `/asistencia/confirmacion/${encodeURIComponent(codigo)}`
    );
  }

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            <Link href="/eventos/evt-016" className={styles.volver}>
              ←
            </Link>
            <h1>Escáner QR</h1>
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

            <section className={styles.eventoInfo}>
              <h2>Alfabetización digital</h2>

              <div className={styles.eventoMeta}>
                <span>EVT-016 · 16 oct 2026</span>
                <span className={styles.offline}>
                  Sin internet · Demo
                </span>
              </div>
            </section>

            <section
              className={`${styles.camara} ${
                linterna ? styles.camaraIluminada : ""
              }`}
              aria-label="Vista simulada del escáner QR"
            >
              <span className={styles.camaraEtiqueta}>
                CÁMARA SIMULADA
              </span>

              <div className={styles.lineaHorizontal} />
              <div className={styles.lineaVertical} />

              <div className={styles.marcoQR}>
                <span className={styles.esquinaSuperiorIzquierda} />
                <span className={styles.esquinaSuperiorDerecha} />
                <span className={styles.esquinaInferiorIzquierda} />
                <span className={styles.esquinaInferiorDerecha} />
              </div>

              <button
                type="button"
                className={styles.linterna}
                onClick={() => setLinterna(!linterna)}
                aria-pressed={linterna}
                aria-label={
                  linterna
                    ? "Desactivar iluminación simulada"
                    : "Activar iluminación simulada"
                }
                title="Iluminación simulada"
              >
                {linterna ? "☀" : "♜"}
              </button>
            </section>

            <p className={styles.instruccion}>
              Centra el código dentro del marco
            </p>

            <div className={styles.aviso}>
              <span className={styles.avisoIcono}>◉</span>
              <div>
                <strong>Demostración sin conexión</strong>
                <p>
                  En esta etapa no se utiliza la cámara ni
                  se almacenan asistencias reales.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.botonSecundario}
              onClick={() => {
                setMostrarBusqueda(!mostrarBusqueda);
                setError("");
              }}
              aria-expanded={mostrarBusqueda}
            >
              Buscar por identificador
            </button>

            {mostrarBusqueda && (
              <form
                className={styles.formulario}
                onSubmit={registrarSimulacion}
              >
                <label htmlFor="identificador">
                  Identificador del participante
                </label>

                <input
                  id="identificador"
                  type="text"
                  value={identificador}
                  onChange={(event) =>
                    setIdentificador(event.target.value)
                  }
                  placeholder="Ejemplo: SP-024"
                  maxLength={30}
                  autoComplete="off"
                  aria-invalid={Boolean(error)}
                />

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.botonPrincipal}
                >
                  Simular validación
                </button>
              </form>
            )}

            <button
              type="button"
              className={styles.enlaceDemo}
              onClick={simularLectura}
            >
              Probar código de ejemplo SP-024 →
            </button>

            <p className={styles.nota}>
              Búsqueda y demostración autorizadas para
              fines de desarrollo.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
