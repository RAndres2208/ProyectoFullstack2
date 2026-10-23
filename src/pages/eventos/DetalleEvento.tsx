
import { Link, useParams } from "wouter";
import { Menu } from "../../components/menu/Menu";
import { obtenerEvento } from "../../data/eventosData";
import styles from "./DetalleEvento.module.css";

type IconoProps = {
  tipo: "calendario" | "ubicacion" | "qr" | "check";
  size?: number;
};

function Icono({ tipo, size = 22 }: IconoProps) {
  const iconos = {
    calendario: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2" />
      </>
    ),
    ubicacion: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    qr: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
        <path d="M9 12h6" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
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
      {iconos[tipo]}
    </svg>
  );
}

export function DetalleEvento() {
  const params = useParams<{ id: string }>();
  const evento = obtenerEvento(params.id ?? "");

  if (!evento) {
    return (
      <div className={styles.layout}>
        <Menu />
        <main className={styles.noEncontrado}>
          <h1>Evento no encontrado</h1>
          <p>El evento solicitado no existe en los datos.</p>
          <Link href="/dashboard">Volver al inicio</Link>
        </main>
      </div>
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

            <h1>Detalle del evento</h1>

            <span className={styles.opciones} aria-hidden="true">
              ⋮
            </span>
          </header>

          <main className={styles.contenido}>
            <div className={styles.institucion}>
              <span className={styles.rol}>
                <Icono tipo="check" size={16} />
                Docente · Coordinador
              </span>
              <span className={styles.demo}>
                DUOC UC · DEMO
              </span>
            </div>

            <section className={styles.presentacion}>
              <span className={styles.estado}>
                <Icono tipo="check" size={16} />
                {evento.estado} · {evento.id.toUpperCase()}
              </span>

              <h2>{evento.nombre}</h2>

              <p className={styles.proyecto}>
                Proyecto {evento.proyecto} · {evento.unidadVecinal}
              </p>

              <p className={styles.descripcion}>
                {evento.descripcion}
              </p>
            </section>

            <section
              className={styles.informacion}
              aria-label="Información del evento"
            >
              <div className={styles.informacionFila}>
                <span className={styles.informacionIcono}>
                  <Icono tipo="calendario" />
                </span>
                <div>
                  <h3>{evento.fecha}</h3>
                  <p>
                    {evento.horario} · Duración: {evento.duracion}
                  </p>
                </div>
              </div>

              <div className={styles.informacionFila}>
                <span className={styles.informacionIcono}>
                  <Icono tipo="ubicacion" />
                </span>
                <div>
                  <h3>{evento.lugar}</h3>
                  <p>{evento.direccion}</p>
                </div>
              </div>
            </section>

            <section
              className={styles.estadisticas}
              aria-label="Estadísticas del evento"
            >
              <article className={styles.estadistica}>
                <strong>{evento.cuposMaximos}</strong>
                <span>Cupos máx.</span>
              </article>

              <article className={styles.estadistica}>
                <strong>{evento.inscritos}</strong>
                <span>Inscritos</span>
              </article>

              <article className={styles.estadistica}>
                <strong>{evento.asistentes}</strong>
                <span>Asistentes</span>
              </article>
            </section>

            <section
              className={styles.mapa}
              aria-label="Mapa esquemático de ubicación"
            >
              <div className={styles.calles} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className={styles.mapaContenido}>
                <div className={styles.mapaUbicacion}>
                  <Icono tipo="ubicacion" size={17} />
                  <strong>{evento.lugar}</strong>
                </div>
                <p>Mapa esquemático · ubicación simulada</p>
              </div>
            </section>

            <Link
              href="/escaner"
              className={styles.botonAsistencia}
            >
              <Icono tipo="qr" size={23} />
              Gestionar asistencia
            </Link>

            <p className={styles.nota}>
              Datos demostrativos · La gestión de asistencia
              se implementará en una próxima etapa.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
