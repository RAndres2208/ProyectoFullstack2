
import { Link } from "wouter";
import { Menu } from "../../components/menu/Menu";
import { dashboardData } from "../../data/dashboardData";
import styles from "./Dashboard.module.css";

const acciones = [
  {
    nombre: "Participantes",
    icono: "♧",
    ruta: "/participantes",
  },
  {
    nombre: "Quórum",
    icono: "◉",
    ruta: "/quorum",
  },
  {
    nombre: "Encuestas",
    icono: "▤",
    ruta: "/encuestas",
  },
  {
    nombre: "Modo offline",
    icono: "⌁",
    ruta: "/offline",
  },
  {
    nombre: "Historial",
    icono: "◷",
    ruta: "/historial",
  },
  {
    nombre: "Reportes",
    icono: "▥",
    ruta: "/reportes",
  },
];

export function Dashboard() {
  const { usuario, conexion, asistencia, evento } =
    dashboardData;

  const porcentaje =
    asistencia.inscritos > 0
      ? Math.round(
          (asistencia.asistentes / asistencia.inscritos) * 100
        )
      : 0;

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>▣</span>
              <strong>SyncPass</strong>
            </div>

            <Link
              href="/perfil"
              className={styles.profileButton}
              aria-label="Ver perfil"
            >
              ◉
            </Link>
          </header>

          <main className={styles.main}>
            <div className={styles.institution}>
              <span className={styles.role}>
                ♢ {usuario.rol}
              </span>
              <span className={styles.demo}>
                {usuario.institucion}
              </span>
            </div>

            <section className={styles.welcome}>
              <h1>Hola, {usuario.nombre}</h1>
              <p>Tu comunidad en acción</p>
            </section>

            <div className={styles.statusRow}>
              <span className={styles.online}>
                ● {conexion.enLinea
                  ? "En línea"
                  : "Sin conexión"}
              </span>

              <span className={styles.local}>
                ↻ {conexion.operacionesLocales} operaciones locales
              </span>
            </div>

            <section
              className={styles.stats}
              aria-label="Resumen de asistencia"
            >
              <article className={styles.stat}>
                <strong className={styles.number}>
                  {asistencia.inscritos}
                </strong>
                <h2>Inscritos</h2>
                <p>Taller de hoy</p>
              </article>

              <article className={styles.stat}>
                <strong className={styles.number}>
                  {asistencia.asistentes}
                </strong>
                <h2>Asistentes</h2>
                <p>
                  {asistencia.sincronizados} sincron. ·{" "}
                  {asistencia.locales} locales
                </p>
              </article>
            </section>

            <Link
              href={`/eventos/${evento.id}`}
              className={styles.eventCard}
            >
              <div className={styles.eventTop}>
                <span>
                  EVENTO DE HOY · {evento.estado.toUpperCase()}
                </span>
                <span aria-hidden="true">↗</span>
              </div>

              <h2>{evento.nombre}</h2>
              <p>
                {evento.horario} · {evento.lugar}
              </p>

              <div className={styles.eventBottom}>
                <span>
                  Próximo: {evento.proximo}
                </span>
                <span>{evento.fechaProximo}</span>
              </div>
            </Link>

            <section className={styles.management}>
              <h2>Gestión de la comunidad</h2>

              <div className={styles.actions}>
                {acciones.map((accion) => (
                  <Link
                    href={accion.ruta}
                    key={accion.ruta}
                    className={styles.actionCard}
                  >
                    <span
                      className={styles.actionIcon}
                      aria-hidden="true"
                    >
                      {accion.icono}
                    </span>
                    <span>{accion.nombre}</span>
                  </Link>
                ))}
              </div>
            </section>

            <p className={styles.note}>
              Asistencia del evento: {porcentaje}% ·
              Datos de demostración
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
