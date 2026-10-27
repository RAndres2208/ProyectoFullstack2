
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "wouter";
import { Menu } from "../../components/menu/Menu";
import {
  proyectosData,
  type Proyecto,
} from "../../data/proyectosData";
import {
  obtenerProyectosApi,
  type ProyectoApi,
} from "../../services/proyectosApi";
import styles from "./Proyectos.module.css";

type Filtro = "Todos" | "En ejecución" | "Finalizados";

const filtros: Filtro[] = [
  "Todos",
  "En ejecución",
  "Finalizados",
];

function IconoProyecto({
  tipo,
}: {
  tipo: Proyecto["icono"];
}) {
  if (tipo === "computador") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="16" height="12" rx="2" />
        <path d="M2 20h20l-2-4H4l-2 4Z" />
      </svg>
    );
  }

  if (tipo === "planta") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21V11" />
        <path d="M12 16c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
        <path d="M12 12c0-5 3-8 8-8 0 5-3 8-8 8Z" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 5.5a5.5 5.5 0 0 0-8.5-.6 5.5 5.5 0 0 0-8.5.6c-3 4 0 8 8.5 15 8.5-7 11.5-11 8.5-15Z" />
      <path d="M3 12h5l2-3 3 7 2-4h6" />
    </svg>
  );
}

function IconoBuscar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function TarjetaProyecto({
  proyecto,
}: {
  proyecto: Proyecto;
}) {
  const estadoClase =
    proyecto.estado === "En ejecución"
      ? styles.estadoEjecucion
      : proyecto.estado === "Programado"
        ? styles.estadoProgramado
        : styles.estadoFinalizado;

  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      className={styles.tarjeta}
      aria-label={`Ver proyecto ${proyecto.nombre}`}
    >
      <div className={styles.tarjetaEncabezado}>
        <span className={styles.iconoProyecto}>
          <IconoProyecto tipo={proyecto.icono} />
        </span>

        <div className={styles.nombreGrupo}>
          <h2>{proyecto.nombre}</h2>
          <p>{proyecto.categoria}</p>
        </div>

        <span className={styles.flecha} aria-hidden="true">
          ›
        </span>
      </div>

      <p className={styles.ubicacion}>
        {proyecto.unidadVecinal} · {proyecto.sector}
      </p>

      <p className={styles.fechas}>
        {proyecto.fechaInicio} – {proyecto.fechaTermino}
      </p>

      <div className={styles.tarjetaPie}>
        <span className={`${styles.estado} ${estadoClase}`}>
          <span
            className={styles.estadoPunto}
            aria-hidden="true"
          />
          {proyecto.estado}
        </span>

        <span className={styles.eventos}>
          {proyecto.informacionEventos}
        </span>
      </div>
    </Link>
  );
}

export function Proyectos() {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  // Datos recibidos desde nuestro backend Spring Boot.
  const [proyectosApi, setProyectosApi] = useState<ProyectoApi[]>([]);
  const [mensajeApi, setMensajeApi] = useState("");
  const [cargandoApi, setCargandoApi] = useState(true);

  const autenticado = auth.isAuthenticated && Boolean(accessToken);

  // Consultar el backend usando el access token de Cognito.
  useEffect(() => {
    if (!autenticado || !accessToken) {
      return;
    }

    let cancelado = false;

    async function cargarProyectos() {
      try {
        const proyectos = await obtenerProyectosApi(accessToken!);

        if (cancelado) {
          return;
        }

        setProyectosApi(proyectos);
        setMensajeApi("Conexión exitosa con Spring Boot");
      } catch (error) {
        if (cancelado) {
          return;
        }

        setProyectosApi([]);
        setMensajeApi(
          error instanceof Error
            ? error.message
            : "No fue posible conectar con la API"
        );
      } finally {
        if (!cancelado) {
          setCargandoApi(false);
        }
      }
    }

    void cargarProyectos();

    return () => {
      cancelado = true;
    };
  }, [accessToken, autenticado]);

  const estadoApi = !autenticado
    ? auth.isLoading
      ? "Comprobando sesión de Cognito..."
      : "No hay una sesión autenticada disponible"
    : mensajeApi || "Conectando con Spring Boot...";

  const cargando = autenticado && cargandoApi;
  const proyectosApiVisibles = autenticado ? proyectosApi : [];

  // Conservamos los proyectos originales del diseño.
  const proyectosFiltrados = useMemo(() => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const texto = normalizar(busqueda);

    return proyectosData.filter((proyecto) => {
      const contenido = normalizar(
        [
          proyecto.nombre,
          proyecto.categoria,
          proyecto.unidadVecinal,
          proyecto.sector,
        ].join(" ")
      );

      const coincideBusqueda =
        !texto || contenido.includes(texto);

      const coincideFiltro =
        filtro === "Todos" ||
        (filtro === "En ejecución" &&
          proyecto.estado === "En ejecución") ||
        (filtro === "Finalizados" &&
          proyecto.estado === "Finalizado");

      return coincideBusqueda && coincideFiltro;
    });
  }, [busqueda, filtro]);

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            <Link
              href="/dashboard"
              className={styles.volver}
              aria-label="Volver al panel principal"
            >
              ←
            </Link>

            <h1>Proyectos comunitarios</h1>

            <span
              className={styles.menuDecorativo}
              aria-hidden="true"
            >
              ⋮
            </span>
          </header>

          <main className={styles.contenido}>
            <div className={styles.institucion}>
              <span className={styles.rol}>
                ◈ Docente · Coordinador
              </span>

              <span className={styles.demo}>
                DUOC UC · DEMO
              </span>
            </div>

            {/* Estado de conexión con la API */}
            <section
              role="status"
              aria-live="polite"
              className={styles.estadoApi}
            >
              <strong>Conexión con SyncPass API</strong>

              <p>Estado: {estadoApi}</p>

              <p>
                Proyectos recibidos desde Spring Boot:{" "}
                {proyectosApiVisibles.length}
              </p>

              {cargando && (
                <p>Consultando información...</p>
              )}

              {proyectosApiVisibles.length > 0 && (
                <ul>
                  {proyectosApiVisibles.map((proyecto) => (
                    <li key={proyecto.id}>
                      {proyecto.nombre} — {proyecto.estado}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className={styles.buscador}>
              <IconoBuscar />

              <input
                type="search"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                placeholder="Buscar proyecto o unidad vecinal"
                aria-label="Buscar proyectos"
              />
            </div>

            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar proyectos por estado"
            >
              {filtros.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={`${styles.filtro} ${
                    filtro === opcion
                      ? styles.filtroActivo
                      : ""
                  }`}
                  onClick={() => setFiltro(opcion)}
                  aria-pressed={filtro === opcion}
                >
                  {opcion}
                </button>
              ))}
            </div>

            <p className={styles.resumen}>
              {proyectosFiltrados.length}{" "}
              {proyectosFiltrados.length === 1
                ? "proyecto"
                : "proyectos"}{" "}
              · Vinculación con el medio
            </p>

            {proyectosFiltrados.length > 0 ? (
              <section
                className={styles.lista}
                aria-label="Listado de proyectos"
              >
                {proyectosFiltrados.map((proyecto) => (
                  <TarjetaProyecto
                    key={proyecto.id}
                    proyecto={proyecto}
                  />
                ))}
              </section>
            ) : (
              <div className={styles.sinResultados}>
                <h2>No encontramos proyectos</h2>

                <p>
                  Prueba con otro término o cambia el filtro.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setFiltro("Todos");
                  }}
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
