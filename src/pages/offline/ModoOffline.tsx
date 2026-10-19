
import { useState } from "react";
import { Link } from "wouter";
import { Menu } from "../../components/menu/Menu";
import {
  cargarRegistros,
  guardarRegistros,
  type RegistroLocal,
  type TipoRegistro,
} from "../../data/offlineData";
import styles from "./ModoOffline.module.css";

function Icono({
  tipo,
  size = 22,
}: {
  tipo: "offline" | "users" | "survey" | "sync";
  size?: number;
}) {
  const formas = {
    offline: (
      <>
        <path d="m3 3 18 18M4 9a12 12 0 0 1 12-2M8 13a7 7 0 0 1 5-1M12 19h.01" />
        <path d="M20 9a12 12 0 0 0-2-2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" />
      </>
    ),
    survey: (
      <>
        <rect x="5" y="5" width="14" height="17" rx="2" />
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <path d="M9 13h6M9 17h6" />
      </>
    ),
    sync: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.5-2" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {formas[tipo]}
    </svg>
  );
}

export function ModoOffline() {
  const [registros, setRegistros] = useState<RegistroLocal[]>(() => {
    try {
      return cargarRegistros();
    } catch {
      return [];
    }
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [tipoNuevo, setTipoNuevo] =
    useState<TipoRegistro>("asistencia");

  const asistencias = registros.filter(
    (r) => r.tipo === "asistencia"
  );

  const encuestas = registros.filter(
    (r) => r.tipo === "encuesta"
  );

  function agregarRegistro() {
    const nuevo: RegistroLocal = {
      id: `demo-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      tipo: tipoNuevo,
      eventoId: "EVT-016",
      identificador: `DEMO-${Date.now()}`,
      creadoEn: new Date().toISOString(),
      estado: "pendiente",
      demostracion: true,
    };

    const actualizados = [...registros, nuevo];

    try {
      guardarRegistros(actualizados);
      setRegistros(actualizados);
      setError("");
      setMensaje(
        "Registro de demostración guardado en este navegador."
      );
    } catch {
      setError(
        "No fue posible guardar los datos. Comprueba si el almacenamiento del navegador está disponible."
      );
    }
  }

  function intentarSincronizar() {
    setError("");
    setMensaje(
      "La sincronización todavía no está disponible: falta conectar el backend. Los registros permanecen pendientes."
    );
  }

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            <Link
              href="/dashboard"
              className={styles.volver}
              aria-label="Volver al dashboard"
            >
              ←
            </Link>
            <h1>Modo offline</h1>
            <span className={styles.opciones} aria-hidden="true">
              ⋮
            </span>
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

            <section className={styles.aviso}>
              <Icono tipo="offline" size={22} />
              <div>
                <strong>Modo de demostración offline</strong>
                <p>
                  Puedes conservar registros de prueba en
                  este dispositivo, incluso sin internet.
                </p>
              </div>
            </section>

            <section className={styles.resumen}>
              <strong>{registros.length} pendientes</strong>
              <p>Guardados localmente en este navegador</p>
              <span>
                {asistencias.length} asistencias +{" "}
                {encuestas.length} respuestas de encuesta
              </span>
            </section>

            <section className={styles.detalle}>
              <div className={styles.fila}>
                <span className={styles.iconoFila}>
                  <Icono tipo="users" />
                </span>
                <div className={styles.descripcion}>
                  <h2>Asistencias</h2>
                  <p>
                    EVT-016 ·{" "}
                    {asistencias.length > 0
                      ? asistencias
                          .slice(0, 3)
                          .map((r) => r.identificador)
                          .join(", ")
                      : "Sin registros"}
                  </p>
                </div>
                <strong>{asistencias.length}</strong>
              </div>

              <div className={styles.fila}>
                <span className={styles.iconoFila}>
                  <Icono tipo="survey" />
                </span>
                <div className={styles.descripcion}>
                  <h2>Encuestas</h2>
                  <p>
                    EVT-016 ·{" "}
                    {encuestas.length > 0
                      ? encuestas
                          .slice(0, 3)
                          .map((r) => r.identificador)
                          .join(", ")
                      : "Sin registros"}
                  </p>
                </div>
                <strong>{encuestas.length}</strong>
              </div>

              <div className={styles.ultima}>
                <strong>Última sincronización correcta</strong>
                <p>
                  Sin sincronización real registrada.
                  Backend pendiente de implementar.
                </p>
              </div>
            </section>

            <p className={styles.explicacion}>
              Los datos de prueba permanecerán en el
              almacenamiento del navegador mientras no
              se borren sus datos. Todavía no existe
              respaldo en un servidor.
            </p>

            <section className={styles.pruebas}>
              <h2>Herramientas de prueba</h2>
              <label htmlFor="tipoRegistro">
                Tipo de registro
              </label>
              <div className={styles.pruebasControles}>
                <select
                  id="tipoRegistro"
                  value={tipoNuevo}
                  onChange={(e) =>
                    setTipoNuevo(e.target.value as TipoRegistro)
                  }
                >
                  <option value="asistencia">Asistencia</option>
                  <option value="encuesta">Encuesta</option>
                </select>
                <button
                  type="button"
                  onClick={agregarRegistro}
                >
                  + Añadir prueba
                </button>
              </div>
            </section>

            <div className={styles.acciones}>
              <button
                type="button"
                className={styles.sincronizar}
                onClick={intentarSincronizar}
              >
                <Icono tipo="sync" size={23} />
                Sincronizar ahora
              </button>
              <p>
                Se necesita un servidor · Puedes volver
                a intentarlo cuando conectemos el backend.
              </p>
            </div>

            {mensaje && (
              <p className={styles.mensaje} role="status">
                {mensaje}
              </p>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
